const express = require('express');
const PostService = require('./post-service');
const xss = require('xss');

const jsonBodyParser = express.json();
const postRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');


postRouter
.get('/', (req, res, next) => {
  const {location, instrument} = req.query;
  PostService.getFilteredPosts(req.app.get('db'), location, instrument)
    .then(posts => {
      res.json(posts.map(PostService.serializePost))
    })
    .catch(next);
})
  

postRouter
  .post('/', requireAuth, jsonBodyParser, (req, res, next) => {
    const {post_type, location, style, commitment, skill_lvl, instruments_need, description} = req.body; 
    const newPost = {
      post_type,
      location,
      style,
      commitment,
      skill_lvl,
      instruments_need,
      description: xss(description),
    };
    for (const [key, value] of Object.entries(newPost))
      if(value == null)
        return res.status(400).json({error: `Missing ${key} in request body`});

    newPost.user_id = req.user.id;

    PostService.insertPost(req.app.get('db'), newPost)
      .then(post => {
        res.status(201)
          .json(PostService.serializePost(post));
      })
      .catch(next);
  });

  postRouter.route('/:postId')
    .all(requireAuth)
    .all(checkPostExists)
    .get((req, res) => {
      res.json(PostService.serializePost(res.post))
    })

  postRouter.route('/:postId/comments')
    .all(requireAuth)
    .all(checkPostExists)
    .get((req, res, next) => {
      PostService.getCommentsForPost(
        req.app.get('db'),
        req.params.postId
      )
      .then(comments => res.json(comments.map(PostService.serializePostComment)))
      .catch(next)
    })

  postRouter.route('/:postId/comments')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const {post_id, text} = req.body;
        const newComment = {
          post_id,
          text,
        }

        if (text === ''){
          return res.status(400).json({error: 'Missing text in request body'})
        }

        for (const [key, value] of Object.entries(newComment))
          if(value == null || '')
            res.status(400).json({error: `Missing ${key} in request body`})

        newComment.user_id = req.user.id

      PostService.insertComment(
        req.app.get('db'),
        newComment
      )
      .then(comment => res.status(201).location(req.originalUrl).json(PostService.serializePostComment(comment)))
      .catch(next);
    })
    


  async function checkPostExists(req, res, next) {
    try {
      const post = await PostService.getPostById(
        req.app.get('db'),
        req.params.postId
      )
      if (!post) return res.status(400).json({error: 'Post does not exist'})

      res.post = post
      next()
    }

    catch(error){
      next(error)
    }
  }



module.exports = postRouter;