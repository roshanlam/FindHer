const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const ageCalculator = require('../middleware/age-calculator');

const USERS_PER_PAGE = 6;

require('../models/Like');
const Like = mongoose.model('likes');

require('../models/User');
const User = mongoose.model('users');

//Like user
router.post('/:id', checkAuth, async (req, res) => {
    await User.findById(req.params.id).then(async user => {
        await Like.findOne({ likerId: req.loggedInUserData._id, likeeId: req.params.id }).then(async alreadyLiked => {
            if (alreadyLiked) {
                Like.findOneAndDelete({ likerId: req.loggedInUserData._id, likeeId: req.params.id }).exec()
                return res.status(200).json({
                    message: "You have disliked " + user.knownAs + "."
                })
            }
            const like = new Like({
                likerId: req.loggedInUserData._id,
                likeeId: req.params.id
            })
            await like.save().then(() => {
                res.status(200).json({
                    message: "You have liked " + user.knownAs + "."
                })
            }).catch(err => {
                res.status(500).json({
                    message: err.name
                })
            })
        })
    }).catch(err => {
        res.status(404).json({
            message: "User not found"
        })
    })
})

//Get likees details
router.get('/likees', checkAuth, async (req, res) => {
    const page = +req.query.page || 1
    await Like.find({ likerId: req.loggedInUserData._id }).countDocuments().then(async numberOfLikes => {
        totalLikes = numberOfLikes;
        return await Like.find({ likerId: req.loggedInUserData._id }, { likeeId: 1 }).skip((page - 1) * USERS_PER_PAGE).limit(USERS_PER_PAGE).populate({ path: 'likeeId', populate: { path: 'photos', select: { url: 1, _id: 0 }, match: { isMain: true } } })
    }).then(async result => {
        if (result.length === 0) {
            return res.status(404).json({
                message: "No likes"
            })
        }
        var details = []
        result.forEach(element => {
            var age = ageCalculator(element.likeeId.dateOfBirth);
            const object = {
                _id: element.likeeId._id,
                gender: element.likeeId.gender,
                knownAs: element.likeeId.knownAs,
                city: element.likeeId.city,
                age: age,
                like_id: element._id,
                likeThisPerson: true
            }
            if (element.likeeId.photos[0]) {
                object.photoUrl = element.likeeId.photos[0].url
            } else {
                if (element.likeeId.gender === "male") {
                    photoUrl = "https://www.bootdey.com/img/Content/avatar/avatar7.png"
                } else {
                    photoUrl = "http://www.cocoonbag.com/Content/images/feedback2.png"
                }
                object.photoUrl = photoUrl
            }
            details.push(object)
        });
        pagination = { previousPage: page - 1, currentPage: page, nextPage: page + 1, lastPage: Math.ceil(totalLikes / USERS_PER_PAGE), totalLikes: totalLikes }
        await res.status(200).json({
            details,
            pagination
        })
    }).catch(err => {
        res.status(500).json({
            message: err.name
        })
    })
})

//Get likers details
router.get('/likers', checkAuth, async (req, res) => {
    const page = +req.query.page || 1
    await Like.find({ likeeId: req.loggedInUserData._id }).countDocuments().then(async numberOfLikes => {
        totalLikes = numberOfLikes;
        return await Like.find({ likeeId: req.loggedInUserData._id }, { likerId: 1 }).skip((page - 1) * USERS_PER_PAGE).limit(USERS_PER_PAGE).populate({ path: 'likerId', populate: { path: 'photos', select: { url: 1, _id: 0 }, match: { isMain: true } } })
    }).then(async result => {
        var details = []
        result.forEach(element => {
            var age = ageCalculator(element.likerId.dateOfBirth);
            const object = {
                _id: element.likerId._id,
                gender: element.likerId.gender,
                knownAs: element.likerId.knownAs,
                city: element.likerId.city,
                age: age,
                like_id: element._id
            }
            if (element.likerId.photos[0]) {
                object.photoUrl = element.likerId.photos[0].url
            } else {
                if (element.likerId.gender === "male") {
                    photoUrl = "https://www.bootdey.com/img/Content/avatar/avatar7.png"
                } else {
                    photoUrl = "http://www.cocoonbag.com/Content/images/feedback2.png"
                }
                object.photoUrl = photoUrl
            }
            details.push(object)
        });
        pagination = { previousPage: page - 1, currentPage: page, nextPage: page + 1, lastPage: Math.ceil(totalLikes / USERS_PER_PAGE), totalLikes: totalLikes }
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
    }).catch(err => {
        res.status(500).json({
            message: err.name
        })
    })
})

module.exports = router;
