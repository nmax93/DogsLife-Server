const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const { user } = require('../Schemas/UserSchema')
const dog = require('../Schemas/DogSchema')
const accountController = require('./AccountController')

module.exports = {
  // Ignore dogs for the same owner!!!!!
  createDogMatch(req, res, next) { // params: my dog id, matched dog id array
    console.log("createDogMatch -> req.body", req.body)
    let i, newMatch
    mongoose.connect(url, options).then(() => {
      //get owner of the dog
      dog.findOne({ collar_mac_id: req.body.my_dog_id }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        if (!result) {
          console.log(`createDogMatch -> no dog found`)
          res.sendStatus(404)
          return
        }
        let ownerID = result.owner
        console.log("createDogMatch -> ownerID", ownerID)
        console.log("createDogMatch -> req.body.matched_dogs_ids.length", req.body.matched_dogs_ids.length)
        const matchedDogs = req.body.matched_dogs_ids
        for (i = 1; i <= matchedDogs.length; i++) {
          if (matchedDogs[i] > 0) {
            console.log("matched dog", matchedDogs[i])

            newMatch = matchedDogs[i]
            console.log("createDogMatch -> newMatch", newMatch)
            // add match to owner
            // dont update dogs of the same owner
            user.updateOne({ id: ownerID }, { $push: { dog_matches: newMatch } }, (err, result) => {
              if (err) {
                console.log(`err: ${err}`)
                res.sendStatus(404).send("cant update dog_matches ") // 

              }
              //if (result) {
              //console.log(`created match [i]${newMatch},${i}`)
              //}
            })
          }
        }
      })
    })
      .catch(e => {
        console.log("cant connect to mongo in createDogMatch", e)
      })
    //mongoose.disconnect()
    res.sendStatus(200)
  },

  getMatches(req, res, next) { //params: userId, token
    mongoose.connect(url, options).then(() => {
      accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth

        user.findOne({ id: req.body.userId }, (err, userProfile) => { //find user
          if (err) { console.log(`err: ${err}`) }

          user.find({ id: { $in: userProfile.owner_matches } }, (err, owners) => { //get owner matches
            if (err) { console.log(`err: ${err}`) }
            const owner_profiles = owners

            dog.find({ id: { $in: userProfile.dog_matches } }, (err, result) => { //get dog matches
              if (err) { console.log(`err: ${err}`) }
              const dog_profiles = result
              const matches = prepareMatchesObject(owner_profiles, dog_profiles)
              console.log(`returned matches`)
              res.json(matches)
              mongoose.disconnect()
            })
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
    dog_matches: [],
    err: '',
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