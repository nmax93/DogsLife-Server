const mongoose = require('mongoose')

const schema = {
  id: Number,
  coords: Object,
  users: [Object]
}
const area_schema = new mongoose.Schema(schema)
const area = mongoose.model('area', area_schema)

module.exports = area
