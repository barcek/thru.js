/*
    Imports
*/

import { thruRootPath } from '../confs/index.js';
import { ITreeItem } from '../types/index.js';
import { readTree } from '../utils/index.js';

import generate from './generate.js';

/*
    Utils
*/

const readThruTree = async (): Promise<Array<ITreeItem>> => {
    console.log('Reading tree...');
    return await readTree(thruRootPath);
};

/*
    Tasks
*/

const tasks: Record<string, () => Promise<void>> = {
    generate: async function() {
        const thruTree = await readThruTree();
        await generate(thruTree);
    }
};

const run = async (task: string): Promise<void> => {
    await tasks[task]();
    console.log('Done.');
};

/*
    Export
*/

export default run;
