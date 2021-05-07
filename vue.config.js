module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'The Meditations by Marcus Aurelius'
        return args
      })
  }
}