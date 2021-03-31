/*
    Imports
*/

import { promises as fs } from 'fs';

/*
    File utils
*/

const loadJSON = async <T>(JSONFilePath: string): Promise<T> => {
    let content;
    try {
        const buffer = await fs.readFile(JSONFilePath);
        content = JSON.parse(buffer.toString());
    } catch (err) {
        console.log(`NOTE: valid JSON file not found at path: ${JSONFilePath}.`);
        content = {};
    };
    return content;
};

const mkdir = async (targetFolderPath: string): Promise<void> => {
    await fs.mkdir(targetFolderPath);
};

const writeFile = async (targetFilePath: string, content: string): Promise<void> => {
    fs.writeFile(targetFilePath, content);
};

const copyFile = (extantFilePath: string, targetFilePath: string): void => {
    fs.copyFile(extantFilePath, targetFilePath);
};

/*
    Exports
*/

export {
    loadJSON,
    mkdir,
    writeFile,
    copyFile
};
