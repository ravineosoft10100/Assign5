const express = require('express');
const app = express();
const hbs = require('hbs')
const PORT = 1155;
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')
const bodyParser = require("body-parser")

//requiring routes
const mainRoute = require('./routes/mainRoute');
const userRoute = require('./routes/userRoute');

//Middlewares
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

//Setting template hbs engine
app.set('view engine', 'hbs');
app.set('views', './views');

hbs.registerPartials('views/partials');
app.use('/static', express.static('public'))
// app.use(express.static('public'))

//Databse connection
mongoose.connect("mongodb://127.0.0.1/technology")
    .then(res => console.log("Connected"))
    .catch(err => console.log("error" + err))



app.use('/', mainRoute);
app.use('/user', userRoute);


app.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`Server work on http://localhost:${PORT}`);
})