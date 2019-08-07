ALTER TABLE bandbridge_users 
  DROP COLUMN IF EXISTS commitment,
  DROP COLUMN IF EXISTS styles,
  DROP COLUMN IF EXISTS instrument,
  DROP COLUMN IF EXISTS location;
