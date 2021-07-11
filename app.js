const express = require('express')
require('dotenv').config()
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const app = express()
const port = process.env.PORT || 5000

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))

// Templating Engine
app.engine('hbs', exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'hbs');


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 2629800000
    },
    saveUninitialized:false,
    resave:false
}))
// Routes
const newsRouter = require('./routes/news')
const adminRouter = require('./routes/admin')

app.use('/', newsRouter)
app.use('/admin', adminRouter)

// Listen
app.listen(port, () => console.log(`Listening on port ${port}`))