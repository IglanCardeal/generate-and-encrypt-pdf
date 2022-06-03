import Handlebars from 'handlebars';
import pdf from 'html-pdf';
import { readFile } from 'fs';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  readFile('./template.hbs', (err, data) => {
    if (err) console.error(err);

    const html = compileAndGenerateHTML(data);

    const options = {
      type: 'pdf',
      format: 'A4',
      orientation: 'portrait'
    };

    pdf.create(html, options).toStream((err, buffer) => {
      if (err) return res.status(500).json(err);
      res.end(buffer);
    });
  });
});

const compileAndGenerateHTML = (data) => {
  const template = Handlebars.compile(data.toString());
  const params = {
    name: 'Luan Paiva',
    hometown: 'Belém',
    videogame: 'Playstation 5'
  };

  return template(params);
};

app.listen(3000, () => console.log('Server Up'));