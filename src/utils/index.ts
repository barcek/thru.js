/*
    Imports
*/

import { readTree, loadJSON, mkdir, writeFile, copyFile } from './file.js';
import { switchRoot, removeBaseInfix, removeExt } from './path.js';
import { reduceTree, handleTree } from './tree.js';

/*
    Exports
*/

export {
    readTree,
    loadJSON,
    mkdir,
    writeFile,
    copyFile,
    switchRoot,
    removeBaseInfix,
    removeExt,
    reduceTree,
    handleTree
};
