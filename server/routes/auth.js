const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const { body } = require('express-validator/check')
const User = require('../models/user');

router.put('/signup', [
    body('email', 'Please enter a valid email')
        .isEmail()
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {

                    if (user) {
                        return Promise.reject('E-Mail exists already, please pick a different one.')
                    }
                });
        }),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('name', 'Please enter a valid name')
        .trim()
        .not()
        .isEmpty()
], authController.signup);

router.post('/login', authController.login);

module.exports = router;