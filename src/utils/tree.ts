/*
  Imports
*/

import path from 'path'

import { ITreeItem } from '../types/index.js'
import { quoteItems, createList, sIfMultiple } from './index.js'

/*
  Tree utils
*/

const hasOwnDir = (treeItem: ITreeItem): boolean => {
  return (treeItem.dir && treeItem.dir.length > 0) || false
}

const getBasenames = (treeItems: Array<ITreeItem>): string[] => {
  return treeItems.map(treeItem => path.basename(treeItem.path))
}

const listContents = (folderName: string, treeItems: Array<ITreeItem>): string => {

  const { folders, files } = separateContents({ folders: [], files: [] })(treeItems)

  if(folders.length === 0 && files.length === 0) return ''

  const folderPassage = folders.length > 0
    ? `folder${sIfMultiple(folders)} ${createList(quoteItems(getBasenames(folders)))}`
    : ''
  const filePassage = files.length > 0
    ? `file${sIfMultiple(files)} ${createList(quoteItems(getBasenames(files)))}`
    : ''
  const conj = folders.length > 0 && files.length > 0 ? ' & ' : ''

  return `${folderName} contains ` + folderPassage + conj + filePassage + '.'
}

/*
  - reduceTree
*/

const reduceTree:

  (reducer: (acc: any, treeItem: ITreeItem) => any) =>
  (initial: any) =>
  (treeItems: Array<ITreeItem>) => any

  = reducer => initial => treeItems => {

  return treeItems.reduce((acc, treeItem) => {

    acc = reducer(acc, treeItem)
    if(!hasOwnDir(treeItem)) return acc
    return reduceTree(reducer)(acc)(treeItem.dir as Array<ITreeItem>)

  }, initial)
}

/*
  - reducers
*/

const assignTreeItem = (acc: Record<string, ITreeItem[]>, treeItem: ITreeItem): Record<string, ITreeItem[]> => {
  treeItem.type === 'folder' && acc.folders.push(treeItem)
  treeItem.type === 'file' && acc.files.push(treeItem)
  return acc
}

/*
  - partials
*/

const separateContents = reduceTree(assignTreeItem)

/*
  - handleTree
*/

const handleTree:

  (handler: (treeItem: ITreeItem) => void) =>
  (treeItems: Array<ITreeItem>) => Promise<void>

  = handler => async treeItems => {

  for(let treeItem of treeItems) {
    await handler(treeItem)
    if(hasOwnDir(treeItem)) await handleTree(handler)(treeItem.dir as Array<ITreeItem>)
  }
}

/*
  Exports
*/

export {
  hasOwnDir, getBasenames, listContents,
  reduceTree, separateContents,
  handleTree
}
