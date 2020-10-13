const express = require('express');
const { body } = require('express-validator/check')

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/status', isAuth, feedController.getUserStatus);
router.get('/posts', isAuth, feedController.getPosts);
router.get('/post/:postId', isAuth, feedController.getPostById);
router.put('/status', isAuth,
    body('status', 'Invalid entry')
        .notEmpty(),
    feedController.updateUserStatus);
router.post('/post', isAuth, [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    body('content', 'Wrong content')
        .isString()
        .isLength({ min: 5, max: 100 })
], feedController.postPost);
router.put('/post/:postId', isAuth, [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    body('content', 'Wrong content')
        .isString()
        .isLength({ min: 5, max: 100 })
], feedController.updatePost);
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;