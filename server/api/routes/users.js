const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const ageCalculator = require('../middleware/age-calculator');
const userFilter = require('../middleware/user-filter');

const USERS_PER_PAGE = 6;

require('../models/User');
const User = mongoose.model('users');

require('../models/Like');
const Like = mongoose.model('likes');

//SignUp a User
router.post('/signup', async (req, res) => {
    await User.findOne({ userName: req.body.userName.trim().toLowerCase() }).exec().then(existingUserName => {
        if (existingUserName) {
            return res.status(409).json({
                message: "User Name already in use. Please enter another one."
            })
        }
        if (ageCalculator(new Date(req.body.dateOfBirth)) < 18) {
            return res.status(409).json({
                message: "Age should be above 18."
            })
        }
        bcrypt.hash(req.body.password, 15, function (err, hash) {
            if (err) {
                return res.status(500).json({
                    message: err
                })
            } else {
                const user = new User({
                    userName: req.body.userName.trim().toLowerCase(),
                    password: hash,
                    createdDate: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    gender: req.body.gender,
                    dateOfBirth: req.body.dateOfBirth,
                    knownAs: req.body.knownAs,
                    city: req.body.city,
                    country: req.body.country
                })
                user.save().then(result => {
                    res.status(201).json({
                        message: "Your account is created"
                    })
                }).catch(error => {
                    res.status(500).json({
                        message: error.name
                    })
                })
            }
        })
    })
})

//Login
router.post('/login', async (req, res, next) => {
    await User.findOne({ userName: req.body.userName.trim().toLowerCase() }).populate('photos', { url: 1, _id: 0 }, { isMain: true }).exec().then(foundUser => {
        if (!foundUser) {
            return res.status(401).json({
                message: "Auth failed"
            })
        }
        if (foundUser.photos.length === 0) {
            if (foundUser.gender === "male") {
                foundUser.photos[0] = { url: "https://www.bootdey.com/img/Content/avatar/avatar7.png" }
            } else {
                foundUser.photos[0] = { url: "http://www.cocoonbag.com/Content/images/feedback2.png" }
            }
        }
        bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
            if (err) {
                return res.status(401).json({
                    message: "Auth failed"
                })
            }
            if (result) {
                const token = jwt.sign({ knownAs: foundUser.knownAs, _id: foundUser._id, gender: foundUser.gender }, process.env.JWT_KEY, { expiresIn: "1h" })
                return res.status(200).json({
                    message: "Login successful",
                    token: token,
                    mainPhotoUrl: foundUser.photos[0].url
                })
            }
            res.status(401).json({
                message: "Auth failed"
            })
        });
    })
})

//Create Profile
router.patch('/create/:id', checkAuth, async (req, res, next) => {
    await User.findByIdAndUpdate(req.params.id, {
        introduction: req.body.introduction,
        lookingFor: req.body.lookingFor,
        interests: req.body.interests,
        city: req.body.city,
        country: req.body.country
    }).exec().then(() => {
        res.status(201).json({
            message: "Your data has been updated"
        })
    }).catch(error => {
        res.status(500).json({
            message: error.name
        })
    })
})

//Get all user dedails
router.get('/', checkAuth, async (req, res) => {
    const page = +req.query.page || 1
    const gender = req.query.gender || userFilter.setGender(req.loggedInUserData.gender)
    const minAge = +req.query.minAge || 18
    const maxAge = +req.query.maxAge || 99
    const orderedList = req.query.orderedList || "lastActive"
    await User.find().where('gender', gender).sort('-lastActive').populate('photos', { url: 1, _id: 0 }, { isMain: true }).then(async Users => {
        var unfilteredDetails = []
        await Users.forEach(element => {
            var age = ageCalculator(element.dateOfBirth)
            if (age > minAge && age < maxAge) {
                if (element._id != req.loggedInUserData._id) {
                    const object = {
                        _id: element._id,
                        userName: element.userName,
                        gender: element.gender,
                        knownAs: element.knownAs,
                        createdDate: element.createdDate,
                        city: element.city,
                        country: element.country,
                        age: age
                    }
                    if (element.photos[0]) {
                        object.photoUrl = element.photos[0].url
                    } else {
                        if (element.gender === "male") {
                            photoUrl = "https://www.bootdey.com/img/Content/avatar/avatar7.png"
                        } else {
                            photoUrl = "http://www.cocoonbag.com/Content/images/feedback2.png"
                        }
                        object.photoUrl = photoUrl
                    }
                    unfilteredDetails.push(object)
                }
            }
        })
        var details;
        if (orderedList === "created") {
            details = await unfilteredDetails.sort(function (a, b) { return b.createdDate - a.createdDate }).slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE)
        } else if (orderedList === "lastActive") {
            details = await unfilteredDetails.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE)
        }
        pagination = { previousPage: page - 1, currentPage: page, nextPage: page + 1, lastPage: Math.ceil(unfilteredDetails.length / USERS_PER_PAGE), totalUsers: unfilteredDetails.length }
        return { details, pagination }
    }).then(async data => {
        await Like.find({ likerId: req.loggedInUserData._id }).then(likes => {
            likes.forEach(likesElement => {
                data.details.forEach(async element => {
                    if (likesElement.likeeId == element._id.toString()) {
                        return element.likeThisPerson = true;
                    }
                });
            });
        })
        res.status(200).json({
            details: data.details,
            pagination: data.pagination
        })
    }).catch(error => {
        return res.status(500).json({
            message: error.name
        })
    })
})

//Get one user details
router.get('/:id', checkAuth, async (req, res) => {
    await User.findById(req.params.id, { password: 0, __v: 0 }).populate('photos').exec((err, result) => {
        if (err) {
            return res.status(500).json({
                message: err.name
            })
        }
        const response = {
            _id: result._id,
            knownAs: result.knownAs,
            introduction: result.introduction,
            lookingFor: result.lookingFor,
            interests: result.interests,
            photos: result.photos,
            createdDate: result.createdDate,
            city: result.city,
            country: result.country,
            dateOfBirth: result.dateOfBirth,
            gender: result.gender,
            lastActive: result.lastActive
        }
        result.photos.forEach(element => {
            if (element.isMain === true) {
                response.photoUrl = element.url
            }
        });
        if (response.photoUrl === undefined) {
            if (result.gender === 'male') {
                response.photoUrl = "https://www.bootdey.com/img/Content/avatar/avatar7.png"
            } else {
                response.photoUrl = "http://www.cocoonbag.com/Content/images/feedback2.png"
            }
        }
        response.age = ageCalculator(result.dateOfBirth)
        Like.find({ likerId: req.loggedInUserData._id }).then(likes => {
            likes.forEach(likesElement => {
                if (likesElement.likeeId == result._id.toString()) {
                    return response.likeThisPerson = true;
                }
            });
            res.status(200).json(response)
        }).catch(error => {
            res.status(500).json({
                message: error.name
            })
        })
    })
})

module.exports = router;
