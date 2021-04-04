/*
    Imports
*/

import { ITreeItem } from '../types/index.js';

/*
    Tree utils
*/

const reduceTree:

    (reducer: (acc: any, treeItem: ITreeItem) => any) =>
    (initial: any) =>
    (treeItems: Array<ITreeItem>) => any

    = reducer => initial => treeItems => {

    return treeItems.reduce((acc, treeItem) => {

        acc = reducer(acc, treeItem)

        if (!treeItem.dir || treeItem.dir.length === 0) {
            return acc;
        };

        return reduceTree(reducer)(acc)(treeItem.dir);

    }, initial);
};

const handleTree:

    (handler: (treeItem: ITreeItem) => void) =>
    (treeItems: Array<ITreeItem>) => Promise<void>

    = handler => async treeItems => {

    for (let treeItem of treeItems) {

        await handler(treeItem);

        if (treeItem.dir && treeItem.dir.length > 0) {
            await handleTree(handler)(treeItem.dir);
        };
    };
};

/*
    Exports
*/

export {
    reduceTree,
    handleTree
};
