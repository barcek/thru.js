/*
    Imports
*/

import path from 'path';

import { thruRootPath, projectRootPath, thruConf, thruFileInfix } from '../confs/index.js';
import { ITreeItem } from '../types/index.js';
import { mkdir, writeFile, copyFile, switchRoot, removeBaseInfix, removeExt, readTree } from '../utils/index.js';

/*
    Constants
*/

const store = {} as Record<string, any>;

/*
    Subtasks
*/

const runStoredTasks = (): void => {
    const storeKeys = Object.keys(store);
    storeKeys.forEach(key => {
        key.includes('Task') && typeof store[key] === 'function'
            && store[key](thruConf, store);
    });
};

const addToStore = (items: Record<string, any>): void => {
    Object.assign(store, items);
};

const handleFolder = async (treeItem: ITreeItem): Promise<void> => {
    await mkdir(useProjectRoot(treeItem.path));
};

const getThruFileValues = (thruFile: Record<string, any>, path: string): Record<string, any> => {

    const values = {
        contentItems: [] as string[],
        itemsToStore: {} as Record<string, any>
    } as Record<string, any>;

    const resolverKeys = Object.keys(thruFile.default);
    const itemsForNext = {} as Record<string, any>;
    resolverKeys.forEach(key => {
        try {
            const { content = '', forNext = {}, ...toStore } =
                thruFile.default[key](thruConf, itemsForNext, store) || {};
            content && values.contentItems.push(content);
            forNext && Object.assign(itemsForNext, forNext);
            toStore && Object.assign(values.itemsToStore, toStore);
        } catch (err) {
            console.log(
                `ERROR in method '${key}' of thru file at path: ${path}. ` + err + '. ' +
                'Accumulated return values from file at error time in JSON format: ' +
                JSON.stringify(values) + '.'
            );
        };
    });
    return values;
};

const removeThruInfix = removeBaseInfix(thruFileInfix);
const useProjectRoot = switchRoot(thruRootPath)(projectRootPath);

const getDestFilePath = (treeItemPath: string): string => {
    return useProjectRoot(removeExt(removeThruInfix(treeItemPath)));
};

const handleThruFile = async (treeItem: ITreeItem): Promise<void> => {
    let thruFile;
    try {
        thruFile = await import(path.resolve(treeItem.path));
    } catch (err) {
        console.log(
            `ERROR importing thru file at path: ${treeItem.path}. ` + err + '. ' +
            'Result: target file not created & no items returned for storage.'
        );
        return;
    };
    const { contentItems, itemsToStore } = getThruFileValues(thruFile, treeItem.path);
    const destFilePath = getDestFilePath(treeItem.path);
    contentItems.length > 0 && await writeFile(destFilePath, contentItems.join('\n'));
    addToStore(itemsToStore);
};

const handleElseFile = async (treeItem: ITreeItem): Promise<void> => {
    await copyFile(treeItem.path, useProjectRoot(treeItem.path));
};

const handleFile = async (treeItem: ITreeItem): Promise<void> => {
    path.basename(treeItem.path).includes(thruFileInfix)
        ? await handleThruFile(treeItem)
        : await handleElseFile(treeItem);
};

const handleTreeItems = async (treeItems: ITreeItem[]): Promise<void> => {
    for (let treeItem of treeItems) {
        if (treeItem.type === 'folder') {
            await handleFolder(treeItem);
            await handleTreeItems(treeItem.dir as ITreeItem[]);
        };
        if (treeItem.type === 'file') {
            await handleFile(treeItem);
        };
    };
};

/*
    Tasks
*/

const generate = async (): Promise<void> => {
    const thruTree = await readTree(thruRootPath);
    await handleTreeItems(thruTree);
    runStoredTasks();
};

export default generate;
