/*
  Abstracted directory entry
*/

interface ITreeItem {
  path: string;
  type: string;
  dir?: ITreeItem[];
}

/*
  Config file content & full or partial paths
*/

interface IThruConf {
  [key: string]: any;
}

interface IConfs {
  thruRootPath: string;
  projectRootPath: string;
  thruConf: IThruConf;
  thruFileInfix: string;
  isVerbose: boolean;
}

/*
  Thru file resolvers & resolver return values
*/

interface IThruFile {
  [key: string]: () => any;
}

interface IThruVals {
  [key: string]: any;
}

/*
  Exports
*/

export {
  ITreeItem,
  IThruConf,
  IConfs,
  IThruFile,
  IThruVals
}
