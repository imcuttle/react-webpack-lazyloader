const getConfig = require('./get-webpack-config')

const mode = process.env.BUILD_MODE || 'normal-with-dll'

module.exports = getConfig(mode)
