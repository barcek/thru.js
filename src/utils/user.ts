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
    confirmProceed
};
