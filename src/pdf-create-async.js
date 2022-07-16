import pdf from 'html-pdf';

export const pdfCreateToBufferAsync = (html, options) => {
  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) reject(err);
      resolve(buffer);
    });
  });
};

export const pdfCreateToStreamAsync = (html, options) => {
  return new Promise((resolve, reject) => {
    pdf.create(html, options).toStream((err, stream) => {
      if (err) reject(err);
      resolve(stream);
    });
  });
};