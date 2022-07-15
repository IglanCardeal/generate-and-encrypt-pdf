import Handlebars from 'handlebars';
import pdf from 'html-pdf';
import { readFile } from 'fs/promises';
import express from 'express';
import hummus from 'hummus';
import stream from 'memory-streams';

const app = express();

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
    return res.status(500).send(error.message);
  }

  const html = compileAndGenerateHTML(Buffer.from(data, 'base64'));
  const options = {
    type: 'pdf',
    format: 'A4',
    orientation: 'portrait'
  };

  res.setHeader('Content-Type', 'application/pdf');

  pdf.create(html, options).toStream((err, stream) => {
    if (err) return res.status(500).send('Error while generate PDF file');
    stream.pipe(res);
  });
});


app.get('/dynamic', async (req, res) => {
  const templatePath = './pdf-templates/dynamic.hbs';

  let data;
  try {
    data = await getTemplateData(cache, templatePath);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }

  const html = compileAndGenerateHTML(Buffer.from(data, 'base64'));
  const options = {
    type: 'pdf',
    format: 'A4',
    orientation: 'portrait'
  };

  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) return res.status(500).json(err);
    const options = {
      userPassword: '1',
      ownerPassword: '1',
      userProtectionFlag: '4'
    };
    res.setHeader('Content-Type', 'application/pdf');
    const inStream = new hummus.PDFRStreamForBuffer(buffer);
    const outStream = new hummus.PDFStreamForResponse(res);
    hummus.recrypt(inStream, outStream, options);
    res.end();
  });
});

// app.get('/static', async (req, res) => {
//   if (!cache.get('template')) {
//     const data = await readFile('./template.hbs')
//     cache.set('template', data.toString('base64'))
//   } else {
//     console.log('Serving template from cache')
//   }

//   const data = cache.get('template')
//   const html = compileAndGenerateHTML(Buffer.from(data, 'base64'))
//   const options = {
//     type: 'pdf',
//     format: 'A4',
//     orientation: 'portrait'
//   }

//   pdf.create(html, options).toBuffer((err, buffer) => {
//     if (err) return res.status(500).json(err)
//     const options = {
//       userPassword: '1',
//       ownerPassword: '1',
//       userProtectionFlag: '4'
//     }
//     res.setHeader('Content-Type', 'application/pdf')
//     const inStream = new hummus.PDFRStreamForBuffer(buffer)
//     const outStream = new hummus.PDFStreamForResponse(res)
//     hummus.recrypt(inStream, outStream, options)
//     res.end()
//   })
// })

const compileAndGenerateHTML = (data, params) => {
  const template = Handlebars.compile(data.toString());

  if (!params) {
    return template();
  }

  return template(params);
};

app.listen(3000, () => console.log('Server Up'));

// pdf.create(html, options).toBuffer((err, buffer) => {
//   if (err) return res.status(500).json(err)
//   const options = {
//     userPassword: '1',
//     ownerPassword: '1',
//     userProtectionFlag: '4'
//   }
//   res.setHeader('Content-Type', 'application/pdf')
//   // res.setHeader(
//   //   'Content-Disposition',
//   //   'attachment; filename=carta-minuta.pdf'
//   // )
//   // const inputStream = new hummus.PDFRStreamForBuffer(buffer)
//   // const inMemoryStream = new stream.WritableStream()
//   // const outputStream = new hummus.PDFStreamForResponse(inMemoryStream)
//   // hummus.recrypt(inputStream, outputStream, options)
//   // // res.end()
//   // res.json({ response: outputStream.response.toBuffer().toString('base64') })
//   const inStream = new hummus.PDFRStreamForBuffer(buffer)
//   // const ws = new stream.WritableStream()
//   const outStream = new hummus.PDFStreamForResponse(res)
//   hummus.recrypt(inStream, outStream, options)
//   // res.json({ response: outStream.response.toBuffer().toString('base64') })
//   res.end()
// })