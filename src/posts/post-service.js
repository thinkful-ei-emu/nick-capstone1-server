const xss = require('xss');

const PostService = {
  getAllPosts(db) {
    return db
      .from('bandbridge_posts AS post')
      .select(
        'post.id',
        'post.post_type',
        'post.location',
        'post.style',
        'post.commitment',
        'post.skill_lvl',
        'post.instruments_need',
        'post.description',
        'post.date_created',
        db.raw(
          `count(DISTINCT comm) AS number_of_comments`
          ),
        db.raw(
          `json_build_object(
              'id', usr.id,
              'user_name', usr.user_name,
              'date_created', usr.date_created
          ) AS "author"`
        ),
      )
      .leftJoin(
        'bandbridge_comments AS comm',
        'post.id',
        'comm.post_id',
      )
      .leftJoin(
        'bandbridge_users AS usr',
        'post.user_id',
        'usr.id',
      )
      .groupBy('post.id', 'usr.id')
  },
  serializePost(post) {
    const { author } = post;
    return {
      id: post.id,
      post_type: post.post_type,
      location: post.location,
      style: post.style,
      commitment: post.commitment,
      skill_lvl: post.skill_lvl,
      instruments_need: post.instruments_need,
      description: xss(post.description),
      date_created: new Date(post.date_created),
      number_of_comments: Number(post.number_of_comments) || 0,
      author: {
        id: author.id,
        user_name: author.user_name,
        date_created: new Date(author.date_created),
      }
    }
  },

}


module.exports = PostService;