const express = require('express');
const PostService = require('./post-service');


const postRouter = express.Router();

postRouter
  .route('/')
  .get((req, res, next) => {
    PostService.getAllPosts(req.app.get('db'))
      .then(posts => {
        res.json(posts.map(PostService.serializePost));
      })
      .catch(next);
  });




module.exports = postRouter;