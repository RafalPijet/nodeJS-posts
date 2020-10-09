const express = require('express');
const { body } = require('express-validator/check')

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);
router.get('/post/:postId', feedController.getPostById);
router.post('/post', [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    body('content', 'Wrong content')
        .isString()
        .isLength({ min: 5, max: 100 })
], feedController.postPost);
router.put('/post/:postId', [
    body('title', 'Wrong title')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    body('content', 'Wrong content')
        .isString()
        .isLength({ min: 5, max: 100 })
], feedController.updatePost);
router.delete('/post/:postId', feedController.deletePost);

module.exports = router;