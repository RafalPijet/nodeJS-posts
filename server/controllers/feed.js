exports.getPosts = (req, res) => {
    res.status(200).json({posts: [{title: 'First post', content: 'This is the first post'}]})
}

exports.postPost = (req, res) => {
    const {title, content} = req.body;
    res.status(201).json({
        message: 'Post created successfully',
        post: {id: new Date().toISOString(), title, content}
    })
}