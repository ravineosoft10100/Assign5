const { saveUser, activateAcc, login_post, forgatePass, change_pass, forget_post, otp_post, reset_post } = require('../controllers/userControl');
const UserSchema = require('../models/regisModel')
const express = require('express');
const app = express()
const sessions = require('express-session');
const seceret = "assd123^&*^&*ghghggh";
const oneDay = 1000 * 60 * 60 * 24;
const router = express.Router();
const multer = require('multer');
const path = require('path')
const csurf = require('csurf');

// start upload code 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/uploads"))
    },
    filename: function (req, file, cb) {
        fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + Date.now() + fileExtension)

    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
            cb(null, true)
        }
        else {
            cb(null, false);
            cb(new Error("Only png and jpg formet allowed"))
        }
    }
});
const uploadSingle = upload.single("image");

const csrfMiddleware = csurf({
    cookie: true
})

app.use(csrfMiddleware);

app.use(sessions({
    secret: seceret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}))
var session;


router.get('/register', (req, res) => {
    res.render('register');
})
router.post('/regis_post', uploadSingle, saveUser);

router.get('/login', (req, res) => {
    res.render('login');
})

router.post("/login_post", login_post);



router.get('/activateacc/:id', activateAcc);

router.get('/userDash', (req, res) => {
    return res.render('userDash')
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect("/user/login");
})

router.get('/welcome/:id', (req, res) => {
    res.render('welcome');
})

// router.get('/changepass', forgatePass);
router.get('/changepass/:id', (req, res) => {
    res.render('changepass')
});

router.post('/change_pass', change_pass)

router.get('/forgatepass', (req, res) => {
    res.render('forgetpass');
})

router.post('/forget_post', forget_post);

router.get('/otp', (req, res) => {
    render('otp')
})
router.post('/otp_post', otp_post)

router.post('/reset_passpost', reset_post);




module.exports = router