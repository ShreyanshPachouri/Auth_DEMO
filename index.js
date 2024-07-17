const express = require('express')
const app = express()
const User = require('./models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const session = require('express-session')

mongoose.connect('mongodb://localhost:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'notagoodsecret'}))

app.listen(3000, (req, res) => {
    console.log('Server is running on port 3000')
})

const requireLogin = (req, res, next) => {
        if (req.session.user_id) {
            return next()
        } else{
            res.redirect('/login')
        }
}

app.get('/', requireLogin, (req, res) => {
    res.send('Home Page')
})

app.get('/secrets', requireLogin, (req, res) => {
        res.render('secrets')
    
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async(req, res) => {
    const {username, password} = req.body
    const user = new User({username, password})
    //Take a good look at user.js to understand this
    await user.save()
    req.session.user_id = user._id
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await User.findandvalidate(username, password)

        if(result){
            req.session.user_id = result._id
            res.redirect('/secrets')
        } else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('An error occurred');
    }
});

app.post('/logout', (req, res) => {
    req.session.user_id = null
    res.redirect('/login')
})