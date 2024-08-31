-- Doc: https://docs.google.com/document/d/14AyEV_0PYwa71a5W8xRRZ8vbI0uZHQF4ycqi539qmAc/edit
-- bluemo69: SpongeBob (abandoned)
-- dzth: likely AI streamer - 144,653 media files (all audio, mostly SpongeBob, using old tokens) in August 2024
-- johnloberger: AI South Park
-- rewritten_code: AI Breaking Bad
UPDATE users
SET is_api_user = TRUE
WHERE username IN (
  'bluemo69',
  'dzth',
  'johnloberger',
  'rewritten_code'
);

-- TODO:
-- leon_says: ???? - 209,745 media files in August 2024
-- robertmctague: ???? - 285,664 media files in August 2024
