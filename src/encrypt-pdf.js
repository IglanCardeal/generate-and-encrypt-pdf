import hummus from 'hummus';
import stream from 'memory-streams';

export const encryptBase64PDF = (buffer, secureOptions) => {
  const inStream = new hummus.PDFRStreamForBuffer(buffer);
  const inMemoryStream = new stream.WritableStream();
  const outStream = new hummus.PDFStreamForResponse(inMemoryStream);
  hummus.recrypt(inStream, outStream, secureOptions);

  return outStream.response.toBuffer().toString('base64');
};

export const encryptPDFHandleStream = (buffer, secureOptions, res) => {
  const inStream = new hummus.PDFRStreamForBuffer(buffer);
  const outStream = new hummus.PDFStreamForResponse(res);
  hummus.recrypt(inStream, outStream, secureOptions);

  return res.end();
};