const mongoose = require('mongoose');
const ageCalculator = require('../middleware/age-calculator');

require('../models/User');
const User = mongoose.model('users');

exports.setGender = function (gender) {
    if (gender === 'male') {
        return "female"
    } else {
        return "male"
    }
}

exports.setMinAge = function (gender) {
    var minAge
    User.find({ gender: gender }).then(data => {
        minAge = ageCalculator(data[0].dateOfBirth)
        data.forEach(element => {
            var age = ageCalculator(element.dateOfBirth)
            if (minAge > age) {
                minAge = age
            }
        });
        return minAge
    }).catch(err => {
        console.log(err)
    })
}

exports.setMaxAge = function (gender) {
    var maxAge
    User.find({ gender: gender }).then(data => {
        maxAge = ageCalculator(data[0].dateOfBirth)
        data.forEach(element => {
            var age = ageCalculator(element.dateOfBirth)
            if (maxAge < age) {
                maxAge = age
            }
        });
    }).catch(err => {
        console.log(err)
    })
    return maxAge
}
