var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const accountController = require('./Controllers/AccountController')
const matchController = require('./Controllers/MatchController')
const mapController = require('./Controllers/MapController')
const profileController = require('./Controllers/ProfileController')
const algorithmController = require('./Controllers/AlgorithmController')

app.use(bodyParser.json())
app.use(express.json())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/version', (req, res, next) => {
    console.log('Request HTTP Version: ', req.httpVersion)
})

//ACCOUNT
app.post('/register', accountController.register)
app.post('/login', accountController.login)
//PROFILE
app.post('/editUserProfile', profileController.editUserProfile)
app.post('/editDogProfile', profileController.editDogProfile)
app.post('/addDog', profileController.addDog)
//MATCH
app.post('/getMatches', matchController.getMatches)
//MAP
app.get('/getGardens', mapController.getGardens)
app.post('/getPresentDogsInGarden', mapController.getPresentDogsInGarden)
app.post('/dogsEnterGarden', urlencodedParser, mapController.dogsEnterGarden)
//ALGORITHM
app.get('/Matcher', algorithmController.Matcher)
app.post('/createDogMatch', algorithmController.createDogMatch)

app.listen(5050)
console.log('Server is running')