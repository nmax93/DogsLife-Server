const mongoose = require('mongoose')

const schema = {
  last_user_id: Number,
  last_dog_id: Number,
  last_garden_id: Number
}
const system_params_schema = new mongoose.Schema(schema)
const system_params = mongoose.model('system_param', system_params_schema)

module.exports = system_params