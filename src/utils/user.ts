/*
    Imports
*/

import readline from 'readline';

/*
    Constants
*/

const readlineIO = {
    input: process.stdin,
    output: process.stdout
};

/*
    User utils
*/

const getFlagChecker: (flagsPassed: string[]) => (flagsSought: string[]) => boolean = flagsPassed => {
    const flagsPassedMap = flagsPassed.reduce((acc, arg) => {
        acc[arg] = true;
        return acc;
    }, {} as Record<string, boolean>);
    return (flagsSought: string[]): boolean => flagsSought.some(flag => flagsPassedMap[flag]);
};

const confirmProceed = async (question: string): Promise<boolean> => {
    const rl = readline.createInterface(readlineIO);
    const answer: string = await new Promise(resolve => {
        rl.question(question, resolve);
    });
    rl.close();
    return answer.toLowerCase() === 'y' ? true : false;
};

/*
    Exports
*/

export {
    getFlagChecker,
    confirmProceed
};
