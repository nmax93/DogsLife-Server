const mongoose = require('mongoose')

const schema = {
  date_created: { type: Date, default: Date.now },
  is_registered: { type: Boolean, default: false },
  id: Number,
  device_mac_id: String,
  name: String,
  age: Date, //or string
  gender: Boolean, //false m, true fm
  avatar: String,
  dogs: [Number],
  matches: [Object],
  geo_matches: [Object], 
  collar_matches: [Object],
  address: {
    lat: String,
    lng: String,
    radiusInMeters: Number
  }, 

  hobbies: [Boolean], //[size 8]           ///m 32%
  walk_routine: Object,                          ///m 20%  if same type +10, if duration +10 ---deviation 15 min
  hangouts: [Boolean],    //[size 4]       ///m 28%
  feeding_hours: {
    morning: Number,
    noon: Number,
    evening: Number
  }
}

const users_schema = new mongoose.Schema(schema)
const User = mongoose.model('user', users_schema)
module.exports = {
  User
} 
