const mongoose = require('mongoose')

const schema = {
  id: Number,
  mac_id: String,
  service_uuid: String,
  owner: Number,
  name: String,
  age: Number,
  bread: String,
  weight: Number,
  other_owners: [Number],
  avatar: String
}
const dogs_schema = new mongoose.Schema(schema)
const dog = mongoose.model('dog', dogs_schema)

module.exports = dog