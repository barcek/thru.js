interface ITreeItem {
    path: string;
    type: string;
    dir?: ITreeItem[];
};

interface IThruConf {
    [key: string]: () => string;
};

export {
    ITreeItem,
    IThruConf
};
