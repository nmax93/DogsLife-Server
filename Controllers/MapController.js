const mongoose = require("mongoose");
const consts = require("../consts");
const { url, options, garden_sensor_pass } = consts;
const { Garden, DogVisitor } = require("../Schemas/GardenSchema");
const { visitedGarden } = require('../Schemas/UserSchema');
const Dog = require('../Schemas/DogSchema')

module.exports = {
  getGardens(req, res, next) {
    mongoose.connect(url, options).then(() => {
      Garden.find({}, (err, gardens) => {
        if (err) console.log(`err: ${err}`)

          res.json(gardens);
          console.log(`returned gardens`);
          mongoose.disconnect();
        });
      },
      (err) => {
        console.log(`connection error: ${err}`);
      }
    );
  },

  getPresentDogsInGarden(req, res, next) { //params: gardenId
    mongoose.connect(url, options).then(() => {
      Garden.findOne({ id: req.body.gardenId }, (err, result) => {
        if (err) { console.log(`err: ${err}`) }
        if (!result) {
          console.log(`garden not found`)
          res.sendStatus(404)
          return
        }
        Dog.find({ id: { $in: result.present_dogs } }, (err, presentDogsIds) => {
          if (err) { console.log(`err: ${err}`) }

              const presentDogsProfiles = [];

          presentDogsIds.forEach(element => { //filter irrelevant dog data
            const dog = {
              id: element.id,
              name: element.name,
              description: element.description,
              owners: element.owners,
              age: element.physical_params.age,
              weight: element.physical_params.weight,
              breed: element.physical_params.breed,
              avatar: element.avatar
            }
            presentDogsProfiles.push(dog)
          })

              res.json(presentDogsProfiles);
              console.log(`returned present dogs`);
              mongoose.disconnect();
            }
          );
        });
      },
      (err) => {
        console.log(`connection error: ${err}`);
      }
    );
  },

  dogsEnterGarden(req, res, next) {
    // params: garden id, dog id
    const garden = {
      id: 304,
      name: "Park Bialik",
      image: "https://media-cdn.tripadvisor.com/media/photo-s/08/c9/d0/57/nice-park.jpg",
      lat: 32.094794,
      long: 34.803269,
      present_dogs: [
          1,
          2,
      ],
      daily_visitors: {
        date: new Date(),
        dogs_visitors: [
        {
          dog_id: 1,
        },
        {
          dog_id: 2,
        }
      ],
      users_visitors: [101]
      }
    }
    console.log(new Date().toString());

    console.log(req.body);
    if(req.body.pass === garden_sensor_pass){
      const dogsIdsWithDup = Array.from(req.body.dogs_ids.split(','))
      const dogsIds = Array.from(new Set(dogsIdsWithDup));
      console.log("dogsEnterGarden -> dogsIds", dogsIds)
      const gardenId = req.body.garden_id;
      console.log("dogsEnterGarden -> gardenId", gardenId)
      mongoose
        .connect(url, options)
        .then( async () => {

          // // --->>> create new doc
          // const g2 = new Garden(garden);
          // const doc = await g2.save();

          // const dogId = 1;
          const g1 = await Garden.findOne({"id": gardenId}); // add errors
          if(!g1) res.status(501).send("$ Cant find garden");
          console.log("dogsEnterGarden -> g1", g1)
          // push new date to start of array
          const dailyVisitors = g1.daily_visitors[0]; // current day
          console.log("dogsEnterGarden -> dailyVisitors", dailyVisitors)
          let dogVisitors = dailyVisitors.dogs_visitors;
          let userVisitors = dailyVisitors.users_visitors;
          g1.present_dogs = dogsIds;
          console.log("dogsEnterGarden -> visitors", dogVisitors)
          const nowDate = new Date();
          let dogFoundInGarden, i,j, dogOwners;
          for(i=0; i < dogsIds.length; i++){
          const dogId = dogsIds[i];
          console.log("dogsEnterGarden -> dogsIds.length", dogsIds.length)
          console.log("dogsEnterGarden -> dogId", dogId)
            dogFoundInGarden = await dogVisitors.find((dogVisitor) =>  dogVisitor.dog_id == dogId);
            if(dogFoundInGarden) { 
                console.log("dogsEnterGarden -> dogId find", dogId)
                const dogToFind = await dog.findOne({"id": dogId});
                if(!dogToFind) {
                  console.log("$ Cant find dog Id in DB,", dogId);
                  continue;
                }
                dogOwners = dogToFind.other_owners;
                dogOwners.push(dogToFind.owner); 
                console.log("dogsEnterGarden -> dogToFind", dogToFind.id)
                // find user id and store in userVisitors
                let userByDogId = await user.findOne({ "id": dogToFind.owner}); 
                if(!userByDogId) {
                  console.log("$ $ Cant find user Id in DB,", dogId);
                  continue;
                }
                console.log("dogsEnterGarden -> userByDogId", userByDogId.id)
                console.log("dogsEnterGarden -> dogFoundInGarden.last_scan", dogFoundInGarden.last_scan)
                const millis = nowDate - new Date(dogFoundInGarden.last_scan); 
                const minutesSinceLastScan = Math.floor(millis / 60000);
                console.log("dogsEnterGarden -> minutesSinceLastScan", minutesSinceLastScan)                
                if(minutesSinceLastScan >= 60) {
                  console.log("new visit -> updating user garden");
                  const cleanOwners = Array.from(dogOwners); // regular array instead of mongoose array
                  for(j=0; j< cleanOwners.length; j++){
                    if(!userVisitors.includes(cleanOwners[j])){
                      userVisitors.unshift(cleanOwners[j]);
                    }
                  }
                  let userGardens = userByDogId.visited_gardens;
                  userGardens.find(garden => {
                    console.log("dogsEnterGarden -> garden", garden.id)
                    console.log("dogsEnterGarden -> garden.garden_id", garden.garden_id)
                    console.log("dogsEnterGarden -> gardenId", gardenId)
                    if(garden.garden_id == gardenId){
                      console.log("found garden id in user");
                      console.log("dog number", dogId);
                      const millisForUser = nowDate - new Date(garden.last_visit); 
                      console.log("dogsEnterGarden -> garden.last_visit", garden.last_visit)
                      const minutesForUser = millisForUser / 60000;
                      console.log("dogsEnterGarden -> minutesForUser", minutesForUser)
                      if(minutesForUser > 1){ // if two or more dogs need to change garden, it will be changed only for the first dog
                        garden.last_visit = nowDate;
                        garden.total_visits++;
                      }
                    }
                    else{
                      // insert new garden for user => gardenId
                      userGardens.unshift(new visitedGarden({garden_id: gardenId, last_visit: nowDate, total_visits: 1}))
                      /* SAME AS ABOVE? ^^^^
                      const visited_garden = {
                        garden_id: gardenId,
                        last_visit: nowDate,
                        total_visits: 1
                      }
                      userGardens.unshift(visited_garden)
                      */
                    }
                  })
                  await userByDogId.save();
                }
                else{
                  console.log("60 min else");
                  dogFoundInGarden.total_attendance_minutes+= minutesSinceLastScan;
                }
                dogFoundInGarden.last_scan = nowDate;
              }
              else{
                dogVisitors.unshift(new DogVisitor({dog_id: dogId}));
                /* SAME AS ABOVE? ^^^^^^^
                const dogVisitor = {
                  dog_id: dogId,
                  last_scan: {},
                  total_attendance_minutes: {}
                }
                dogVisitors.unshift(dogVisitor)
                */
              } 
            }
            await g1.save();         
          res.status(200).send("& All updated successfully");
        })
        .catch((err) => {
          console.log(`connection error: ${err}`);
          res
            .status(500)
            .send("$");
        });
    }
    else {
      res.status(401).send("Unauthorized request");
    }
  },
}
