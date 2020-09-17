const context = require.context('./models', false, /\.js$/)
const models = {}

context.keys().forEach((key) => {
  const result = key.match(/(\w+)\.js$/)
  if (result) {
    models[result[1]] = context(key).default
  }
})

export default models
