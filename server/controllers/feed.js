const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');

const clearImage = filePath => {
    filePath = path.join(__dirname, '../', filePath);
    fs.unlink(filePath, err => {

        if (err) console.log(err)
    });
}

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        res.status(200).json({message: 'Fetched posts successfully.', posts})
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
        creator: { name: 'Big Lopez' },
        imageUrl: image.path
    });
    post.save()
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully',
                post: result
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

        if (post.imageUrl !== imageUrl) {
            clearImage(post.imageUrl);
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(post => {
        res.status(201).json({message: 'Post has been updated', post})})
    .catch(err => {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next) => {
    const {postId} = req.params;
    Post.findOneAndDelete({_id: postId})
    .then(post => {

        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        clearImage(post.imageUrl);
        res.status(201).json({message: 'Post has been removed'})
    })
    .catch(err => {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}