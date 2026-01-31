-- Drop address column from user table now that profile no longer collects it
ALTER TABLE `user`
  DROP COLUMN `address`;
