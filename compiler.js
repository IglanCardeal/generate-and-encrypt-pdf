import Handlebars from 'handlebars';

/**
 * Compile the data from template (HTML or Handlebars) file.
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export const compileAndGenerateHTML = (data, params) => {
  const template = Handlebars.compile(data.toString());

  if (!params) {
    return template();
  }

  return template(params);
};