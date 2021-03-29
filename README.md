# thru.js

An unopinionated project generator for model-driven development.

Just fill a JSON file with project values and build a file tree for the project model, using the '.thru.js' suffix for thru files to be created on the fly.

Each thru file should export an object with one or more methods, each method receiving the parsed JSON and returning an object with a `content` property containing file content as a string.

The collected content for each file in the tree to be generated is combined and written to the equivalent file in the generated tree, with the '.thru.js' suffix removed.

## Also...

The returned object can use the `forNext` property to pass data to later methods in the same file. Any other properties on the object returned are placed on the `store` object, which is made available to later methods and later files. The `forNext` and `store` objects are the second and third arguments to each method.

Any method placed on the `store` object with the substring 'Task' in its key will be run once after the target file tree is built.

To run preliminary tasks, just use a thru file with one or more methods that return no content. Thru files that produce no content are not represented in the target file tree.

## A note on exports

When exporting from a thru file, use either the ES Module `export default objectName` syntax or CommonJS `module.exports = objectName`. If the `default export` format is preferred, try setting `type` to `module` in the 'package.json' for the model directory.

## Getting started

In the repository root directory, run `npm run build` or just `tsc` to compile the TypeScript into a 'dist' folder.

Create the file tree for the project model. This need not have any thru files.

For a model with thru files, create a 'thru.conf.json' file with the values needed for the project instance. Place this in the target directory, the directory into which the project is to be generated.

When ready, in the target directory run a command with the following pattern:

```shell
node path/to/index.js path/to/model-dir
```

Alternatively, in a directory other than the target run a command with the following pattern:

```shell
node path/to/index.js path/to/model-dir path/to/target-dir
```

Fuller documentation, demo project tree & improvements to follow.
