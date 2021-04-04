/*
    Imports
*/

import { readTree, loadJSON, mkdir, writeFile, copyFile } from './file.js';
import { switchRoot, removeBaseInfix, removeExt } from './path.js';
import { hasOwnDir, reduceTree, handleTree } from './tree.js';
import { confirmProceed } from './user.js';

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
    hasOwnDir,
    reduceTree,
    handleTree,
    confirmProceed
};
