/*
  Imports
*/

import path from 'path'
import { promises as fs } from 'fs'

import sinon from 'sinon'

import generate from '../src/tasks/generate.ts'

/*
  Test values

   - confs
*/

const thruRootPath = path.resolve('test')
const projectRootPath = path.resolve('test/project')
const thruConf = { testKey: 'testValue' }

const confs = {

  thruRootPath,
  projectRootPath,
  thruConf,
  thruFileInfix: '.thru',
  isVerbose: false
}

/*
   - tree
*/

const names = {

  nonThruFile: 'nonThruFile',
  thruFile: 'test.thru.js', // present in test folder - dynamic import not stubbed
  thruFileBase: 'test',
  folder: 'folder',
}

const items = [

  {
    /* for readdir stub */
    name: names.nonThruFile,
    isDirectory: () => false,
    /* for copyFile stub */
    pathSrc: path.resolve(thruRootPath, names.nonThruFile),
    pathDest: path.resolve(projectRootPath, names.nonThruFile)
  },
  {
    /* for readdir stub */
    name: names.thruFile,
    isDirectory: () => false,
    /* for writeFile stub */
    pathDest: path.resolve(projectRootPath, names.thruFileBase)
  },
  {
    /* for readdir stub */
    name: names.folder,
    isDirectory: () => true,
    pathRoot: path.resolve(thruRootPath, names.folder),
    /* for mkdir stub */
    pathDest: path.resolve(projectRootPath, names.folder),
    items: [

      {
        /* for readdir stub */
        name: names.nonThruFile,
        isDirectory: () => false,
        /* for copyFile stub */
        pathSrc: path.resolve(thruRootPath, names.folder, names.nonThruFile),
        pathDest: path.resolve(projectRootPath, names.folder, names.nonThruFile)
      }
    ]
  }
]

/*
  Stubs
*/

const getItems = root => {

  if (root === thruRootPath) { // is top-level
    return items
  }
  if (root == items[2].pathRoot) { // is nested
    return items[2].items
  }
  return []
}

const getStubs = () => {

  return {
    readdir: sinon.stub(fs, 'readdir').callsFake((root, options) => getItems(root)),
    writeFile: sinon.stub(fs, 'writeFile').callsFake((path, content) => {}),
    copyFile: sinon.stub(fs, 'copyFile').callsFake((srcPath, destPath) => {}),
    mkdir: sinon.stub(fs, 'mkdir').callsFake(path => {})
  }
}

afterEach(() => {
  sinon.restore()
})

/*
  Assertions
*/

describe('generate', () => {

  it('generates a project (reads a directory, imports a thru file and creates items)', async () => {

    const stubs = getStubs()
    await generate(confs)

    /* reads a thru directory - fs method stubbed */
    sinon.assert.calledWith(stubs.readdir, thruRootPath, { withFileTypes: true })

    /* copies a non-thru file - fs method stubbed */
    sinon.assert.calledWith(stubs.copyFile, items[0].pathSrc, items[0].pathDest)

    /* writes a thru file (dynamically imported) - fs method stubbed */
    sinon.assert.calledWith(stubs.writeFile, items[1].pathDest, thruConf.testKey)

    /* creates a folder and copies a nested non-thru file - fs methods stubbed */
    sinon.assert.calledWith(stubs.mkdir, items[2].pathDest)
    sinon.assert.calledWith(stubs.copyFile, items[2].items[0].pathSrc, items[2].items[0].pathDest)
  })
})
