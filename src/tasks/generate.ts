/*
    Imports
*/

import path from 'path';

import { thruRootPath, projectRootPath, thruConf, thruFileInfix } from '../confs/index.js';
import { ITreeItem } from '../types/index.js';
import { mkdir, writeFile, copyFile, switchRoot, removeInfix, removeExt, hasOwnDir, handleTree } from '../utils/index.js';

/*
    Constants
*/

const store = {} as Record<string, any>;

/*
    Subtasks - for store
*/

const runStoredTasks = async (): Promise<void> => {
    const storeKeys = Object.keys(store);
    for (let key in storeKeys) {
        key.includes('Task') && typeof store[key] === 'function'
            && await store[key](thruConf, store);
    };
};

const addToStore = (items: Record<string, any>): void => {
    Object.assign(store, items);
};

/*
    Subtasks - for thru files
*/

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
                `✕ ERROR in method '${key}' of thru file at path: ${path}. ` + err + '. ' +
                'Accumulated return values from file at error time in JSON format: ' +
                JSON.stringify(values) + '.'
            );
        };
    });
    return values;
};

const removeThruInfix = removeInfix(thruFileInfix);

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
            `✕ ERROR importing thru file at path: ${treeItem.path}. ` + err + '. ' +
            'Result: target file not created & no items returned for storage.'
        );
        return;
    };
    const { contentItems, itemsToStore } = getThruFileValues(thruFile, treeItem.path);
    const destFilePath = getDestFilePath(treeItem.path);
    contentItems.length > 0 && await writeFile(destFilePath, contentItems.join('\n'));
    console.log(`✓ ${treeItem.path} --> ${destFilePath}`);
    addToStore(itemsToStore);
};

/*
    Subtasks - for folders & non-thru files
*/

const handleFolder = async (treeItem: ITreeItem): Promise<void> => {
    const destFolderPath = useProjectRoot(treeItem.path);
    const isMade = await mkdir(destFolderPath, hasOwnDir(treeItem));
    isMade && console.log(`✓ ${treeItem.path} --> ${destFolderPath}`);
};

const handleNonThruFile = async (treeItem: ITreeItem): Promise<void> => {
    const destFilePath = useProjectRoot(treeItem.path);
    await copyFile(treeItem.path, destFilePath);
    console.log(`✓ ${treeItem.path} --> ${destFilePath}`);
};

/*
    Subtasks - for all tree items
*/

const handleTreeItem = async (treeItem: ITreeItem): Promise<void> => {
    treeItem.type === 'folder' && await handleFolder(treeItem);
    if (treeItem.type === 'file') {
        path.basename(treeItem.path).includes(thruFileInfix)
            ? await handleThruFile(treeItem)
            : await handleNonThruFile(treeItem);
    };
};

const handleTreeItems = handleTree(handleTreeItem);

/*
    Task
*/

const generate = async (thruTree: Array<ITreeItem>): Promise<void> => {
    console.log('Generating...');
    await handleTreeItems(thruTree);
    await runStoredTasks();
};

/*
    Export
*/

export default generate;
