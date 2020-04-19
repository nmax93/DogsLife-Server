const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const garden = require('../Schemas/GardenSchema')
const dog = require('../Schemas/DogSchema')

module.exports = {
  getGardens(req, res, next) {
    mongoose.connect(url, options).then(() => {
      garden.find({}, (err, gardens) => {
        if (err) console.log(`err: ${err}`)

        res.json(gardens)
        console.log(`returned gardens`)
        mongoose.disconnect()
      })
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },

  getPresentDogsInGarden(req, res, next) { //params: gardenId
    mongoose.connect(url, options).then(() => {
      garden.findOne({ id: req.body.gardenId }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        if (!result) {
          console.log(`no garden found`)
          res.sendStatus(404)
          return
        }
        dog.find({ id: { $in: result.present_dogs } }, (err, presentDogsIds) => {
          if (err) { console.log(`err: ${err}`) }

          const presentDogsProfiles = []

          presentDogsIds.forEach(element => { //filter irrelevant dog data
            const dog = {
              id: element.id,
              name: element.name,
              owner: element.owner,
              age: element.age,
              weight: element.weight,
              bread: element.bread,
              avatar: element.avatar
            }
            presentDogsProfiles.push(dog)
          })

          res.json(presentDogsProfiles)
          console.log(`returned present dogs`)
          mongoose.disconnect()
        })
      })
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },

  dogEnterGarden(req, res, next) { // params: garden id, dog id
    mongoose.connect(url, options).then(() => {
      const gardenId = req.body.garden_id
      const dogId = req.body.dog_id
      //update present dogs array
      garden.updateOne({ id: gardenId }, { $push: { present_dogs: dogId } }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        else { console.log(`handled present dogs`) }
      })
      //update todays visitors if not exists
      garden.updateOne({ id: gardenId, todays_visitors: { $ne: dogId } }, { $push: { todays_visitors: dogId } }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        else {
          console.log(`handled todays visitors`)
          mongoose.disconnect()
        }
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

  dogExitGarden(req, res, next) { // params: garden id, dog id
    mongoose.connect(url, options).then(() => {
      const gardenId = req.body.garden_id
      const dogId = req.body.dog_id
      //update present dogs array
      garden.updateOne({ id: gardenId }, { $pull: { present_dogs: dogId } }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        else {
          console.log(`handled exit dog`)
          mongoose.disconnect()
        }
      })
    },
      err => { console.log(`connection error: ${err}`) })
  },

}
//FUNCTIONS OUTSIDE MODULE.EXPORTS
