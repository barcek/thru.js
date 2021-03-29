/*
    Imports
*/

import path from 'path';
import { promises as fs } from 'fs';

import { ITreeItem } from '../types/index.js';

/*
    Tree utils
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

/*
    Exports
*/

export {
    readTree
};
