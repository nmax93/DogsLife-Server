const mongoose = require("mongoose");
const consts = require("../consts");
const { url, options } = consts;
const account = require("../Schemas/AccountSchema");
const system_data = require("../Schemas/SystemDataSchema");
const { User } = require("../Schemas/UserSchema");
const { Dog } = require("../Schemas/DogSchema");
const accountController = require("./AccountController");
const Area = require('../Schemas/AreaSchema')

module.exports = {
  getUserProfile(req, res, next){
    console.log("getUserProfile -> req", req)
    mongoose.connect(url, options).then(
      async () => {
        try{
          // accountController.authenticateUser(
            //   req.body.userId,
            //   req.body.token,
            //   () => {
              //auth
              const foundUser = await User.findOne({ id: req.body.userId })
              if(!foundUser) {
                res.status(501).send(`Cant find user ${req.body.userId}`);
              }
              const dogsIdArray = Array.from(foundUser.dogs);
              console.log("getUserProfile -> dogsIdArray", dogsIdArray)
              await Dog.find().where('id').in(dogsIdArray).exec((err, foundDogs) => {
                if (err) {
                  console.log(`err: ${err}`);
                  res.status(501).send(`getUserProfile Cant find user dogs`);
                  return;
                }
                const userDogs = [];
                console.log("getUserProfile -> foundDogs", foundDogs)
                foundDogs.forEach((dogFound) => {
                console.log("getUserProfile -> dogFound", dogFound)
                  userDogs.push(dogFound)
                })
                res.status(200).json({foundUser, userDogs});
                // mongoose.disconnect();
                return;
              })
              }
              catch (err){
                console.log("getUserProfile -> err", err)
                res.status(501).send(`Cant addDog`);
                return;
              }
      },
      (err) => {
        console.log(`connection error: ${err}`);
        res.status(500).send(`mongoose getUserProfile connection error: ${err}`);
        return
      }
    );
  },
  addNewUserToExistDog(req, res, next) {
    const { signupUserObject, macId, token } = req.body;
    console.log("addNewUserToExistDog -> signupUserObject", signupUserObject);
    if (signupUserObject.dogInSystem) {
      mongoose.connect(url, options).then(
        async () => {
          // accountController.authenticateUser(signupUserObject.userId, token, () => { //auth
            // if (err) {
            //   console.log(`1 err addNewUserToExistDog: ${err}`);
            // }
            try {
              console.log("addNewUserToExistDog -> signupUserObject.macId", macId)
              const foundDog =  await Dog.findOne({ collar_mac_id: macId });
              if(!foundDog) {
                res.status(501).send(`$ Cant find dog by mac Id ${macId}`);
              }
              foundDog.owners.push(signupUserObject.userId);
              await foundDog.save();
              const userRes = await createUserProfile(
                foundDog.id,
                signupUserObject.userId,
                signupUserObject
              );
              console.log("9 addNewUserToExistDog -> userRes", userRes);
              if (userRes == 2) {
                res.status(501).send(`$ Cant find user ${userId}`);
                return
              } 
  
              if (userRes == true){
                res.status(200).send(`addNewUserToExistDog success`);
                return
              }  
              
            } catch (err) {
              console.log(err);
            }
          // })
        },
        (err) => {
          console.log(`10 connection error addSignupObject: ${err}`);
        }
      );
    }
    else {
      res.status(501).send(`dogInSystem = false`);
      return
    }
  },
  addSignupObject(req, res, next) {
    const {
      signupUserObject,
      signupDogObject,
      token
    } = req.body;
    mongoose.connect(url, options).then(
      async () => {
        // accountController.authenticateUser(req.body.userId, req.body.token, () => { //auth
        await system_data.findOne({}, async (err, result) => {
          if (err) {
            console.log(`err addSignupObject: ${err}`);
          }
          try {
            await increamentDogIdCounter(result);
            const isDogCreated = await createNewDogProfile(
              result.last_dog_id + 1,
              signupUserObject.userId,
              signupDogObject
            );
            if (!isDogCreated) {
              res.status(501).send(`$ Cant create dog`);
              return
            } 
            const userRes = await createUserProfile(
              result.last_dog_id + 1,
              signupUserObject.userId,
              signupUserObject
            );
            if (userRes == 2) {
              res.status(501).send(`Cant find user ${userId}`);
              return
            } 

            if (userRes == true){
              res.status(200).send(`addSignupObject success`);
              return
            }  
            
          } catch (err) {
            console.log(err);
          }
        });
        // })
      },
      (err) => {
        console.log(`connection error addSignupObject: ${err}`);
      }
    );
  },
  // if in registration need to add 2 dogs OR add dog in profile
  addDog(req, res, next) {
    const { userId, signupDogObject, token } = req.body;
    //params: token, ownerId, name, age, weight, breed, avatar
    mongoose.connect(url, options).then(
      async () => {
        try{

          // accountController.authenticateUser(
            //   req.body.userId,
            //   req.body.token,
            //   () => {
              //auth
              await system_data.findOne({}, async (err, result) => {
                if (err) {
                  console.log(`err: ${err}`);
                }
                await increamentDogIdCounter(result);
                const isDogCreated = await createNewDogProfile(
                  result.last_dog_id + 1,
                  userId,
                  signupDogObject
                );
                console.log("addDog -> dog create res", isDogCreated);
                if (!isDogCreated) {
                  res.status(501).send(`Cant create new dog`);
                  return
                } 
                await addDogToUserDogsArray(userId, result.last_dog_id + 1);
                });
                // });
              }
              catch{
                res.status(501).send(`Cant addDog`);
                return
              }
      },
      (err) => {
        console.log(`connection error: ${err}`);
        res.status(500).send(`mongoose connection error: ${err}`);
        return
      }
    );
  },
  editUserProfile(req, res, next) {
    //params: id, token, private, name, age, gender,avatar, preferences
    mongoose.connect(url, options).then(
      () => {
        accountController.authenticateUser(req.body.id, req.body.token, () => {
          //add auth
          User.findOne({ id: req.body.id }, (err, result) => {
            if (err) {
              console.log(`err: ${err}`);
            }
            updatedUserProfile = {
              id: result.id,
              private: req.body.private,
              name: req.body.name,
              age: req.body.age,
              gender: req.body.gender,
              avatar: req.body.avatar,
              dogs: result.dogs,
              preferences: req.body.preferences,
              owner_matches: result.owner_matches,
              dog_matches: result.dog_matches,
              err: "",
            };
            User.updateOne(
              { id: req.body.id },
              updatedUserProfile,
              (err, result) => {
                if (err) {
                  console.log(`err: ${err}`);
                } else {
                  console.log(`updated user profile: ${result}`);
                  mongoose.disconnect();
                }
              }
            );
          });
        });
      },
      (err) => {
        console.log(`connection error: ${err}`);
      }
    );
  },
  editDogProfile(req, res, next) {
    mongoose.connect(url, options).then(
      () => {
        accountController.authenticateUser(
          req.body.userId,
          req.body.token,
          () => {
            //auth
            Dog.findOne({ id: req.body.dogId }, (err, result) => {
              // find dog
              if (err) {
                console.log(`err: ${err}`);
              }
              updatedDogProfile = {
                id: result.id,
                owner: result.owner,
                other_owners: result.other_owners,
                name: req.body.name,
                age: req.body.age,
                breed: req.body.breed,
                weight: req.body.weight,
                avatar: req.body.avatar,
              };
              Dog.updateOne(
                { id: req.body.dogId },
                updatedDogProfile,
                (err, result) => {
                  // update dog
                  if (err) {
                    console.log(`err: ${err}`);
                  } else {
                    console.log(`updated dog profile: ${result}`);
                    res.sendStatus(200);
                    mongoose.disconnect();
                  }
                }
              );
            });
          }
        );
      },
      (err) => {
        console.log(`connection error: ${err}`);
      }
    );
  },
};
//  FUNCTIONS OUTSIDE MODULE.EXPORTS

async function increamentDogIdCounter(systemObject) {
  const updatedSystemObject = {
    last_user_id: systemObject.last_user_id,
    last_dog_id: systemObject.last_dog_id + 1,
    last_garden_id: systemObject.last_garden_id,
  };
  await system_data.updateOne({}, updatedSystemObject, (err, result) => {
    if (err) {
      console.log(`2 err increamentDogIdCounter: ${err}`);
    } else {
      console.log(`3 updated last dog id`);
    }
  });
}

async function createNewDogProfile(
  dogId,
  ownerId,
  {
    dogName,
    dogBirthdate,
    breed,
    weight,
    dogAvatar,
    dogDescription,
    dogGender,
    isMix,
    isSpayed,
    energyLevel,
    getAlongGender,
    getAlongSpayed,
    getAlongSize,
    player,
    parkPre,
    macId,
    breedSize,
    breedExercise,
  }
) {
  const newDog = {
    id: dogId,
    collar_mac_id: macId ? macId : '',
    service_uuid: "",
    owners: [ownerId],
    name: dogName,
    description: dogDescription,
    avatar: dogAvatar,
    get_along: {
      gender: getAlongGender,
      spayed: getAlongSpayed,
      size: getAlongSize,
    },
    physical_params: {
      breed: breed,
      mixed: isMix,
      gender: dogGender,
      age: dogBirthdate,
      weight: weight,
      spayed: isSpayed,
      size: breedSize,
      howMuchExercise: breedExercise,
    },
    character_params: {
      energy_level: energyLevel,
      playfullness: player,
      park_preference: parkPre,
    },
  };
  try {
    await Dog.create(newDog, (err, result) => {
      if (err) {
        console.log(`err createNewDogProfile: ${err}`);
        return new Error(err);
      }
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function createUserProfile(
  dogId,
  userId,
  {
    userGender,
    userName,
    userAvatar,
    hangouts,
    userBirthdate,
    feedMorning,
    feedNoon,
    feedEvening,
    walk_routine,
    hobbies,
    deciveMacId,
    lat,
    lng,
    radiusInMeters,
  }
) {
  const walkRoutine = {};
  const userFound = await User.findOne({ id: userId }); // add errors
  if (!userFound) return 2;
  else {
    device_mac_id = deciveMacId ? deciveMacId.slice(0, 13) : null,
      userFound.name = userName,
      userFound.age = userBirthdate,
      userFound.gender = userGender,
      userFound.avatar = userAvatar,
      userFound.dogs.push(dogId),
      userFound.hobbies = hobbies ? hobbies.slice() : null,
      userFound.walk_routine = Object.assign(walkRoutine, walk_routine),
      userFound.hangouts = hangouts.slice(),
      userFound.feeding_hours = {
        morning: feedMorning,
        noon: feedNoon,
        evening: feedEvening,
      };
    userFound.address = {
      lat: lat,
      lng: lng,
      radiusInMeters: radiusInMeters,
    };
    const userCoords = {
      id: userId,
      coords: {
        lat: lat,
        long: lng
      }
    }
    associateUserToGeoArea(userCoords)
  }
  await userFound.save();
  return true;
}

function associateUserToGeoArea(user) {
  const lat = user.coords.lat
  const long = user.coords.long
  Area.find({}, (err, areas) => {
    if (err) { console.log(`err: ${err}`) }
    areas.forEach(area => {
      if (lat >= area.coords.min_lat && long >= area.coords.min_long && lat <= area.coords.max_lat && long <= area.coords.max_long) {
        Area.updateOne({ id: area.id }, { $push: { users: user } }, (err, result) => {
          if (err) { console.log(`err: ${err}`) }
        })
        return
      }
    })
  })
}

function addDogToUserDogsArray(userId, dogId) {
  User.updateOne({ id: userId }, { $push: { dogs: dogId } }, (err, result) => {
    if (err) {
      console.log(`err: ${err}`);
    }
    console.log(`added dog ${dogId} to user ${userId}`);
  });
}
