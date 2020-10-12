const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');

const clearImage = filePath => {
    filePath = path.join(__dirname, '../', filePath);
    fs.unlink(filePath, err => {

        if (err) console.log(err)
    });
}

exports.getPosts = (req, res, next) => {
    const { page } = req.query || 1;
    const perPage = 2;
    let totalItems;
    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((page - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.status(200).json({
                message: 'Fetched posts successfully.',
                posts,
                totalItems
            })
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.postPost = (req, res, next) => {
    const { title, content } = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        const error = new Error(`Validation failed: ${errors.array()[0].msg}`);
        error.statusCode = 422;
        throw error;
    }

    if (!image) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const post = new Post({
        title,
        content,
        creator: req.userId,
        imageUrl: image.path
    });
    post.save()
        .then(() => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts = [...user.posts, post]
            return user.save();
        })
        .then(user => {
            res.status(201).json({
                message: 'Post created successfully',
                post: post,
                creator: {_id: user._id, name: user.name}
            })
        })   
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getPostById = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
        .then(post => {

            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Post has been found',
                post
            })
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    imageUrl = req.body.image;
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        const error = new Error(`Validation failed: ${errors.array()[0].msg}`);
        error.statusCode = 422;
        throw error;
    }

    if (image) {
        imageUrl = image.path
    }

    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
        .then(post => {

            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }

            if (post.imageUrl !== imageUrl) {
                clearImage(post.imageUrl);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(post => {
            res.status(201).json({ message: 'Post has been updated', post })
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
        .then(post => {

            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId)
        })
        .then(() => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(() => {
            res.status(201).json({ message: 'Post has been removed' })
        })
        .catch(err => {

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}