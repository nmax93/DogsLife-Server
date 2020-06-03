const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const dogVisitorSchema = Schema({
  dog_id: Number,
  first_scan: { type: Date, default: Date.now }, // when dog is presented in garden we calculate how many minutes left in avg
  last_scan: { type: Date, default: Date.now },
  total_attendance_minutes: { type: Number, default: 0 },
});

const dayVisitorsSchema = Schema({
  date: { type: Date, default: Date.now },
  dogs_visitors: [dogVisitorSchema],
  users_visitors: [Number]
});
const gardenSchema = Schema({
  id: Number,
  name: String,
  image: String,
  lat: Number,
  long: Number,
  present_dogs: [Number],
  daily_visitors: [dayVisitorsSchema],
  rating: {
    cleanliness_score: Number,
    facilities_score: Number,
    user_reviews: [
      {
        author: String,
        user_id: Number,
        date: { type: Date, default: Date.now },
        text: String
      }
    ]
  }
});

const Garden = mongoose.model("Garden", gardenSchema);
const DogVisitor = mongoose.model("DogVisitor", dogVisitorSchema);

module.exports = {
  Garden,
  DogVisitor
}
