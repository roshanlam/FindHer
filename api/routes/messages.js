const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

require('../models/Message');
const Message = mongoose.model('messages');

//Sent message
router.post('/:id', checkAuth, async (req, res) => {
    if (req.loggedInUserData._id === req.params.id) {
        return res.status(400).json({
            message: "Bad request."
        })
    }
    const message = new Message({
        senderId: req.loggedInUserData._id,
        recipientId: req.params.id,
        dateSent: new Date(),
        content: req.body.content
    })
    message.save().then(result => {
        Message.findById(result._id)
            .populate({ path: 'senderId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
            .populate({ path: 'recipientId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
            .then(data => {
                const response = {
                    _id: data._id,
                    isRead: data.isRead,
                    dateSent: data.dateSent,
                    dateRead: data.dateRead,
                    content: data.content,
                    senderDetails: {
                        _id: data.senderId._id,
                        knownAs: data.senderId.knownAs,
                        photoUrl: data.senderId.photos.length !== 0 ? data.senderId.photos[0].url : data.senderId.gender === "male" ? "https://www.bootdey.com/img/Content/avatar/avatar7.png" : "http://www.cocoonbag.com/Content/images/feedback2.png"
                    },
                    receiverDetails: {
                        _id: data.recipientId._id,
                        knownAs: data.recipientId.knownAs,
                        photoUrl: data.recipientId.photos.length !== 0 ? data.recipientId.photos[0].url : data.recipientId.gender === "male" ? "https://www.bootdey.com/img/Content/avatar/avatar7.png" : "http://www.cocoonbag.com/Content/images/feedback2.png"
                    }
                }
                res.status(201).json(response)
            })

    }).catch(err => {
        res.status(500).json({
            err
        })
    })
})

//Get unread messages
router.get('/', checkAuth, async (req, res) => {
    Message.find({ recipientId: req.loggedInUserData._id, isRead: false })
        .sort('senderId -dateSent')
        .populate({ path: 'senderId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
        .then(unreadMessages => {
            const mapArray = unreadMessages.map(element => {
                return {
                    _id: element._id,
                    isRead: element.isRead,
                    dateSent: element.dateSent,
                    content: element.content,
                    senderDetails: {
                        _id: element.senderId._id,
                        knownAs: element.senderId.knownAs,
                        photoUrl: element.senderId.photos.length !== 0 ? element.senderId.photos[0].url : element.senderId.gender === "male" ? "https://www.bootdey.com/img/Content/avatar/avatar7.png" : "http://www.cocoonbag.com/Content/images/feedback2.png"
                    }
                }
            })
            var response = []
            let count = 0
            let initial = mapArray[0]
            mapArray.forEach(element => {
                if (initial.senderDetails._id !== element.senderDetails._id) {
                    initial.totalMessages = count
                    response.push(initial)
                    initial = element
                    count = 0
                }
                if (element._id === mapArray[mapArray.length - 1]._id) {
                    initial.totalMessages = count + 1
                    response.push(initial)
                } else {
                    count++
                }
            });
            res.status(200).json(response)
        }).catch(err => {
            res.status(500).json({
                err
            })
        })
})

//Get new message notification
router.get('/messageNotification', checkAuth, async (req, res) => {
    Message.find({ recipientId: req.loggedInUserData._id, isRead: false })
        .select('senderId')
        .sort('senderId')
        .then(unreadMessages => {
            if (unreadMessages.length === 0) {
                return res.json()
            }
            let count = 1
            let initial = unreadMessages[0].senderId
            unreadMessages.forEach(element => {
                if (initial.toString() !== element.senderId.toString()) {
                    count++;
                    initial = element.senderId
                }
            });
            res.status(200).json(count)
        }).catch(err => {
            res.status(500).json({
                err
            })
        })
})

//Get chat
router.get('/:id', checkAuth, async (req, res) => {
    Message.find({ senderId: req.params.id, recipientId: req.loggedInUserData._id, isRead: false })
        .updateMany({ isRead: true, dateRead: new Date() })
        .then(updateList => {
            Message.find({ senderId: req.loggedInUserData._id, recipientId: req.params.id })
                .populate({ path: 'senderId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
                .populate({ path: 'recipientId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
                .then(sendMessages => {
                    Message.find({ senderId: req.params.id, recipientId: req.loggedInUserData._id })
                        .populate({ path: 'senderId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
                        .populate({ path: 'recipientId', select: 'knownAs gender', populate: { path: 'photos', select: 'url', match: { isMain: true } } })
                        .then(receiveMessages => {
                            const chatDetails = sendMessages.concat(receiveMessages).sort((a, b) => { return a.dateSent - b.dateSent })
                            const response = chatDetails.map(element => {
                                return {
                                    _id: element._id,
                                    isRead: element.isRead,
                                    dateSent: element.dateSent,
                                    dateRead: element.dateRead,
                                    content: element.content,
                                    senderDetails: {
                                        _id: element.senderId._id,
                                        knownAs: element.senderId.knownAs,
                                        photoUrl: element.senderId.photos.length !== 0 ? element.senderId.photos[0].url : element.senderId.gender === "male" ? "https://www.bootdey.com/img/Content/avatar/avatar7.png" : "http://www.cocoonbag.com/Content/images/feedback2.png"
                                    },
                                    receiverDetails: {
                                        _id: element.recipientId._id,
                                        knownAs: element.recipientId.knownAs,
                                        photoUrl: element.recipientId.photos.length !== 0 ? element.recipientId.photos[0].url : element.recipientId.gender === "male" ? "https://www.bootdey.com/img/Content/avatar/avatar7.png" : "http://www.cocoonbag.com/Content/images/feedback2.png"
                                    }
                                }
                            })

                            res.status(200).json({response:response,updateList:updateList.n})
                        }).catch(err => {
                            res.status(500).json({
                                err
                            })
                        })
                }).catch(err => {
                    res.status(500).json({
                        err
                    })
                })
        }).catch(err => {
            res.status(500).json({
                err
            })
        })
})

module.exports = router;
