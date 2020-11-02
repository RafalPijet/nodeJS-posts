const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const feedController = require('../controllers/feed');

// eslint-disable-next-line no-undef
describe('Feed Controller - User Status', () => {
    // eslint-disable-next-line no-undef
    it('should send a response with a valid user status for an existing user', (done) => {
        mongoose.connect(process.env.MONGO_DB_ACCESS_TESTS)
        .then(result => {
            const user = new User({
                email: 'test@test.com',
                password: 'tester',
                name: 'Test',
                posts: [],
                _id: '5f7561830b5033b5ad75043d'
            });
            return user.save();
        })
        .then(() => {
            const req = {userId: '5f7561830b5033b5ad75043d'};
            const res = {
                statusCode: 500,
                userStatus: null,
                status: (code) => {
                    this.statusCode = code;
                    return this;
                },
                json: (data) => {
                    this.userStatus = data.status;
                }
            };
            feedController.getUserStatus(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('I am new!');
                mongoose.disconnect().then(() => {
                    done();
                });
            });

        })
        .catch(err => console.log(err));
    });
});