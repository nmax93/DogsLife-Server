const mongoose = require('mongoose')
const consts = require('../consts')
const { url, options } = consts
const { User } = require('../Schemas/UserSchema')
const { dog } = require('../Schemas/DogSchema')
const accountController = require('./AccountController')

module.exports = {
  createDogMatch(req, res, next) { // params: my dog id, matched dog id array
    console.log("createDogMatch -> req.body", req.body)
    if (req.body.pass != consts.garden_sensor_pass) {
      res.status(401).send("Unauthorized request");
      return;
    } 
    else {
    let i,j, newMatch
    mongoose.connect(url, options).then( async () => {
      await dog.findOne({ id: req.body.my_dog_id }, async (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        if (!result) {
          res.status(404).send("cant find dog from collar")
          return;
        }
        for(j=0 ; j<result.owners.length ; j++){        
        let ownerID = result.owners[j];
        const matchedDogsWithDup = Array.from(req.body.matched_dogs_ids.split(","));
        const matchedDogs = Array.from(new Set(matchedDogsWithDup));        
        for (i = 0; i < matchedDogs.length; i++) {
          if (matchedDogs[i] > 0) {
            newMatch = matchedDogs[i]
            const dogOwner = await User.findOne({  id: ownerID  }); 
            let foundMatch;
            if(dogOwner){
              const ownerMatches =  dogOwner.matches;
              foundMatch = ownerMatches.find(match => (match.my_dog == req.body.my_dog_id && match.with_dog == newMatch && match.collar_match == true));
                if(!foundMatch){ 
                  const matchToPush = {
                    my_dog: req.body.my_dog_id,
                    with_dog: newMatch, 
                    collar_match: true 
                  }
                  ownerMatches.push(matchToPush)
                  await dogOwner.save();
                }
            }
              else {
                res.status(404).send(`$ createDogMatch -> cant find dog owner: ${ownerID}`)
                return;
              }
            }
          }
        }
          return res.status(200).send("& All updated successfully - createDogMatch");
      })
    })
      .catch(err => {
        console.log(`catch mongoose error: ${err}`);
        res.status(500).send("$");

      })
    //mongoose.disconnect()
  }
  },

  getMatches(req, res, next) { //params: userId, token
    try{

      mongoose.connect(url, options).then(() => {
        accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth
          
          User.findOne({ id: req.body.userId }, (err, userProfile) => { //find user
            if (err) { console.log(`err: ${err}`) }
            
            User.find({ id: { $in: userProfile.owner_matches } }, (err, owners) => { //get owner matches
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
    }
    catch (err){
      console.log(`error in getMatches ${err}`);
      
    }
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
      breed: element.breed,
      avatar: element.avatar
    }
    matches.dog_matches.push(dog)
  })

  return matches
}