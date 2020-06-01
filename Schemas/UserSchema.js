const mongoose = require('mongoose')
var Schema = mongoose.Schema;

const visitedGardenSchema = Schema({
  garden_id: Number,
  last_visit: { type: Date, default: Date.now },
  total_visits: { type: Number, default: 0 },
});
const schema = {
  id: Number,
  device_mac_id: String,
  name: String,
  age: Date, //or string
  gender: Boolean, //false m, true fm
  avatar: String,
  dogs: [Number],
  matches: [Object],
  geo_matches: [Object], 
  collar_matches: [Number],
  visited_gardens: [Object],
  hobbies: [Boolean], //[size 8]           ///m 35%
  walk_routine: Object,                          ///m 30%  if same type +15, if duration +15 ---deviation 15 min
  hangouts: [Boolean],    //[size 4]       ///m 35%
  feeding_hours: {
    morning: Number,
    noon: Number,
    evening: Number
  }
}

const users_schema = new mongoose.Schema(schema)
const User = mongoose.model('user', users_schema)
const visitedGarden = mongoose.model('visitedGarden', visitedGardenSchema)
module.exports = {
  User,
  visitedGarden
} 
