const mongoose = require("mongoose");
const consts = require("../consts");
const { url, options, garden_sensor_pass } = consts;
const { Garden, DogVisitor } = require("../Schemas/GardenSchema");
const { dog, visitedGarden } = require("../Schemas/DogSchema");
const { User } = require("../Schemas/UserSchema");

module.exports = {
  getDogOwners(req, res, next) {
    //auth
    mongoose
      .connect(url, options)
      .then(async () => {
        await User.find(
          { id: { $in: req.body.ownersIds } },
          (err, ownersObjects) => {
            if (err) {
              console.log(`getDogOwners err: ${err}`);
            }
            const dogOwnersProfiles = [];

            ownersObjects.forEach((element) => {
              dogOwnersProfiles.push(element);
            });
            res.json(dogOwnersProfiles);
            mongoose.disconnect();
            return;
          }
        );
      })
      .catch((err) => {
        console.log(`getDogOwners connection error: ${err}`);
      });
  },

  addReview(req, res, next) {
    mongoose
      .connect(url, options)
      .then(async () => {
        const {
          gardenId,
          text,
          starCountCleanliness,
          starCountFacilities,
          author,
          userId,
        } = req.body;
        const garden = await Garden.findOne({ id: gardenId });
        if (!garden) return res.status(401).send("cant find garden");
        let cleanCal =
          (garden.rating.cleanliness_score + starCountCleanliness) / 2;
        garden.rating.cleanliness_score = cleanCal;
        let facilitiesCal =
          (garden.rating.facilities_score + starCountFacilities) / 2;
        garden.rating.facilities_score = facilitiesCal;
        const userReview = {
          author: author,
          user_id: userId,
          text: text,
        };
        garden.rating.user_reviews.push(userReview);
        await garden.save();
        return res.status(200).send("review insert successfully");
      })
      .catch((err) => {
        console.log(`addReview connection error: ${err}`);
      });
  },

  getGardens(req, res, next) {
    mongoose.connect(url, options).then(
      () => {
        Garden.find({}, (err, gardens) => {
          if (err) console.log(`err: ${err}`);

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

  getPresentDogsInGarden(req, res, next) {
    //params: gardenId

    mongoose.connect(url, options).then(
      async () => {
        const result = await Garden.findOne({ id: req.body.gardenId });
        if(!result) return res.status(404).send(`Cant find garden ${req.body.gardenId}`);
        const presentDogsIds = await dog.find({ id: { $in: result.present_dogs }});
        if (!presentDogsIds) return res.status(404).send(`Cant find dogs ${result.present_dogs}`);
        let presentDogsProfiles = [], i;
        for(i=0; i<presentDogsIds.length;i++) {
          const ownersObjects = await User.find({ id: { $in: presentDogsIds[i].owners }});
          if (ownersObjects) {
            await presentDogsProfiles.push({dogInfo: presentDogsIds[i], ownersInfo: ownersObjects});
          }
          if (!ownersObjects) await presentDogsProfiles.push({dogInfo: presentDogsIds[i], ownersInfo: null});
        }
          res.json(presentDogsProfiles);
          console.log(`returned present dogs`);
          return;
      },
      (err) => {
        console.log(`connection error: ${err}`);
      }
    );
  },

  getOwnerDogs(req, res, next) {
    //params: ownerId

    mongoose.connect(url, options).then(
      async () => {
        const ownerDogs = await dog.find({ id: { $in: req.body.dogs }});
        if (!ownerDogs) return res.status(404).send(`Cant find dogs ${req.body.dogs}`);
          res.json(ownerDogs);
          return;
      },
      (err) => {
        console.log(`getOwnerDogs mongoose error: ${err}`);
      }
    );
  },

  insertGarden(req, res, next) {
    // --->>> create new garden doc
    const garden = {
      id: 304,
      name: "Dvir Garden",
      image:
        "https://media-cdn.tripadvisor.com/media/photo-s/08/c9/d0/57/nice-park.jpg",
      lat: 31.6925124,
      long: 34.5762511,
      present_dogs: [1, 2],
      daily_visitors: {
        date: new Date(),
        dogs_visitors: [
          {
            dog_id: 1,
          },
          {
            dog_id: 2,
          },
        ],
        users_visitors: [101],
      },
    };
    mongoose
      .connect(url, options)
      .then(async () => {
        // // --->>> create new garden doc
        const g2 = new Garden(garden);
        const doc = await g2.save();
        return res.status(200).send(" New garden created");
      })
      .catch((err) => {
        console.log(`connection error: ${err}`);
        res.status(500).send("$");
      });
  },
  dogsEnterGarden(req, res, next) {
    const { pass, dogs_ids, garden_id } = req.body;
    if (pass != garden_sensor_pass) {
      res.status(401).send("Unauthorized request");
      return;
    } else {
      const dogsIdsWithDup = Array.from(dogs_ids.split(","));
      const dogsIds = Array.from(new Set(dogsIdsWithDup));
      const gardenId = garden_id;
      mongoose
        .connect(url, options)
        .then(async () => {
          const g1 = await Garden.findOne({ id: gardenId }); // find garden
          if (!g1) res.status(501).send("$ Cant find garden");

          const dailyVisitors = g1.daily_visitors[0]; // current day visitors
          let dogVisitors = dailyVisitors.dogs_visitors;
          let userVisitors = dailyVisitors.users_visitors;
          g1.present_dogs = dogsIds; // replace with updated current dogs in garden
          const nowDate = new Date();
          let dogFoundInGarden, i, j, dogOwners;
          for (i = 0; i < dogsIds.length; i++) {
            const dogId = dogsIds[i];
            let dogToFind = await dog.findOne({ id: dogId });
            if (!dogToFind) {
              console.log("$ Cant find dog Id in DB,", dogId);
              continue;
            }
            dogFoundInGarden = await dogVisitors.find(
              (dogVisitor) => dogVisitor.dog_id == dogId
            );
            // first time dog visit in garden or first time in that day
            if (!dogFoundInGarden) {
              let dogGardens = dogToFind.visited_gardens;
              const isNewGardenForDog = dogGardens.find(
                (garden) => garden.garden_id == gardenId
              );
              if (!isNewGardenForDog) {
                // new garden for dog
                dogGardens.unshift(
                  new visitedGarden({
                    garden_id: gardenId,
                    last_visit: nowDate,
                    total_visits: 1,
                  })
                );
              } else {
                dogToFind = newDogVisit(dogToFind, gardenId, nowDate);
              }
              dogVisitors.unshift(
                new DogVisitor({
                  dog_id: dogId,
                  first_scan: nowDate,
                  last_scan: nowDate,
                })
              );
              const cleanOwners = Array.from(dogToFind.owners);
              let f;
              for (f = 0; f < cleanOwners.length; f++) {
                if (userVisitors.includes(cleanOwners[f])) continue;
                else userVisitors.push(cleanOwners[f]);
              }
            } else {
              const millis = nowDate - new Date(dogFoundInGarden.last_scan);
              const minutesSinceLastScan = Math.floor(millis / 60000);
              if (minutesSinceLastScan < 60) {
                dogFoundInGarden.last_scan = nowDate;
                dogFoundInGarden.total_attendance_minutes += minutesSinceLastScan;
              } else {
                // after an hour it is a new visit
                dogToFind = addMinutesToAvgPlayTime(
                  dogToFind,
                  gardenId,
                  dogFoundInGarden.total_attendance_minutes
                );
                dogFoundInGarden.last_scan = nowDate;
                dogFoundInGarden.first_scan = nowDate;
                dogFoundInGarden.total_attendance_minutes = 0;
                dogToFind = newDogVisit(dogToFind, gardenId, nowDate);
              }
            }
            await dogToFind.save();
          }
          await g1.save();
          return res.status(200).send("& All updated successfully");
        })
        .catch((err) => {
          console.log(`catch mongoose error: ${err}`);
          res.status(500).send("$");
        });
    }
  },
};
//FUNCTIONS OUTSIDE MODULE.EXPORTS

function newDogVisit(dog, gardenId, nowDate) {
  const dogGardens = dog.visited_gardens;
  dogGardens.find((garden) => {
    if (garden.garden_id == gardenId) {
      garden.last_visit = nowDate;
      garden.total_visits++;
    }
  });
  return dog;
}

function addMinutesToAvgPlayTime(dog, gardenId, totalAttendanceMinutes) {
  if (totalAttendanceMinutes == 0) return dog;
  const dogGardens = dog.visited_gardens;
  dogGardens.find((garden) => {
    if (garden.garden_id == gardenId) {
      if (garden.avg_play_time == 0)
        garden.avg_play_time = totalAttendanceMinutes;
      else {
        garden.avg_play_time =
          (garden.avg_play_time + totalAttendanceMinutes) / 2;
      }
    }
  });
  return dog;
}
