/*
    Imports
*/

import path from 'path';
import { promises as fs } from 'fs';

import { ITreeItem } from '../types/index.js';
import { confirmProceed } from './index.js';

/*
    File utils
*/

const readTree = async (root: string, treeItems: Array<ITreeItem> = []): Promise<ITreeItem[]> => {

    const dirItems = await fs.readdir(root, { withFileTypes: true });

    treeItems = dirItems.map(dirItem => {
        return {
            path: path.join(root, dirItem.name),
            type: dirItem.isDirectory() ? 'folder' : 'file'
        };
    });

    for (let treeItem of treeItems) {
        if (treeItem.type === 'folder') {
            treeItem.dir = await readTree(treeItem.path);
        };
    };

    return treeItems;
};

const loadJSON = async <T>(JSONFilePath: string): Promise<T> => {

    let content;

    try {
        const buffer = await fs.readFile(JSONFilePath);
        content = JSON.parse(buffer.toString());

    } catch (err) {

        console.log(`NOTE: valid JSON file not found at path: ${JSONFilePath}.`);
        content = {};
    };

    return content;
};

const mkdir = async (targetFolderPath: string, hasOwnDir: boolean): Promise<boolean> => {

    try {
        await fs.mkdir(targetFolderPath);
        return true;

    } catch(err) {

        const msgs = {
            error: function() { return `ERROR creating folder at path: ${targetFolderPath}.`; },
            exist: function() { return 'Folder already exists.'; },
            check: function() {
                return `? ${this.error()} ${this.exist()} Continue in the existing folder? ` +
                'A file added within will overwrite any existing file with the same name. ' +
                '(Enter y to continue or any other key to exit the generation process.) '
            }
        };

        if (err.message.slice(0, 6) !== 'EEXIST') {
            console.log(`✕ ${msgs.error()} ${err} Exiting.`);
            process.exit();
        };
        if (!hasOwnDir) {
            console.log(
                `! ${msgs.error()} ${msgs.exist()} Note: new folder has no contents. ` +
                'Result: existing folder retained, contents unmodified.'
            );
            return false;
        };
        if (await confirmProceed(msgs.check())) {
            console.log('Continuing...');
            return false;
        };

        console.log('Exiting...');
        process.exit();
    };
};

const writeFile = async (targetFilePath: string, content: string): Promise<void> => {
    fs.writeFile(targetFilePath, content);
};

const copyFile = (extantFilePath: string, targetFilePath: string): void => {
    fs.copyFile(extantFilePath, targetFilePath);
};

/*
    Exports
*/

export {
    readTree,
    loadJSON,
    mkdir,
    writeFile,
    copyFile
};
