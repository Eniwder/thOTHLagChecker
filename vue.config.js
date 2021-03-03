module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        productName: "th123LagChecker",
        appId: "eniel.tlce",
        win: {
          icon: 'src/assets/icon.png',
          target: [
            {
              target: 'portable', // 'zip', 'nsis', 'portable'
              arch: ['x64'] // 'x64', 'ia32'
            }
          ]
        }
      }
    }
  },

  transpileDependencies: [
    'vuetify'
  ]
}
