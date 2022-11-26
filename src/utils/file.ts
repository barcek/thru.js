/*
  Imports
*/

import path from 'path'
import { promises as fs, Dirent } from 'fs'

import { ITreeItem } from '../types/index.js'
import confs from '../confs/index.js'
import { hasOwnDir, listContents, reduceTree, confirmProceed } from './index.js'

/*
  File utils
*/

const formatAsTreeItems = (root: string, dirItems: Array<Dirent>): Array<ITreeItem> => {
  return dirItems.map(dirItem => {
    return {
      path: path.join(root, dirItem.name),
      type: dirItem.isDirectory() ? 'folder' : 'file'
    }
  })
}

const readTree = async (root: string, treeItems: Array<ITreeItem> = []): Promise<ITreeItem[]> => {

  const dirItems = await fs.readdir(root, { withFileTypes: true })

  treeItems = formatAsTreeItems(root, dirItems)

  for(let treeItem of treeItems) {
    if(treeItem.type === 'folder') treeItem.dir = await readTree(treeItem.path)
  }

  return treeItems
}

const loadJSON = async <T>(JSONFilePath: string): Promise<T> => {

  let content

  try {
    const buffer = await fs.readFile(JSONFilePath)
    content = JSON.parse(buffer.toString())

  }
  catch(err) {
    console.log(`! NOTE: valid JSON file not found at path: ${JSONFilePath}.`)
    content = {}
  }

  return content
}

const importFile = async (targetFilePath: string): Promise<any> => {
  return await import(targetFilePath)
}

const mkdir = async (targetFolderPath: string, treeItem: ITreeItem): Promise<boolean> => {

  try {
    await fs.mkdir(targetFolderPath)
    return true

  }
  catch(err) {

    const msgs = {
      error: `ERROR creating folder at path: ${targetFolderPath}.`,
      exist: 'Folder already exists.'
    }

    if(err instanceof Error && err.message.slice(0, 6) !== 'EEXIST') {
      console.log(`✕ ${msgs.error} ${err} Exiting.`)
      process.exit()
    }

    if(!hasOwnDir(treeItem)) {
      console.log(
        `! ${msgs.error} ${msgs.exist} Note: new folder has no contents. ` +
        'Result: existing folder retained, contents unmodified.'
      )
      return false
    }

    if(confs.doReplace) return false

    const targetDirItems: Array<Dirent> = await fs.readdir(targetFolderPath, { withFileTypes: true})
    const targetTreeItems = formatAsTreeItems(targetFolderPath, targetDirItems)
    const question = `? ${msgs.error} ${msgs.exist} ` +
      `${listContents('Existing folder', targetTreeItems)} ` +
      `${listContents('New folder', treeItem.dir as Array<ITreeItem>)} ` +
      `Continue using the existing folder? ` +
      'A new file will overwrite an existing file with the same name. ' +
      'NOTE: a filename with a thru infix changes before creation. ' +
      '(Enter y to continue or any other key to exit the generation process.) '

    if(await confirmProceed(question)) {
      console.log('Continuing...')
      return false
    }

    console.log('Exiting...')
    process.exit()
  }
}

const writeFile = async (targetFilePath: string, content: string): Promise<boolean> => {
  await fs.writeFile(targetFilePath, content)
  return true
}

const copyFile = async (extantFilePath: string, targetFilePath: string): Promise<boolean> => {
  await fs.copyFile(extantFilePath, targetFilePath)
  return true
}

/*
  Exports
*/

export {
  readTree,
  loadJSON,
  importFile,
  mkdir,
  writeFile,
  copyFile
}
