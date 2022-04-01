-- Must retain "not null", otherwise migration drops it!
ALTER TABLE sentences MODIFY COLUMN speaker VARCHAR(32) NOT NULL;
