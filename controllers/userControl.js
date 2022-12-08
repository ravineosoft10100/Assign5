const express = require('express');
const UserSchema = require('../models/regisModel')
const model = require('mongoose');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const seceret = "assd123^&*^&*ghghggh";
const oneDay = 1000 * 60 * 60 * 24;
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars');
const userRoute = require('../routes/userRoute')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
const sessions = require('express-session');
const app = express();

const rn = require('random-number');
var verifyotp;
var verifymail;

app.use(sessions({
    secret: 'spopwjdpoawjfpoaejf9u490urf094u',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    }
}))

var session;

// Nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: "ravicom571@gmail.com",
        pass: "ndlwrsgfkxpyakxg"
    }
});

transporter.use('compile', hbs(
    {
        viewEngine: 'nodemailer-express-hbs',
        viewPath: 'template'
    }
))

const csrfMiddleware = csurf({
    cookie: true
})

function saveUser(req, res) {
    const regName = new RegExp(/^([a-zA-Z ]){2,30}$/);
    const regMail = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    const regUser = new RegExp(/^[A-Za-z][A-Za-z0-9_]{7,29}$/);
    const regPass = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/);

    var { name, email, username, password } = req.body
    const hash = bcrypt.hashSync(password, saltRounds);
    var name = name.toString().trim();
    var email = email.toString().trim();
    var username = username.toString().trim();
    var password = password.toString().trim();

    if (name === '' || email === '' || username === '' || password === '') {
        res.render('register', { errMsg: "Fields are missing!" })
    }

    else {

        if (regName.test(name) && regMail.test(email) && regUser.test(username) && regPass.test(password)) {

            var image = req.file.filename;
            // var info = new UserSchema.create({ name: name, email: email, username: username, password: hash, image: image })
            UserSchema.create({ name: name, email: email, username: username, password: hash, image: image })
                .then(data => {
                    let mailOptions = {
                        from: 'ravicom571@gmail.com',
                        to: email,
                        subject: "Activation mail",
                        template: 'mail',
                        context: {
                            name: name,
                            id: data._id
                        }
                    }
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) { console.log(err) }
                        else {
                            console.log("Mail sent : " + info)
                            res.redirect("/user/login")
                        }
                    })
                })
                .catch((err) => {
                    res.render("register", { errMsg: "User Already Registered" })
                })
        }
    }


}

async function activateAcc(req, res) {
    let id = req.params.id;
    // res.send(id);
    await UserSchema.updateOne({ _id: id }, { $set: { status: true } })
        .then(data => {
            console.log(id)
            res.render("activate")
        })
        .catch(err => {
            res.send("Some Thing Went Wrong")
        })
}

async function login_post(req, res) {
    let { user, pass } = req.body;
    if (user === '' || pass === '') {
        res.render('login', { errMsg: "Fields can't be blank!!" })
    }
    else {
        await UserSchema.findOne({ username: user })
            .then(data => {
                if (data.status == true) {
                    if (bcrypt.compareSync(pass, data.password)) {
                        console.log(data.image);
                        res.render('welcome', {
                            id: data._id,
                            name: data.name,
                            path: '/static/uploads/' + data.image
                        });
                    }
                    else {
                        return res.redirect("/user/welcome?msg=fail");
                    }
                }
                else {
                    res.render('login', { errMsg: "Activate your account first!" })
                }

            })
            .catch(err => {
                res.send(false)
            })
    }
}

async function forgatePass(req, res) {
    const uid = req.params._id;
    await UserSchema.findOne({ _id: uid })
        .then(data => {
            res.render('forgatepass')

        })
        .catch(err => {
            res.send(err)
        })
}

function change_pass(req, res) {
    // res.send(true)
    const uid = req.params._id;
    let pass = req.body.newpass;

    console.log(uid, pass);
    const hash = bcrypt.hashSync(pass, saltRounds)
    UserSchema.updateOne({ _id: uid }, { $set: { password: hash } })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.send("Some Thing Went Wrong")
        })
}

async function forget_post(req, res) {
    let mail = req.body.email;
    var options = {
        min: 1000
        , max: 9999
        , integer: true
    }
    const random = rn(options);

    try {
        await UserSchema.findOne({ email: mail })
            .then(data => {
                let mailOptions = {
                    from: 'ravicom571@gmail.com',
                    to: mail,
                    subject: "Reset password",
                    template: 'reset',
                    context: {
                        username: data.name,
                        otp: random
                    }
                }
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) { console.log(err) }
                    else {
                        verifymail = mail;
                        verifyotp = random;
                        console.log("Mail sent : " + info);
                        res.render('otp');
                    }
                })
            })
    } catch (error) {
        res.render('forgetpass')
    }
}

function otp_post(req, res) {
    let otp = req.body.otp;
    console.log(otp, verifyotp)
    if (otp == verifyotp) {

        verifyotp = undefined;
        console.log('object');
        res.render('resetpass');
    } else {
        verifyotp = undefined;
        console.log('kuch bhi random key')
        res.render('forgetpass');
    }
}


function reset_post(req, res) {

    const password = req.body.pass;
    UserSchema.updateOne({ email: verifymail }, { $set: { password: bcrypt.hashSync(password, saltRounds) } })
        .then(data => {
            verifymail = undefined;
            res.render('resetpass', {
                succMsg: "Password successfully changed"
            })
        })
        .catch(error => {
            verifymail = undefined;
            res.render('login');
        })
}

module.exports = { saveUser, activateAcc, forgatePass, change_pass, login_post, forget_post, otp_post, reset_post };