/*
    Imports
*/

import path from 'path';
import { promises as fs } from 'fs';

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

const mkdir = async (targetFolderPath: string): Promise<void> => {
    await fs.mkdir(targetFolderPath);
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
