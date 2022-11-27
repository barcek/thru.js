# thru.js

An unopinionated project generator for model-driven development.

Just fill a JSON file with project values, build a file tree representing the project model and add the '.thru.js' suffix to the names of files to be created on the fly. In those files - 'thru files' - write code to apply the project values.

- [How..?](#how)
- [Also...](#also)
    - [Other return properties](#other-return-properties)
    - [Arguments to the methods](#arguments-to-the-methods)
    - [A note on export syntax](#a-note-on-export-syntax)
- [Getting started](#getting-started)
    - [Cloning the repository, installing dependencies & compiling](#cloning-the-repository-installing-dependencies--compiling)
    - [Generating a project](#generating-a-project)
    - [Options](#options)
- [The demo project model](#the-demo-project-model)
    - [Current tree](#current-tree)
        - [Model](#model)
        - [Output](#output)
    - [Generating it](#generating-it)
- [Working with HTML](#working-with-html)
- [Making changes](#making-changes)
    - [Test files](#test-files)
    - [npm audit](#npm-audit)
- [Development plan](#development-plan)
- [Repository tree](#repository-tree)

## How..?

Each thru file should export an object with one or more methods. Each method receives the parsed JSON as its first parameter and can return an object with a `content` property containing file content as a string.

The content for each file in the tree is combined and written to the equivalent file in the generated tree, with the '.thru.js' suffix removed.

## Also...

Other properties on the object returned from a method are used by the generator, with most being passed back as arguments to later methods.

### Other return properties

The `forNext` property on the returned object can be used to forward data to later methods in the same file.

The `isReady` property can be set to `true` to ensure that no further methods in the given file are called, while setting `isEmpty` to `true` - or to a string to be included in the progress message - ends the calling and goes further, wiping all content returned from the file thus far. Thru files that produce no content are not represented in the target file tree.

Any other properties on the returned object are placed on the `store` object, which is made available to later methods and later files. Any method placed on the `store` object with the substring 'Task' in its key will be run once after the target file tree is built.

### Arguments to the methods

The `forNext` and `store` objects are the second and third arguments to each method. The former starts out holding the project root path to help with importing resources and managing context.

To run preliminary tasks, just use a thru file with one or more methods that return no content. Again, thru files that produce no content are not represented in the target file tree.

### A note on export syntax

When exporting the methods from a thru file, use either the ES Module `export default objectName` syntax or CommonJS `module.exports = objectName`. If the `export default` format is preferred, try setting `type` to `module` in the 'package.json' for the model directory.

## Getting started

### Cloning the repository, installing dependencies & compiling

You'll need Git & npm installed.

First, enter the directory in which you'd like to store the library and run the Git command to clone the repository:

```shell
git clone https://github.com/barcek/thru.js.git
```

Next, enter the newly created 'thru.js' directory and run the npm command to install dependencies:

```shell
npm install
```

Finally, run either `npm run build` or `tsc` to compile the TypeScript into a 'dist' folder.

### Generating a project

Create the file tree for the project model. This need not have any thru files.

For a model with thru files, create a 'thru.conf.json' file with the values for the project instance. Place this in the target directory, i.e. the directory into which the project is to be generated.

When ready, in the target directory run a command with the following pattern:

```shell
node path/to/index.js path/to/model-dir
```

Alternatively, in a directory other than the target directory, run a command with the following pattern:

```shell
node path/to/index.js path/to/model-dir path/to/target-dir
```

The tool logs to the console any notes and errors. It will also log progress messages if the `--verbose` or `-v` flag is included in the command anywhere after `path/to/index.js`, e.g.:

```shell
node path/to/index.js --verbose path/to/model-dir path/to/target-dir
```

### Options

The following can be passed to src/index.js:

- `--verbose` / `-v`, to log progess messages
- `--replace` / `-r`, to replace automatically, not request confirmation, when a folder exists and files within may be overwritten

## The demo project model

The 'demo' directory contains an initial demo project model. It presents one possible approach to the structure of the 'thru.conf.json' file and thru file resolvers and currently provides for a simple backend using Node.js with the Express.js framework, with expansion to a fuller stack solution using TypeScript to follow.

### Current tree

#### Model

```
demo
├── thru
│   ├── src
│   │   └── app.js.thru.js
│   ├── .env.thru.js
│   ├── .gitignore.thru.js
│   └── package.json.thru.js
├── thru.conf.json
└── thru.utils.js
```

#### Output

```
./
├── src
│   └── app.js
├── .env
├── .gitignore
└── package.json
```

### Generating it

To generate the demo project, in the root directory run `npm run build` or `tsc`, [as described above](#cloning-the-repository-installing-dependencies--compiling), then `cd demo` to enter the 'demo' directory.

There, with the compiled TypeScript in the 'dist' folder, it should be possible to run the following command to generate the project:

```shell
node ../dist/index.js
```

Once generated, with the file 'package.json' present, run the npm command to install the project dependencies:

```shell
npm install
```

Once these have been installed, the project server can be started with the following:

```shell
node src/app.js
```

This sets it listening at `http://localhost:3000`.

## Working with HTML

If you need to generate HTML, or interact with existing snippets, you could use [awb](https://github.com/barcek/awb).

## Making changes

Running the tests after making changes and adding tests to cover new behaviour is recommended, as is a regular audit of dependencies.

### Test files

The npm packages `mocha`, `chai`, `sinon` and `ts-node` are used for testing and the test files can be run with the following command:

```shell
mocha
```

This command is the current content of the 'test' script in the 'package.json' file, which can be run with the following:

```shell
npm test
```

The files themselves are in the 'test' folder and the `mocha` configuration file with settings to accommodate `ts-node` is in the root directory.

### npm audit

The `npm audit` command can be used to run a security audit on the dependencies used, with the process returning information on updates where available. The command `npm audit fix` can be used instead or thereafter to install compatible updates. See the npm documentation for [more detail](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities).

## Development plan

The following are the expected next steps in the development of the code base. The general medium-term aim is an extensible CLI project generator with a comprehensive, modular demo project model. Pull requests are welcome for these and other potential improvements.

- add comments to the remaining source files
- expand the demo project model to include:
    - corresponding static files
    - optional use of TypeScript
    - containerization
- further generalize the implementation of CLI options
- provide a help option
- add fuller testing

## Repository tree

```
./
├── demo
│   ├── thru
│   │   ├── src
│   │   │   └── app.js.thru.js
│   │   ├── .env.thru.js
│   │   ├── .gitignore.thru.js
│   │   └── package.json.thru.js
│   ├── thru.conf.json
│   └── thru.utils.js
├── src
│   ├── confs
│   │   └── index.ts
│   ├── tasks
│   │   ├── generate.ts
│   │   └── index.ts
│   ├── types
│   │   └── index.ts
│   ├── utils
│   │   ├── file.ts
│   │   ├── index.ts
│   │   ├── path.ts
│   │   ├── text.ts
│   │   ├── tree.ts
│   │   └── user.ts
│   └── index.ts
├── test
│   ├── generate.test.js
│   └── test.thru.js
│   └── utils.test.js
├── .gitignore
├── .mocharc.json
├── LICENSE.txt
├── README.md
├── package-lock.json
├── package.json
└── tsconfig.json
```
