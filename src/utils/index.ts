/*
    Imports
*/

import { readTree, loadJSON, mkdir, writeFile, copyFile } from './file.js';
import { switchRoot, removeInfix, removeExt } from './path.js';
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
    removeInfix,
    removeExt,
    hasOwnDir,
    reduceTree,
    handleTree,
    confirmProceed
};
