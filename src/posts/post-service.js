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
  getFilteredPosts(db, ...args){
   let query = db
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
    if(args[0]){
      query.where('post.location', args[0])
    }
    if(args[1]){
      query.where('post.instruments_need', 'like', `%${args[1]}%`)
    }
    query.leftJoin(
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

    return query;

  },
  getPostsByLocation(db, location){
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
    .where('post.location', location)
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
  getPostsByInstrument(db, instrument){
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
    .where('post.instruments_need', 'like', `%${instrument}%`)
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
  serializePostComment(comment){
    const { user } = comment;
    return {
      id: comment.id,
      post_id: comment.post_id,
      text: xss(comment.text),
      date_created: new Date(comment.date_created),
      user: {
        id: user.id,
        user_name: user.user_name,
        instrument: user.instrument,
        location: user.location,
        date_created: new Date(user.date_created),
        styles: user.styles,
        commitment: user.commitment
      }
    }
  },
  getPostById(db, id){
    return PostService.getAllPosts(db)
      .where('post.id', id)
      .first()
      
  },
  getCommentsForPost(db, postId){
    return db
    .from('bandbridge_comments AS comm')
    .select('comm.id',
            'comm.date_created',
            'comm.text',
            db.raw(
              `json_strip_nulls(
                row_to_json(
                  (SELECT tmp FROM (
                    SELECT
                      usr.id,
                      usr.user_name,
                      usr.instrument,
                      usr.location,
                      usr.date_created,
                      usr.styles,
                      usr.commitment
                  ) tmp)
                )
              ) AS "user"`
            )
          )
          .where('comm.post_id', postId)
          .leftJoin('bandbridge_users AS usr',
                    'comm.user_id',
                    'usr.id',
            )
            .groupBy('comm.id', 'usr.id')
  },
  insertPost(db, post){
    return db
      .insert(post)
      .into('bandbridge_posts')
      .returning('*')
      .then(([post]) => post)
      .then(post => 
        PostService.getPostById(db, post.id)
        )
  },
  insertComment(db, comment){
    return db
      .insert(comment)
      .into('bandbridge_comments')
      .returning('*')
      .then(([comment]) => comment)
      .then(comment => PostService.getCommentById(db, comment.id))


  },
  getCommentById(db, commentId){
    return db
    .from('bandbridge_comments AS comm')
    .select('comm.id',
            'comm.date_created',
            'comm.text',
            'comm.post_id',
            db.raw(
              `json_strip_nulls(
                row_to_json(
                  (SELECT tmp FROM (
                    SELECT
                      usr.id,
                      usr.user_name,
                      usr.instrument,
                      usr.location,
                      usr.date_created,
                      usr.styles,
                      usr.commitment
                  ) tmp)
                )
              ) AS "user"`
            )
          )
          .leftJoin('bandbridge_users AS usr',
                    'comm.user_id',
                    'usr.id',
         )
          .where('comm.id', commentId)
          .first()
  },

}


module.exports = PostService;