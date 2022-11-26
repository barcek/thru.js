const metadata = {
  name: 'name',
  vers: 'version',
  desc: 'description',
  kWds: 'keywords',
  auth: 'author',
  lcns: 'license',
  repo: 'repository'
}

const settings = {
  type: 'type'
}

const packages = {
  deps: 'dependencies',
  devs: 'devDependencies'
}

const resolvers = {

  JSON: conf => {

    if(!conf.metadata || !conf?.devTools?.pMgrs?.npm) {
      return {
        isEmpty: "No metadata provided or package manager not npm."
      }
    }

    const metadataPairs = Object.keys(conf.metadata).reduce((acc, key) => {
      key in metadata && (acc[metadata[key]] = conf.metadata[key])
      return acc
    }, {})

    const settingsPairs = Object.keys(conf.devTools.pMgrs.npm).reduce((acc, key) => {
      key in settings && (acc[settings[key]] = conf.devTools.pMgrs.npm[key])
      return acc
    }, {})

    const packagesPairs = Object.keys(conf.devTools.pMgrs.npm).reduce((acc, key) => {
      key in packages && Object.keys(conf.devTools.pMgrs.npm[key]).length > 0
        && (acc[packages[key]] = conf.devTools.pMgrs.npm[key])
      return acc
    }, {})

    const contentPairs = {...metadataPairs, ...settingsPairs, ...packagesPairs}

    return {
      content: JSON.stringify(contentPairs, null, 2)
    }
  }
}

export default resolvers
