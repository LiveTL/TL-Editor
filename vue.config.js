module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: '/TL-Editor',
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Editor - LiveTL Community Captions';
        return args;
      });
  }
};
