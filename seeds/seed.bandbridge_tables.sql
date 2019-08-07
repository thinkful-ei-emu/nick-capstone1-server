BEGIN;

TRUNCATE 
  bandbridge_comments,
  bandbridge_posts,
  bandbridge_users
  RESTART IDENTITY CASCADE;

INSERT INTO bandbridge_users (user_name, password, location, instrument, styles, commitment)
VALUES 
('Bonhamr00lz', 'bonpassword', 'Atlanta', 'Drums', 'Rock', 'I want to play shows'),
('JimiIzCool', 'jimpassword', 'Atlanta', 'Guitar (6)', 'Rock Funk', 'I want to play shows'),
('Chin0', 'chipassword', 'LA', 'Vocals', 'AltMetal', 'I want to gig'),
('HoraceS', 'horpassword', 'NYC', 'Piano', 'Jazz', 'I want to gig');

INSERT INTO bandbridge_posts (post_type, location, style, commitment, skill_lvl, instruments_need, description, user_id)
VALUES 
('Band', 'Atlanta', 'Rock', 'Mid-low(3-6)', 'Intermediate', 'Guitar Bass Vocals', 'I want to start a rock band', 1),
('Band', 'Atlanta', 'Funk', 'Mid-low(3-6)', 'Intermediate', 'Drums Bass Vocals', 'Lets jam', 2),
('Shed', 'NYC', 'Jazz', 'Mid-low(3-6)', 'Advanced', 'Drums Bass', 'Just looking to improv with some skilled musicians', 4);

INSERT INTO bandbridge_comments (text, post_id, user_id)
VALUES 
('Im down to meet up', 2, 1),
('Cool lets do it', 2, 2);

COMMIT;