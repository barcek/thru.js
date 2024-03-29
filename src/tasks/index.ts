/*
  Imports
*/

import confs from '../confs/index.js'
import generate from './generate.js'

/*
  Tasks
*/

const tasks: Record<string, () => Promise<void>> = {
  generate: async function() {
    confs.isVerbose && console.log('Generating...')
    await generate(confs)
  }
}

/*
  Runner
*/

const run = async (task: string): Promise<void> => {
  await tasks[task]()
  confs.isVerbose && console.log('Done.')
}

/*
  Export
*/

export default run
