/*
    Imports
*/

import path from 'path';

import { IThruConf } from '../types/index.js';
import { loadJSON } from '../utils/index.js';

/*
    Default segments
*/

let thruRoot: string = './thru';
let projectRoot: string = './';

const thruConfJSONFile: string = 'thru.conf.json';
const thruFileInfix = '.thru';

/*
    Segment arguments
*/

const args: string[] = process.argv.slice(2);

if (args[0]) {
    thruRoot = args[0];
};

if (args[1]) {
    projectRoot = args[1];
};

/*
    Path resolutions
*/

const PWD: string = process.env.PWD || './';

const thruRootPath: string = path.resolve(PWD, thruRoot);
const projectRootPath: string = path.resolve(PWD, projectRoot);
const thruConfJSONFilePath: string = path.resolve(projectRoot, thruConfJSONFile);

/*
    Conf file loading
*/

const thruConf = await loadJSON<IThruConf>(thruConfJSONFilePath);

/*
    Exports
*/

export default {
    thruRootPath,
    projectRootPath,
    thruConf,
    thruFileInfix
};
