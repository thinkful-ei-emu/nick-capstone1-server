

ALTER TABLE bandbridge_users 
  ADD COLUMN location TEXT NOT NULL,
  ADD COLUMN instrument TEXT NOT NULL,
  ADD COLUMN styles TEXT NOT NULL, 
  ADD COLUMN commitment TEXT NOT NULL;