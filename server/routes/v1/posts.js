// modules
const express = require('express');
const router = express.Router();

// controller
const post = require('../../controllers/post');

// middleware
const token = require('../../middlewares/token');

router.post('/post/create', token.validate, post.create)
router.get('/post/:slug', post.getPostById)
router.patch('/post/update/:postId', token.validate, post.updatePostById)
router.delete('/post/delete', token.validate, post.deleteById)

module.exports = router
