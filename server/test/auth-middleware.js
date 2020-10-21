const expect = require('chai').expect;
const jsonwebtoken = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

// eslint-disable-next-line no-undef
describe('Auth middleware', () => {
    // eslint-disable-next-line no-undef
    it('should throw an error if no authorization header is present', () => {
        const req = {
            get: () => {
                return null;
            }
        };
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not authenticated.');
    });

    // eslint-disable-next-line no-undef
    it('should throw an error if the authorization header is only one string', () => {
        const req = {
            get: () => {
                return 'xyz';
            }
        };
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw();
    });

    // eslint-disable-next-line no-undef
    it('should yield a userId after decoding the token', () => {
        const req = {
            get: () => {
                return 'Bearer sfsdfsdfsdfs';
            }
        };
        //override function - only example
        // jsonwebtoken.verify = () => {       
        //     return {
        //         userId: 'abc'
        //     };
        // };
        sinon.stub(jsonwebtoken, 'verify');
        jsonwebtoken.verify.returns({userId: 'abc'});
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jsonwebtoken.verify.called).to.be.true;
        jsonwebtoken.verify.restore();
    });
});