const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const user = require('../Schemas/UserSchema')
const dog = require('../Schemas/DogSchema')

module.exports = {
  createDogMatch(req, res, next) { // params: my dog id, matched dog id
    mongoose.connect(url, options).then(() => {
      // get owner of the dog
      dog.findOne({ id: req.body.my_dog }, (err, result) => {
        if (err)
          throw err
        let ownerID = result.owner
        const newMatch = req.body.matched_dog
        // add match to owner
        user.updateOne({ id: ownerID }, { $push: { dog_matches: newMatch } }, (err, result) => {
          if (err) {
            console.log(`err: ${err}`)
          }
          else {
            console.log(`created match ${newMatch}`)
            mongoose.disconnect()
          }
        })
      })
    })
  },

  getMatches(req, res, next) {
    mongoose.connect(url, options).then(() => {
      user.findOne({ id: 101 }, (err, userProfile) => { //?????????????
        if (err) throw err

        user.find({ id: { $in: userProfile.owner_matches } }, (err, owners) => {
          if (err) { console.log(`err: ${err}`) }
          const owner_profiles = owners

          dog.find({ id: { $in: userProfile.dog_matches } }, (err, result) => {
            if (err) { console.log(`err: ${err}`) }
            const dog_profiles = result

            const matches = prepareMatchesObject(owner_profiles, dog_profiles)
            console.log(`returned matches`)
            res.json(matches)
          })
        })
      })
    },
      err => { console.log(`connection error: ${err}`) }
    )
  },
}
//FUNCTIONS OUTSIDE MODULE.EXPORTS

function prepareMatchesObject(owners, dogs) {
  const matches = {
    owner_matches: [],
    dog_matches: []
  }

  owners.forEach(element => { //filter irrelevant owner data
    const owner = {
      id: element.id,
      name: element.name,
      age: element.age,
      gender: element.gender,
      avatar: element.avatar,
      dogs: element.dogs
    }
    matches.owner_matches.push(owner)
  })

  dogs.forEach(element => { //filter irrelevant dog data
    const dog = {
      id: element.id,
      name: element.name,
      owner: element.owner,
      age: element.age,
      weight: element.weight,
      bread: element.bread,
      avatar: element.avatar
    }
    matches.dog_matches.push(dog)
  })

  return matches
}