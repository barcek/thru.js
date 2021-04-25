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
    Assumptions
*/

const varsRequired = [ 'port', 'info', 'user' ];

const modsSupported = {
    dotenvLoading: {
        dotenv: {
            run: 'dotenv.config();'
        }
    }
};

/*
    Resolvers - compute, import, invoke, assign, utilize, respond, listen
*/

const resolvers = {

    /*
        Return empty if framework not Express or compute values for later use,
        throwing error if module unsupported or variable required absent
    */

    compute: conf => {

        if (conf?.components?.appServer?.runtime?.data?.fWrk !== 'express') {
            return {
                isEmpty: 'No framework set or framework not Express.'
            };
        };

        /* Extract modules, check support & assign content required */

        let modules = conf?.components?.appServer?.modules || [];

        modules = modules.map(module => {
            if (modsSupported[module.use] && !modsSupported[module.use][module.src]) {
                throw new Error(`'${module.src}' unsupported for use '${module.use}'`);
            };
            if (modsSupported[module.use] && modsSupported[module.use][module.src]) {
                for (let key of Object.keys(modsSupported[module.use][module.src])) {
                    module[key] = modsSupported[module.use][module.src][key];
                };
            };
            return module;
        });

        /* Extract variables & check all required present */

        let variables = conf?.variables || {};

        const varsAbsent = [];
        for (let varRequired of varsRequired) {
            if (!variables[varRequired] || !variables[varRequired].val) {
                varsAbsent.push(varRequired);
            };
        };
        if (varsAbsent.length > 0) {
            throw new Error(`Variable${sIfMultiple(varsAbsent)} ` +
                `${createList(quoteItems(varsAbsent))} required`);
        };

        return {
            forNext: {
                modules,
                variables
            }
        };

    },

    /* Generate lines for 'Imports' section */

    import: (conf, comp) => {

        const contentItems = [
            '/*\n    Imports\n*/\n',
            'import express from \'express\';'
        ];

        const furtherItems = comp.modules.reduce((acc, module) => {
            const src = module.src;
            src !== 'express' && acc.push(`import ${namePkgVar(src)} from '${src}';`);
            return acc;
        }, []);

        contentItems.push(...furtherItems);

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Generate lines for 'Activation' section, to call express & any other modules */

    invoke: (conf, comp) => {

        const contentItems = [
            '/*\n    Base calls\n*/\n',
            'const app = express();'
        ];

        const furtherItems = comp.modules.reduce((acc, module) => {
            module.run && acc.push(module.run);
            return acc;
        }, []);

        contentItems.push(...furtherItems);

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Generate lines for 'Other values' section */

    assign: (conf, comp) => {

        const contentItems = ['/*\n    Other values\n*/\n'];

        /* Include variables extracted */

        const furtherItems = Object.keys(comp.variables).reduce((acc, key) => {
            const src = comp.variables[key]?.src;
            const dec = comp.variables[key]?.wrt ? 'let' : 'const';
            const id = dec === 'const' ? key.toUpperCase() : key;
            let val = comp.variables[key]?.val;
            val = typeof val === 'string' ? `'${val}'` : val;
            src === '.env' && acc.push(`${dec} ${id} = process.env.${key.toUpperCase()};`)
            src === 'main' && acc.push(`${dec} ${id} = ${val};`);
            return acc;
        }, []);

        contentItems.push(...furtherItems);

        /* Include remaining values */

        const space = contentItems.length > 1 ? '\n' : '';
        contentItems.push(`${space}const capitalizedInfo = info.slice(0, 1).toUpperCase() + info.slice(1);`);

        return {
            content: contentItems.join('\n') + '\n'
        };
    },

    /* Generate lines for 'Middleware' section */

    utilize: (conf, comp) => {

        const contentItems = ['/*\n    Middleware\n*/\n'];

        const furtherItems = comp.modules.reduce((acc, module) => {
            module.mid
                && (typeof module.mid === 'string'
                    ? acc.push(module.mid)
                    : acc.push(`app.use(${namePkgVar(module.src)}());`));
            return acc;
        }, []);

        contentItems.push(...furtherItems);

        return {
            content: contentItems.length > 1 ? contentItems.join('\n') + '\n' : ''
        };
    },

    /* Generate lines for 'Routes' section */

    respond: () => {

        const contentItems = [
            '/*\n    Routes\n*/\n',
            'app.get(\'/\', (req, res) => {\n'
                + '    res.send(`${capitalizedInfo}, ${user}.`)\n'
                + '});\n'
        ];

        return {
            content: contentItems.join('\n')
        };
    },

    /* Generate lines to listen */

    listen: () => {

        const contentItems = [
            'app.listen(PORT, () => {\n    console.log(`Listening on ${PORT}...`);\n});'
        ];

        return {
            content: contentItems.join('\n')
        };
    }
};

export default resolvers;
