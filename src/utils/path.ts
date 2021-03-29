/*
    Imports
*/

import path from 'path';

/*
    Path utils
*/

const switchRoot: (extantRoot: string, targetRoot: string) => (itemPath: string) => string = (extantRoot, targetRoot) => {
    return (itemPath) => {
        return path.normalize(itemPath.replace(extantRoot, targetRoot));
    };
};

const removeBaseInfix = (filePath: string, infix: string): string => {
    const { dir, base } = path.parse(filePath);
    return path.join(dir, base.replace(infix, ''));
};

const removeExt = (filePath: string): string => {
    const { dir, base, ext } = path.parse(filePath);
    return path.join(dir, base.replace(ext, ''));
};

/*
    Exports
*/

export {
    switchRoot,
    removeBaseInfix,
    removeExt
};
