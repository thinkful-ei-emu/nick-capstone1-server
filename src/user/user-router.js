const express = require('express');
const UserService = require('./user-service');
const path = require('path');


const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const {user_name, password, location, instrument, styles, commitment} = req.body;

    for (const field of ['user_name', 'password', 'location', 'instrument', 'styles', 'commitment'])
      if(!req.body[field])
        return res.status(400).json({error: `Missing ${field} in request body`});

    const passwordError = UserService.validatePassword(password);

    if(passwordError)
      return res.status(400).json({error: passwordError});

    UserService.hasUserWithUserName(req.app.get('db'), user_name)
      .then(match => {
        if(match)
          return res.status(400).json({error: 'Username already taken'});

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              location,
              instrument,
              styles,
              commitment,
              date_created: 'now()',
            };
            return UserService.insertUser(req.app.get('db'), newUser)
              .then(user => {
                res.status(201)
                  .location(path.posix.join(req.originalUrl,`/${user.id}`))
                  .json(UserService.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

module.exports = userRouter;
