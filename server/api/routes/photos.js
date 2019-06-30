const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const checkAuth = require('../middleware/check-auth');

require('../models/Photo');
const Photos = mongoose.model('photos');

require('../models/User');
const User = mongoose.model('users');

//Add photo
router.post('/:id', checkAuth, async (req, res, next) => {
    if (!req.file) {
        return res.status(422).json({
            message: "error"
        })
    }
    // console.log(req.file)

    const photos = new Photos({
        url: "http://localhost:5000/" + req.file.filename,
        filePath: req.file.path,
        description: req.file.originalname,
        dateAdded: new Date().toISOString(),
        userId: req.params.id
    })

    photos.save().then(result => {
        User.findById(req.params.id).then(userDetails => {
            if (userDetails.photos.length === 0) {
                Photos.findByIdAndUpdate(result._id, { isMain: true }).exec()
            }
            userDetails.photos.splice(userDetails.photos.length, 0, result._id)
            User.findByIdAndUpdate(req.params.id, { photos: userDetails.photos }).then(() => {
                Photos.findById(result._id).then(response => {
                    res.status(201).json(
                        response
                    )
                })
            })
        })
    })
})

//Change the main photo
router.patch('/setMain/:id', checkAuth, async (req, res) => {
    await Photos.findOne({ _id: req.params.id, userId: req.loggedInUserData._id }).then(async authorization => {
        if (!authorization) {
            return res.status(401).json({
                message: "Auth Failed."
            })
        }
        if (authorization.isMain === true) {
            return res.status(400).json({
                message: "This is already the main photo."
            })
        }
        await Photos.findOneAndUpdate({ userId: req.loggedInUserData._id, isMain: true }, { isMain: false }).then(async () => {
            await Photos.findByIdAndUpdate(req.params.id, { isMain: true }).then(() => {
                return res.status(201).json({
                    message: "Photo is set to main."
                })
            })
        })
    })
})

//Delete photo
router.delete('/:id', checkAuth, async (req, res) => {
    await Photos.findOne({ _id: req.params.id, userId: req.loggedInUserData._id }).then(async authorization => {
        if (!authorization) {
            return res.status(401).json({
                message: "Auth Failed."
            })
        }
        if (authorization.isMain === true) {
            return res.status(400).json({
                message: "You cannot delete your main photo."
            })
        }
        await Photos.findByIdAndDelete(req.params.id).then(() => {
            fs.unlink(authorization.filePath, (err) => {
                if (err) {
                    throw (err)
                }
            });
            User.findById(req.loggedInUserData._id).then(async data => {
                data.photos.splice(data.photos.findIndex(p => p._id === req.params.id), 1)
                await User.findByIdAndUpdate(req.loggedInUserData._id, { photos: data.photos }).then(() => {
                    return res.status(201).json({
                        message: "Photo is deleted."
                    })
                })
            })
        })
    })
})

module.exports = router;
