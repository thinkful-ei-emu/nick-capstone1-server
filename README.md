Title: BandBridge server

Endpoint Documentation:

GET '/posts' unprotected endpoint. Returns an array of post objects that can be filtered using query params location and instrument.

POST '/posts' protected endpoint. Requires jwt to post new items. Requires post_type, location, style, commitment, skill_lvl, instruments_need, description.

GET '/posts/:postId' protected endpoint. Requires jwt to see individual post page and read comments on the post.

POST '/posts/:postId/comments' protected endpoint. Requires jwt to post comments.

POST '/users' unprotected endpoint. Requires user_name, password, location, instrument, styles and commmitment. Creates an account that you may log into to see protected endpoints from client.

POST '/auth/login' unprotected endpoint. Requires user_name and password. Successful post will store a jwt in local storage and enable you to see protected endpoints.

------------------------------------------------------------------------------------

Technology used:
node
express
postgres
knex
morgan
helmet
cors
bcrypt
jsonwebtoken

