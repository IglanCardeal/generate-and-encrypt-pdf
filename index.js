import express from 'express';
import {
  pdfCreateToBufferAsync,
  pdfCreateToStreamAsync,
  getTemplateData,
  checkParams,
  compileAndGenerateHTML,
  encryptBase64PDF,
  encryptPDFHandleStream
} from './src/index.js';

const app = express();

app.use(express.json());

const cache = new Map();

/**
 * Generate a PDF from a static HTML template
 */
app.get('/static', async (req, res) => {
  try {
    const templatePath = './pdf-templates/static.html';
    const data = await getTemplateData(cache, templatePath);
    const dataBuffer = Buffer.from(data, 'base64');
    const html = compileAndGenerateHTML(dataBuffer);
    const options = {
      type: 'pdf',
      format: 'A4',
      orientation: 'portrait'
    };

    res.setHeader('Content-Type', 'application/pdf');

    const stream = await pdfCreateToStreamAsync(html, options);
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

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

  try {
    const templatePath = './pdf-templates/dynamic.hbs';
    const data = await getTemplateData(cache, templatePath);
    const dataBuffer = Buffer.from(data, 'base64');
    const html = compileAndGenerateHTML(dataBuffer, params);
    const options = {
      type: 'pdf',
      format: 'A4',
      orientation: 'portrait'
    };
    const buffer = await pdfCreateToBufferAsync(html, options);

    const secureOptions = secure
      ? {
        userPassword: password,
        ownerPassword: password,
        userProtectionFlag: '4'
      }
      : {};

    res.setHeader('Content-Type', 'application/pdf');

    encryptPDFHandleStream(buffer, secureOptions, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

app.get('/64', async (req, res) => {
  const paramsExample = {
    tool: 'Node.js',
    location: 'here',
    name: 'Iglan',
    secure: true,
    password: 'aaa'
  };
  const templatePath = './pdf-templates/dynamic.hbs';

  try {
    const data = await getTemplateData(cache, templatePath);
    const dataBuffer = Buffer.from(data, 'base64');
    const html = compileAndGenerateHTML(dataBuffer, paramsExample);
    const options = {
      type: 'pdf',
      format: 'A4',
      orientation: 'portrait'
    };

    const buffer = await pdfCreateToBufferAsync(html, options);

    const secureOptions = {
      userPassword: paramsExample.password,
      ownerPassword: paramsExample.password,
      userProtectionFlag: '4'
    };

    const base64string = encryptBase64PDF(buffer, secureOptions);
    const fileName = Date.now();

    res.status(200).send(`
        <a
          href="data:application/pdf;base64,${base64string}"
          download="${fileName}.pdf"
        >Download PDF</a>
      `);

    // Or a JSON Base64 response below

    // res.status(200).json({
    //   pdf: base64string
    // });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => console.log('Server Up'));
