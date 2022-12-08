const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('home')
})

router.get('/gallery', (req, res) => {
    res.send('<h2>this is our gallery section<h2>')
})



module.exports = router;