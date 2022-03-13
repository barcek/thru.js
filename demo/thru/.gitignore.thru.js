const resolvers = {

  paths: conf => {

    if (!conf.devTools.vCtrl || conf.devTools.vCtrl !== "git") {
      return {
        isEmpty: true
      };
    };

    const contentItems = [];

    if (conf?.devTools?.pMgrs?.npm) {
      contentItems.push('node_modules');
    };

    if (conf.variables) {
      const dotVars = Object.keys(conf.variables).filter(key =>
        conf.variables[key].src === '.env'
      );
      dotVars.length > 0 && contentItems.push('.env');
    };

    return {
      content: contentItems.join('\n')
    };
  }
};

export default resolvers;
