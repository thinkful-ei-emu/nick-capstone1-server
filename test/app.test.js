const app = require('../src/app');
const knex = require('knex');
const helpers = require('./helpers');


describe('bandbridge endpoints', () => {
  let db;

  const {testUsers, testPosts, testComments} = helpers.makePostFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));


  describe('/posts', () => {

    context('Has posts', () => {
      beforeEach('insert Posts', () => 
        helpers.seedPostsTables(db, testUsers, testPosts)
      );
      it('Should respond 200 with an array of posts', () => {
        return supertest(app)
          .get('/api/posts')
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.have.property('date_created');
            expect(res.body[0]).to.have.property('post_type');
            expect(res.body[0]).to.have.property('location');
            expect(res.body[0]).to.have.property('commitment');
            expect(res.body[0]).to.have.property('skill_lvl');
            expect(res.body[0]).to.have.property('instruments_need');
            expect(res.body[0]).to.have.property('description');
            expect(res.body[0]).to.have.property('author');
          });
      });
      it('should respond 201 when succesful comment post', () => {
        const newComment = {
          post_id: 1,
          text: 'HIII',
        };
        return supertest(app)
          .post('/api/posts/1/comments')
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(201);
      });
    });
    context('has no posts', () => {
      it('should return an empty array', () => {
        return supertest(app)
          .get('/api/posts')
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.eql([]);
          });
      });
    });

    context('has users', () => {
      beforeEach('insert Posts', () => 
        helpers.seedUsers(db, testUsers)
      );
      it('should respond 201 when successful post', () => {
        const newPost = {
          post_type: 'Band',
          location: 'Atlanta (GA)',
          style: 'Rock',
          commitment: 'Low(1-3)',
          skill_lvl: 'Begginer',
          instruments_need: 'Drums',
          description: 'test',
        };
        return supertest(app)
          .post('/api/posts')
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newPost)
          .expect(201);
      });
      const required = ['post_type', 'location', 'style', 'commitment', 'skill_lvl', 'instruments_need'];
      required.forEach(key => {
        const newPost = {
          post_type: 'Band',
          location: 'Atlanta (GA)',
          style: 'Rock',
          commitment: 'Low(1-3)',
          skill_lvl: 'Begginer',
          instruments_need: 'Drums',
        };
        it(`should respond 400 missing ${key} in request body`, () => {
          delete newPost[key];
          return supertest(app)
            .post('/api/posts')
            .set('authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newPost)
            .expect(400, {error: `Missing ${key} in request body`});
        });
      });
    });
    
  });

  describe('/posts/:postid', () => {
    beforeEach('insert Posts', () => 
      helpers.seedPostsTables(db, testUsers, testPosts, testComments)
    );
    it('should respond 400 unauthorized request when no bearer token', () => {
      return supertest(app)
        .get('/api/posts/1')
        .expect(401, {error: 'Unauthorized Request'});
    });
    it('should respond 200 and post when given bearer token', () => {
      return supertest(app)
        .get('/api/posts/1')
        .set('authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200);
    });
  });

  describe('/users', () => {
    it('should respond 201 when succesful registration', () => {
      const newUser = {
        user_name: 'testuser323',
        password: '123lolG$$km',
        location: 'Atlanta (GA)',
        instrument: 'Drums',
        styles: 'Math-Rock',
        commitment: 'Low(1-3)',
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
    });

    const requiredVals = ['user_name', 'password', 'location', 'instrument', 'styles', 'commitment'];
    requiredVals.forEach(val => {
      const newUser = {
        user_name: 'testuser323',
        password: '123lolG$$km',
        location: 'Atlanta (GA)',
        instrument: 'Drums',
        styles: 'Math-Rock',
        commitment: 'Low(1-3)',
      };
      it(`Should respond 400 Missing ${val} in request body missing required field`, () => {
        delete newUser[val];
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(400, {error: `Missing ${val} in request body`});
      });
    });
  });

  describe('/auth/login', () => {
    beforeEach('insert Posts', () => 
      helpers.seedUsers(db, testUsers)
    );
    it('Should respond 200 upon succesful login', () => {
      return supertest(app)
        .post('/api/auth/login')
        .send({
          user_name: testUsers[0].user_name,
          password: testUsers[0].password})
        .expect(200); 
    });
    it('Should respond 400 if invalid user_name', () => {
      return supertest(app)
        .post('/api/auth/login')
        .send({
          user_name: 'invalid',
          password: testUsers[0].password})
        .expect(400); 
    });
    it('Should respond 400 if invalid password', () => {
      return supertest(app)
        .post('/api/auth/login')
        .send({
          user_name: testUsers[0].user_name,
          password: 'invalid'})
        .expect(400); 
    });
  });
});