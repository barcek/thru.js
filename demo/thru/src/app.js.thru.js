/*
    Utilities
*/

const renamePkgToVar = name => name.replace(/-(\w)/g, (hyphen, char) => char.toUpperCase());

/*
    Resolvers
*/

const resolvers = {

    /* Return empty if framework not Express or compute values for later use */

    compute: conf => {

        if (conf?.components?.appServer?.runtime?.data?.fWrk !== 'express') {
            return {
                isEmpty: 'No framework set or framework not Express.'
            };
        };

        const modules = conf?.components?.appServer?.modules;

        return {
            forNext: {
                modules: (modules && modules.length) > 0 ? modules : null
            }
        };

    },

    /* Generate lines for 'Imports' section */

    imports: (conf, comp) => {

        const contentItems = [
            '/*\n    Imports\n*/\n',
            'import express from \'express\';'
        ];

        if (comp.modules) {
            const furtherLines = comp.modules.reduce((acc, module) => {
                const src = module.src;
                src !== 'express' && acc.push(`import ${renamePkgToVar(src)} from '${src}';`);
                return acc;
            }, []);
            contentItems.push(...furtherLines);
        };

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Generate lines for 'Base calls' section, to call express & any other modules */

    baseCalls: (conf, comp) => {

        const contentItems = [
            '/*\n    Base calls\n*/\n',
            'const app = express();'
        ];

        if (comp.modules) {
            const furtherLines = comp.modules.reduce((acc, module) => {
                module.run && acc.push(module.run);
                return acc;
            }, []);
            contentItems.push(...furtherLines);
        };

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Throw error if variable(s) absent or generate lines for 'Other values' section */

    otherValues: conf => {

        if (!conf.variables || Object.keys(conf.variables).length === 0
                || !conf.variables.port
                || !conf.variables.info
                || !conf.variables.user
            ) {
            throw new Error('Requisite variable(s) not found');
        };

        const contentItems = ['/*\n    Other values\n*/\n'];

        const furtherLines = Object.keys(conf.variables).reduce((acc, key) => {
            const src = conf.variables[key]?.src;
            const dec = conf.variables[key]?.wrt ? 'let' : 'const';
            const id = dec === 'const' ? key.toUpperCase() : key;
            let val = conf.variables[key]?.val;
            val = typeof val === 'string' ? `'${val}'` : val;
            src === '.env' && acc.push(`${dec} ${id} = process.env.${key.toUpperCase()};`)
            src === 'main' && acc.push(`${dec} ${id} = ${val};`);
            return acc;
        }, []);

        contentItems.push(...furtherLines);
        contentItems.push('\nconst capitalizedInfo = info.slice(0, 1).toUpperCase() + info.slice(1);');

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Generate lines for 'Middleware' section */

    middleware: (conf, comp) => {

        const contentItems = ['/*\n    Middleware\n*/\n'];

        if (comp.modules) {
            const furtherLines = comp.modules.reduce((acc, module) => {
                module.mid
                    && (typeof module.mid === 'string'
                        ? acc.push(module.mid)
                        : acc.push(`app.use(${renamePkgToVar(module.src)}());`));
                return acc;
            }, []);
            contentItems.push(...furtherLines);
        };

        return {
            content: contentItems.length > 1 ? contentItems.join('\n') + '\n' : ''
        };
    },

    /* Generate lines for 'Endpoints' section */

    endpoints: () => {

        const contentItems = [
            '/*\n    Endpoints\n*/\n',
            'app.get(\'/\', (req, res) => {\n'
                + '    res.send(`${capitalizedInfo}, ${user}.`)\n'
                + '});\n'
        ];

        return {
            content: contentItems.join('\n')
        };
    },

    /* Generate lines for 'Listener' section */

    listener: () => {

        const contentItems = [
            '/*\n    Listener\n*/\n',
            'app.listen(PORT, () => {\n    console.log(`Listening on ${PORT}...`);\n});'
        ];

        return {
            content: contentItems.join('\n')
        };
    }
};

export default resolvers;
