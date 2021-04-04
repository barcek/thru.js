/*
    Imports
*/

import { ITreeItem } from '../types/index.js';

/*
    Tree utils
*/

const hasOwnDir = (treeItem: ITreeItem): boolean => {
    return (treeItem.dir && treeItem.dir.length > 0) || false;
};

const reduceTree:

    (reducer: (acc: any, treeItem: ITreeItem) => any) =>
    (initial: any) =>
    (treeItems: Array<ITreeItem>) => any

    = reducer => initial => treeItems => {

    return treeItems.reduce((acc, treeItem) => {

        acc = reducer(acc, treeItem)

        if (!hasOwnDir(treeItem)) {
            return acc;
        };

        return reduceTree(reducer)(acc)(treeItem.dir as Array<ITreeItem>);

    }, initial);
};

const handleTree:

    (handler: (treeItem: ITreeItem) => void) =>
    (treeItems: Array<ITreeItem>) => Promise<void>

    = handler => async treeItems => {

    for (let treeItem of treeItems) {

        await handler(treeItem);

        if (hasOwnDir(treeItem)) {
            await handleTree(handler)(treeItem.dir as Array<ITreeItem>);
        };
    };
};

/*
    Exports
*/

export {
    hasOwnDir,
    reduceTree,
    handleTree
};
