const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
// const session = require('express-session');

const app = express();

app.use(express.static(path.join(__dirname, 'wwwroot')));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

//Database config
const database = require('./config/database')

// Routes require
const userRoutes = require("./api/routes/users")
const photoRoutes = require("./api/routes/photos")
const likeRoutes = require("./api/routes/likes")
const messageRoutes = require("./api/routes/messages")

app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('file'))
app.use(express.static(path.join(__dirname, 'images')))

mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect(database.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MogoDB Connected...'))
    .catch(err => console.log(err))

// app.use(session({
//     secret: 'secretcookies',
//     saveUninitialized: true,
//     resave: false
// }))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use("/api/users", userRoutes)
app.use("/api/photos", photoRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/messages", messageRoutes)
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'wwwroot/index.html'))
})
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;
