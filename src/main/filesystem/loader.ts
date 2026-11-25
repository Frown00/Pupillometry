import fs from 'fs';

interface ILoadDataOptions {
  encoding?: BufferEncoding;
  commentChar?: string;
  dataHeaderKeyword?: string;
}

function isNodeError(error: Error): error is NodeJS.ErrnoException {
  return 'code' in error;
}

/**
 *
 * @param {string}  filePath  - system file path
 * @param {Object}  options
 * @param {string}  options.encoding  - character encoding
 * @param {char}    options.commentChar - in csv usually is '#'
 * @param {string}  options.dataHeaderKeyword - keyword pointing to data headers starts
 * @returns
 */
export default function loadData(
  filePath: string,
  options: ILoadDataOptions
): string {
  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (err) {
    if (err instanceof Error && isNodeError(err) && err.code === 'ENOENT') {
      throw new Error('File not found');
    }
    throw err;
  }
  const string = buffer.toString(options.encoding);
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
