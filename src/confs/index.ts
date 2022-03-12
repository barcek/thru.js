/*
    Imports
*/

import path from 'path';

import { IThruConf } from '../types/index.js';
import { loadJSON, getFlagChecker } from '../utils/index.js';

/*
    Default segments
*/

let thruRoot: string = './thru';
let projectRoot: string = './';

const thruConfJSONFile: string = 'thru.conf.json';
const thruFileInfix = '.thru';

/*
    Argument separation
*/

const args: string[] = process.argv.slice(2);

const paths = args.filter(item => item[0] !== '-');
const flags = args.filter(item => item[0] === '-');

/*
    Segment arguments
*/

if (paths[0]) {
    thruRoot = paths[0];
};

if (paths[1]) {
    projectRoot = paths[1];
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
    Other options
*/

const checkFlag = getFlagChecker(flags);

const isVerbose = checkFlag(['--verbose', '-v']);

/*
    Exports
*/

export default {
    thruRootPath,
    projectRootPath,
    thruConf,
    thruFileInfix,
    isVerbose
};
