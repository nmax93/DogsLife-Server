const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const dogVisitorSchema = Schema({
  dog_id: Number,
  last_scan: { type: Date, default: Date.now },
  total_attendance_minutes: { type: Number, default: 0 },
})

const dayVisitorsSchema = Schema({
  date: { type: Date, default: Date.now },
  dogs_visitors: [dogVisitorSchema],
  users_visitors: [Number]
})

const gardenSchema = Schema({
  id: Number,
  name: String,
  image: String,
  lat: Number,
  long: Number,
  present_dogs: [Number],
  daily_visitors: [dayVisitorsSchema]
})

// const Visitor = mongoose.model('Visitor', visitorSchema);
const Garden = mongoose.model("Garden", gardenSchema);
const DogVisitor = mongoose.model("DogVisitor", dogVisitorSchema);

module.exports = {
  Garden,
  DogVisitor
}
