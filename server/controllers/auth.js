const { validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

exports.signup = (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error
    }
    bcryptjs.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email, name, password: hashedPassword
            })
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: `User ${name} has been added.`, userId: result._id.toString() })
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcryptjs.compare(password, user.password);
        })
        .then(isEqual => {

            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            const token = jsonwebtoken.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, process.env.PRIVATE_KEY, { expiresIn: '1h' })
            res.status(200).json({ token, userId: loadedUser._id.toString() });
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}