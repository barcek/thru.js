/*
    Imports
*/

import path from 'path';

import { thruRootPath, projectRootPath, thruConf, thruFileInfix } from '../confs/index.js';
import { ITreeItem, IThruFile, IThruVals } from '../types/index.js';
import { mkdir, writeFile, copyFile, switchRoot, removeInfix, removeExt, handleTree } from '../utils/index.js';

/*
    Constants
*/

const store = {} as Record<string, any>;

/*
    Utils, partials
*/

const removeThruInfix = removeInfix(thruFileInfix);

const useProjectRoot = switchRoot(thruRootPath)(projectRootPath);

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

const runThruFileMethod = (acc: IThruVals, entry: any[], path: string): IThruVals => {
    const [ key, method ] = entry;
    try {
        const { content = '', forNext = {}, isReady, isEmpty, ...toStore } =
            method(thruConf, acc.itemsForNext, store) || {};
        content && acc.contentItems.push(content);
        forNext && Object.assign(acc.itemsForNext, forNext);
        toStore && Object.assign(acc.itemsToStore, toStore);
        isEmpty && (acc.contentItems = []) && (acc.hasCompleted = isEmpty);
        isReady && (acc.hasCompleted = true);
    } catch (err) {
        console.log(
            `✕ ERROR in method '${key}' of thru file at path: ${path}. ` + err + '. ' +
            'Accumulated return values from file at error time in JSON format: ' +
            JSON.stringify(acc, null, 2) + '.'
        );
    };
    return acc;
};

const getThruFileValues = (thruFile: IThruFile, path: string): IThruVals => {
    let values = {
        contentItems: [] as string[],
        itemsToStore: {} as IThruVals,
        itemsForNext: {} as IThruVals,
        hasCompleted: false as boolean
    } as IThruVals;
    const resolvers = Object.entries(thruFile.default) as Array<any[]>;
    values = resolvers.reduce((acc: IThruVals, entry: any[]): IThruVals => {
        if (acc.hasCompleted) {
            return acc;
        };
        return runThruFileMethod(acc, entry, path);
    }, values);
    return values;
};

const importThruFile = async (thruFilePath: string): Promise<IThruFile> => {
    try {
        return await import(path.resolve(thruFilePath));
    } catch (err) {
        console.log(
            `✕ ERROR importing thru file at path: ${thruFilePath}. ` + err + '. ' +
            'Result: target file not created & no items returned for storage.'
        );
        return {};
    };
};

const handleThruFile = async (treeItem: ITreeItem): Promise<void> => {
    const thruFile = await importThruFile(treeItem.path);
    if (Object.keys(thruFile).length === 0) {
        return;
    };
    const { contentItems, itemsToStore, hasCompleted } =
        getThruFileValues(thruFile, treeItem.path);
    const destFilePath = useProjectRoot(removeExt(removeThruInfix(treeItem.path)));
    contentItems.length > 0
        ? await writeFile(destFilePath, contentItems.join('\n')) &&
          console.log(`✓ ${treeItem.path} --> ${destFilePath}`)
        : console.log(
            `! NOTE: no content returned from file at path: ${treeItem.path}. ` +
            (typeof hasCompleted === 'string' ? hasCompleted + ' ' : '') +
            'Result: target file not created.'
          );
    addToStore(itemsToStore);
};

/*
    Subtasks - for folders & non-thru files
*/

const handleFolder = async (treeItem: ITreeItem): Promise<void> => {
    const destFolderPath = useProjectRoot(treeItem.path);
    await mkdir(destFolderPath, treeItem)
        && console.log(`✓ ${treeItem.path} --> ${destFolderPath}`);
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
