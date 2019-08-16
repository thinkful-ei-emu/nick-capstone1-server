const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function cleanTables(db){
  return db.raw(
    `TRUNCATE
      bandbridge_posts,
      bandbridge_users,
      bandbridge_comments
      RESTART IDENTITY CASCADE`
  );
}

function makeUsersArray(){
  return [
    {
      id: 1,
      user_name: 'testuser1',
      password: 'password1$P',
      date_created: '2029-01-22T16:28:32.615Z',
      location: 'Atlanta (GA)',
      instrument: 'Drums',
      styles: 'Alt-Metal',
      commitment: 'Low(1-3)',
    },
    {
      id: 2,
      user_name: 'testuser2',
      password: 'password1$P',
      date_created: '2029-01-22T16:28:32.615Z',
      location: 'Atlanta (GA)',
      instrument: 'Guitar(6)',
      styles: 'Alt-Metal',
      commitment: 'Low(1-3)',
    },
    {
      id: 3,
      user_name: 'testuser3',
      password: 'password1$P',
      date_created: '2029-01-22T16:28:32.615Z',
      location: 'Atlanta (GA)',
      instrument: 'Piano',
      styles: 'Post-Hardcore',
      commitment: 'Mid-Low(3-6)',
    },
  ];
}

function makePostsArray(users){
  return [
    {
      id: 1,
      post_type: 'Band',
      location: 'Atlanta (GA)',
      style: 'Alt-Metal',
      commitment: 'Low(1-3)',
      skill_lvl: 'Begginer',
      instruments_need: 'Drums Guitar(6)',
      description: 'Lets start a band',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[0].id,
    },
    {
      id: 2,
      post_type: 'Side-Project',
      location: 'Atlanta (GA)',
      style: 'Post-Hardcore',
      commitment: 'Low(1-3)',
      skill_lvl: 'Intermediate',
      instruments_need: 'Bass(5)',
      description: 'Looking for a side project',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[1].id,
    },
    {
      id: 3,
      post_type: 'Shed',
      location: 'Atlanta (GA)',
      style: 'Hip-Hop',
      commitment: 'Mid-Low(3-6)',
      skill_lvl: 'Hobbyist',
      instruments_need: 'Drums Bass(4)',
      description: 'Lets jam',
      date_created: '2029-01-22T16:28:32.615Z',
      user_id: users[2].id,
    }
  ];
}

function makeCommentsArray(users, posts){
  return [
    {
      id: 1,
      text: 'so coool wow',
      date_created: '2029-01-22T16:28:32.615Z',
      post_id: posts[1].id,
      user_id: users[0].id,
    },
    {
      id: 2,
      text: 'test test',
      date_created: '2029-01-22T16:28:32.615Z',
      post_id: posts[0].id,
      user_id: users[1].id,
    },
    {
      id: 3,
      text: 'omg',
      date_created: '2029-01-22T16:28:32.615Z',
      post_id: posts[2].id,
      user_id: users[2].id,
    },
  ];
}

function makePostFixtures(){
  const testUsers = makeUsersArray()
  const testPosts = makePostsArray(testUsers)
  const testComments = makeCommentsArray(testUsers, testPosts)
  return { testUsers, testPosts, testComments}
}

function seedUsers(db, users){
  const preppedUsers = users.map(user => ({
   ...user,
   password: bcrypt.hashSync(user.password, 1) 
  }))
  return db.into('bandbridge_users').insert(preppedUsers)
    
}

function seedPostsTables(db, users, posts, comments=[]) {
  return db.transaction( async trx => {
      await seedUsers(db, users)
      await trx.into('bandbridge_posts').insert(posts)
      if(comments.length){
        await trx.into('bandbridge_comments').insert(comments)
      }
})
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET){
  const token = jwt.sign({ user_id: user.id}, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function makeExpectedPost(users, post, comments=[]){
  const user = users.find(user => user.id === post.user_id);
  const postComments = comments.filter(comment => comment.user_id === user.id)
  number_of_comments = postComments.length;
  return {
    id: post.id,
    post_type: post.post_type,
    location: post.location,
    style: post.style,
    commitment: post.commitment,
    skill_lvl: post.skill_lvl,
    instruments_need: post.instruments_need,
    description: post.description,
    date_created: post.date_created,
    number_of_comments,
    author: {
      id: user.id,
      user_name: user.user_name,
      date_created: user.date_created,
    }
  }
}

module.exports = {
  cleanTables,
  makeUsersArray,
  makePostsArray,
  makeCommentsArray,
  seedUsers,
  seedPostsTables,
  makeAuthHeader,
  makePostFixtures,
  makeExpectedPost,
};