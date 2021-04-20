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

const removeExt = (filePath: string): string => {
    const { dir, name } = path.parse(filePath);
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
