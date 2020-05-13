const mongoose = require('mongoose')
var Schema = mongoose.Schema;

const visitedGardenSchema = Schema({
  garden_id: Number,
  last_visit: { type: Date, default: Date.now },
  total_visits: { type: Number, default: 0 },
});
const schema = {
  id: Number,
  private: Boolean,
  device_mac_id: String,
  name: String,
  age: Number,
  gender: String,
  avatar: String,
  dogs: [Number],
  preferences: {
    dogs: {
      breads: [String],
      min_weight: Number,
      max_weight: Number
    },
    owners: {
      gender: String,
      min_age: Number,
      max_age: Number
    }
  },
  owner_matches: [Number],
  dog_matches: [Number],
  visited_gardens: [visitedGardenSchema]
}


const users_schema = new mongoose.Schema(schema)
const user = mongoose.model('user', users_schema)
const visitedGarden = mongoose.model('visitedGarden', visitedGardenSchema)
module.exports = {
  user,
  visitedGarden
} 