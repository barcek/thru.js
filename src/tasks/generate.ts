/*
  Imports
*/

import path from 'path'

import { IConfs, ITreeItem, IThruFile, IThruVals } from '../types/index.js'
import * as utils from '../utils/index.js'

/*
  Constants
*/

const store = {} as Record<string, any>

/*
  Utils
*/

const getDestPath = (confs: IConfs, path: string): string =>
  utils.switchRoot(confs.thruRootPath)(confs.projectRootPath)(path)

const getBasePath = (confs: IConfs, path: string): string =>
  utils.removeExt(utils.removeInfix(confs.thruFileInfix)(path))

const getBaseDestPath = (confs: IConfs, path: string): string =>
  getDestPath(confs, getBasePath(confs, path))

/*
  Subtasks - for store
*/

const runStoredTasks = async (confs: IConfs): Promise<void> => {
  const storeKeys = Object.keys(store)
  for(let key in storeKeys) {
    key.includes('Task') && typeof store[key] === 'function'
      && await store[key](confs.thruConf, store)
  }
}

const addToStore = (items: Record<string, any>): void => {
  Object.assign(store, items)
}

/*
  Subtasks - for thru files
*/

const runThruFileMethod = async (acc: IThruVals, entry: any[], path: string, confs: IConfs): Promise<IThruVals> => {
  const [ key, method ] = entry
  try {
    const { content = '', forNext = {}, isReady, isEmpty, ...toStore } =
      await method(confs.thruConf, acc.itemsForNext, store) || {}
    content && acc.contentItems.push(content)
    forNext && Object.assign(acc.itemsForNext, forNext)
    toStore && Object.assign(acc.itemsToStore, toStore)
    isEmpty && (acc.contentItems = []) && (acc.hasCompleted = isEmpty)
    isReady && (acc.hasCompleted = true)
  }
  catch(err) {
    acc.hasCompleted = true
    console.log(
      `✕ ERROR in method '${key}' of thru file at path: ${path}. ` + err + '. ' +
      'Accumulated return values from file at error time in JSON format: ' +
      JSON.stringify(acc, null, 2) + '.'
    )
  }
  return acc
}

const getThruFileValues = async (thruFile: IThruFile, path: string, confs: IConfs): Promise<IThruVals> => {
  let values = {
    contentItems: [] as string[],
    itemsToStore: {} as IThruVals,
    itemsForNext: { projectRootPath: confs.projectRootPath } as IThruVals,
    hasCompleted: false as boolean
  } as IThruVals
  const resolvers = Object.entries(thruFile.default) as Array<any[]>
  for(let resolver of resolvers) {
    if(values.hasCompleted) break
    values = await runThruFileMethod(values, resolver, path, confs)
  }
  return values
}

const importThruFile = async (thruFilePath: string): Promise<IThruFile> => {
  try {
    return await utils.importFile(path.resolve(thruFilePath))
  }
  catch(err) {
    console.log(
      `✕ ERROR importing thru file at path: ${thruFilePath}. ` + err + '. ' +
      'Result: target file not created & no items returned for storage.'
    )
    return {}
  }
}

const handleThruFile = async (treeItem: ITreeItem, confs: IConfs): Promise<void> => {
  const thruFile = await importThruFile(treeItem.path)
  if(Object.keys(thruFile).length === 0) return
  const { contentItems, itemsToStore, hasCompleted } =
    await getThruFileValues(thruFile, treeItem.path, confs)
  const destFilePath = getBaseDestPath(confs, treeItem.path)
  contentItems.length > 0
    ? await utils.writeFile(destFilePath, contentItems.join('\n'))
      && confs.isVerbose && console.log(`✓ ${treeItem.path} --> ${destFilePath}`)
    : console.log(
      `! NOTE: no content returned from file at path: ${treeItem.path}. ` +
      (typeof hasCompleted === 'string' ? hasCompleted + ' ' : '') +
      'Result: target file not created.'
    )
  addToStore(itemsToStore)
}

/*
  Subtasks - for folders & non-thru files
*/

const handleFolder = async (treeItem: ITreeItem, confs: IConfs): Promise<void> => {
  const destFolderPath = getDestPath(confs, treeItem.path)
  await utils.mkdir(destFolderPath, treeItem) && confs.isVerbose
    && console.log(`✓ ${treeItem.path} --> ${destFolderPath}`)
}

const handleNonThruFile = async (treeItem: ITreeItem, confs: IConfs): Promise<void> => {
  const destFilePath = getDestPath(confs, treeItem.path)
  await utils.copyFile(treeItem.path, destFilePath)
  confs.isVerbose && console.log(`✓ ${treeItem.path} --> ${destFilePath}`)
}

/*
  Subtasks - for all tree items
*/

const handleTreeItem: (confs: IConfs) => (treeItem: ITreeItem) => Promise<void> = confs => async treeItem => {
  treeItem.type === 'folder' && await handleFolder(treeItem, confs)
  if(treeItem.type === 'file') {
    path.basename(treeItem.path).includes(confs.thruFileInfix)
      ? await handleThruFile(treeItem, confs)
      : await handleNonThruFile(treeItem, confs)
  }
}

/*
  Task
*/

const generate = async (confs: IConfs): Promise<void> => {
  const thruTree = await utils.readTree(confs.thruRootPath)
  const handleThruTreeItem = handleTreeItem(confs)
  await utils.handleTree(handleThruTreeItem)(thruTree)
  await runStoredTasks(confs)
}

/*
  Export
*/

export default generate
