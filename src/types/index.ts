interface ITreeItem {
    path: string;
    type: string;
    dir?: ITreeItem[];
};

interface IThruConf {
    [key: string]: any;
};

interface IThruFile {
    [key: string]: () => any;
};

interface IThruVals {
    [key: string]: any;
};

export {
    ITreeItem,
    IThruConf,
    IThruFile,
    IThruVals
};
