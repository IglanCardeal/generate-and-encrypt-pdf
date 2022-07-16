import { readFile } from 'fs/promises';

/**
 * Check if the template data is cached.
 * @param {*} cache 
 * @param {*} templatePath 
 * @returns 
 */
export const getTemplateData = async (cache, templatePath) => {
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
 * Check if the all required params field are valid. 
 * @param {*} params 
 */
export const checkParams = (params) => {
  Object.keys(params).forEach(key => {
    if ([undefined, null, ''].includes(key)) throw new Error(`Invalid param: ${key} can not be undefined, null or ''`);
  });
};