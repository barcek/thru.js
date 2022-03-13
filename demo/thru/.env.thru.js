const resolvers = {

  variables: conf => {

    if (!conf.variables || Object.keys(conf.variables).length === 0) {
      return {
        isEmpty: "No variables set."
      };
    };

    const contentItems = Object.keys(conf.variables).reduce((acc, key) =>
      conf.variables[key].src === '.env'
        ? acc.concat(`${key.toUpperCase()}=${conf.variables[key].val}`)
        : acc
    , []);

    return {
      content: contentItems.join('\n')
    };
  }
};

export default resolvers;
