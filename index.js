import Handlebars from 'handlebars';
import pdf from 'html-pdf';
import { readFile } from 'fs/promises';
import express from 'express';
import hummus from 'hummus';
import stream from 'memory-streams';
import { Writable } from 'stream';

const app = express();

app.use(express.json());

const cache = new Map();

const getTemplateData = async (cache, templatePath) => {
  if (!templatePath) throw new Error('Template path not provided.');
  if (!(cache instanceof Map)) throw new TypeError('Cache is not a instance of Map');
  if (!cache.get(templatePath)) {
    const data = await readFile(templatePath);
    cache.set(templatePath, data.toString('base64'));
    console.log('Saving template data on cache');
    return data;
  } else {
    console.log('Serving template from cache');
    return cache.get(templatePath);
  }
};

/**
 * Generate a PDF from a static HTML template 
 */
app.get('/static', async (req, res) => {
  const templatePath = './pdf-templates/static.html';

  let data;
  try {
    data = await getTemplateData(cache, templatePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }

  const html = compileAndGenerateHTML(Buffer.from(data, 'base64'));
  const options = {
    type: 'pdf',
    format: 'A4',
    orientation: 'portrait'
  };

  res.setHeader('Content-Type', 'application/pdf');

  pdf.create(html, options).toStream((err, stream) => {
    if (err) return res.status(500).json({ message: 'Error while generate PDF file' });
    stream.pipe(res);
  });
});

const checkParams = (params) => {
  Object.keys(params).forEach(key => {
    if ([undefined, null, ''].includes(key)) throw new Error(`Invalid param: ${key} can not be undefined, null or ''`);
  });
};

/**
 * Generate a PDF from a dynamic Handlebars template file and optionaly
 * add a secure password requirement.
 */
app.post('/dynamic', async (req, res) => {
  const { tool, location, name, password, secure } = req.body;
  const params = { tool, location, name, secure };

  try {
    checkParams(params);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const templatePath = './pdf-templates/dynamic.hbs';

  let data;
  try {
    data = await getTemplateData(cache, templatePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }

  data = Buffer.from(data, 'base64');

  const html = compileAndGenerateHTML(data, params);
  const options = {
    type: 'pdf',
    format: 'A4',
    orientation: 'portrait'
  };

  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) return res.status(500).json({ err });

    let options;

    if (secure) {
      options = {
        userPassword: password,
        ownerPassword: password,
        userProtectionFlag: '4'
      };
    }

    res.setHeader('Content-Type', 'application/pdf');

    const inStream = new hummus.PDFRStreamForBuffer(buffer);
    const outStream = new hummus.PDFStreamForResponse(res);
    hummus.recrypt(inStream, outStream, options);

    res.end();
  });
});

app.get('/64', async (req, res) => {
  const paramsExample = { tool: 'Node.js', location: 'here', name: 'Iglan', secure: true, password: 'aaa' };

  const templatePath = './pdf-templates/dynamic.hbs';

  let data;
  try {
    data = await getTemplateData(cache, templatePath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }

  data = Buffer.from(data, 'base64');

  const html = compileAndGenerateHTML(data, paramsExample);
  const options = {
    type: 'pdf',
    format: 'A4',
    orientation: 'portrait'
  };

  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) return res.status(500).json({ err });

    const options = {
      userPassword: paramsExample.password,
      ownerPassword: paramsExample.password,
      userProtectionFlag: '4'
    };

    const inStream = new hummus.PDFRStreamForBuffer(buffer);
    const inMemoryStream = new stream.WritableStream();
    const outStream = new hummus.PDFStreamForResponse(inMemoryStream);
    hummus.recrypt(inStream, outStream, options);

    const base64string = outStream.response.toBuffer().toString('base64');
    const fileName = Date.now();

    res.status(200).send(`
      <a
        href="data:application/pdf;base64,${base64string}"
        download="${fileName}.pdf"
      >Download PDF</a>
    `);

    // Or a JSON Base64 response below

    // res.status(200).json({
    //   pdf: outStream.response.toBuffer().toString('base64')
    // });
  });
});

const compileAndGenerateHTML = (data, params) => {
  const template = Handlebars.compile(data.toString());

  if (!params) {
    return template();
  }

  return template(params);
};

app.listen(3000, () => console.log('Server Up'));