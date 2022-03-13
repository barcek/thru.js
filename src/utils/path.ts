/*
  Imports
*/

import path from 'path';

/*
  Path utils
*/

const switchRoot: (extantRoot: string) => (targetRoot: string) => (itemPath: string) => string
  = (extantRoot) => (targetRoot) => {
  return (itemPath) => {
    return path.normalize(itemPath.replace(extantRoot, targetRoot));
  };
};

const removeInfix: (infix: string) => (filePath: string) => string
  = (infix) => (filePath) => {
  const { dir, base } = path.parse(filePath);
  return path.join(dir, base.replace(infix, ''));
};

const removeExt = (filePath: string, exts: string[] = []): string => {
  const { dir, name, ext } = path.parse(filePath);
  if (exts.length > 0 && !exts.includes(ext)) {
    return filePath;
  };
  return path.join(dir, name);
};

/*
  Exports
*/

export {
  switchRoot,
  removeInfix,
  removeExt
};
