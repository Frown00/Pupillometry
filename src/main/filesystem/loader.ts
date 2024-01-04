import fs from 'fs';

type Options = {
  dataHeaderKeyword: string;
  commentChar: string;
  encoding: BufferEncoding;
};

/**
 *
 * @param {string}  filePath  - system file path
 * @param {Options}  options - object with config options
 * @param {string}  options.encoding  - character encoding
 * @param {char}    options.commentChar - in csv usually is '#'
 * @param {string}  options.dataHeaderKeyword - keyword pointing to data headers starts
 * @returns
 */
export default function loadData(filePath: string, options: Options) {
  let buffer = null;
  try {
    buffer = fs.readFileSync(filePath, { encoding: options.encoding });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error('File not found');
    } else {
      throw err;
    }
  }
  const string = buffer.toString();
  if (!options.dataHeaderKeyword) return string;
  if (!options.commentChar) return string;

  let isDataKeyword = false;
  let index = 0;
  for (let i = 0; i < string.length; i += 1) {
    if (string[i] === options.commentChar) {
      const name =
        string[i + 1] + string[i + 2] + string[i + 3] + string[i + 4];
      if (name === options.dataHeaderKeyword) {
        isDataKeyword = true;
        i += options.dataHeaderKeyword.length;
      }
    } else if (isDataKeyword) {
      if (/^[a-zA-Z0-9]+$/.test(string[i])) {
        index = i;
        break;
      }
    }
  }
  return string.substring(index);
}
