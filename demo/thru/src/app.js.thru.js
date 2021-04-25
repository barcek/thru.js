/*
    Utilities
*/

const namePkgVar = name => name.replace(/-(\w)/g, (hyphen, char) => char.toUpperCase());

const sIfMultiple = arr => arr.length > 1 ? 's' : '';

const quoteItems = arr => arr.map(item => `'${item}'`);

const createList = arr => arr.reduce((acc, item, i, arr) =>
        i === 0            ? item :
        i < arr.length - 1 ? acc + ', ' + item
                           : acc + ' & ' + item
, '');

/*
    Resolvers
*/

const resolvers = {

    /*
        Return empty if framework not Express or compute values for later use,
        throwing error if value required absent
    */

    compute: conf => {

        if (conf?.components?.appServer?.runtime?.data?.fWrk !== 'express') {
            return {
                isEmpty: 'No framework set or framework not Express.'
            };
        };

        /* Extract modules, check support & provide code required */

        let modules = conf?.components?.appServer?.modules || [];

        const moduleUses = {
            dotenvLoading: {
                dotenv: {
                    run: 'dotenv.config();'
                }
            }
        };

        modules = modules.map(module => {
            if (moduleUses[module.use] && !moduleUses[module.use][module.src]) {
                throw new Error(`Source '${module.src}' unsupported for use '${module.use}'`);
            };
            if (moduleUses[module.use] && moduleUses[module.use][module.src]) {
                for (let key of Object.keys(moduleUses[module.use][module.src])) {
                    module[key] = moduleUses[module.use][module.src][key];
                };
            };
            return module;
        });

        /* Extract variables & check those required present */

        let variables = conf?.variables || {};

        const varsRequired = [
            'port',
            'info',
            'user'
        ];

        const varsAbsent = [];
        for (let varRequired of varsRequired) {
            if (!variables[varRequired] || !variables[varRequired].val) {
                varsAbsent.push(varRequired);
            };
        };
        if (varsAbsent.length > 0) {
            throw new Error(`Variable${sIfMultiple(varsAbsent)} ${createList(quoteItems(varsAbsent))} required`);
        };

        return {
            forNext: {
                modules: (modules && modules.length) > 0 ? modules : null,
                variables: Object.keys(variables).length > 0 ? variables : null
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
                src !== 'express' && acc.push(`import ${namePkgVar(src)} from '${src}';`);
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

    otherValues: (conf, comp) => {

        const contentItems = ['/*\n    Other values\n*/\n'];

        if (comp.variables) {
            const furtherLines = Object.keys(comp.variables).reduce((acc, key) => {
                const src = comp.variables[key]?.src;
                const dec = comp.variables[key]?.wrt ? 'let' : 'const';
                const id = dec === 'const' ? key.toUpperCase() : key;
                let val = comp.variables[key]?.val;
                val = typeof val === 'string' ? `'${val}'` : val;
                src === '.env' && acc.push(`${dec} ${id} = process.env.${key.toUpperCase()};`)
                src === 'main' && acc.push(`${dec} ${id} = ${val};`);
                return acc;
            }, []);

            contentItems.push(...furtherLines);
            contentItems.push('\nconst capitalizedInfo = info.slice(0, 1).toUpperCase() + info.slice(1);');
        };

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
                        : acc.push(`app.use(${namePkgVar(module.src)}());`));
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
