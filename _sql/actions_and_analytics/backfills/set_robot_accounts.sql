-- Doc: https://docs.google.com/document/d/14AyEV_0PYwa71a5W8xRRZ8vbI0uZHQF4ycqi539qmAc/edit
-- backspace23: Twitch robot user? "Hello streamer! You look amazing today! Keep on being pog!." + usernames
-- blastbeng: Italian AI streamer? Only uses 23 voices, all Italian
-- bluemo69: (confirmed, abandoned) AI SpongeBob
-- dzth: AI streamer - 144,653 media files (all audio, mostly SpongeBob, using old tokens) in August 2024
-- idkman01: *likely* AI streamer for Sonic - 77,741 media files in August 2024, Sonic voices, some SpongeBob
-- johnloberger: (confirmed) AI South Park
-- rewritten_code: (confirmed) AI Breaking Bad
-- robertmctague: Definitely robot, but strange. Bimodal character set, auto-censor, bitcoin
-- thevisitorx: Only uses 32 voices. Very weird set of voices.
UPDATE users
SET is_api_user = TRUE
WHERE username IN (
  'backspace23',
  'blastbeng',
  'bluemo69',
  'dzth',
  'idkman01',
  'johnloberger',
  'leon_says',
  'rewritten_code',
  'robertmctague',
  'thevisitorx'
);

-- Ripping off our API (???):
-- We won't filter these from organic analysis because their usage is likely organic even if they're hijacking us
-- devproject2023 - lots of different voices used, in different languages
-- leon_says: lots of different voices used, in different languages
-- thebigo - not API hacker, but not paying us, using us at volume, making bad content??
-- yigithan - lots of different voices used, in different languages

-- Top August users:

+--------------------+-----------------+-------------+---------------------+
| user_token         | username        | usage_count | created_at          |
+--------------------+-----------------+-------------+---------------------+
| user_aw7m4d07fjzrv | robertmctague   |      286029 | 2024-03-18 21:51:42 | -- Strange. Bimodal character set, auto-censor, bitcoin
| U:03HG1NRMDT7A6    | leon_says       |      209682 | 2023-09-13 16:27:40 | -- Ripping off our API (???)
| U:Z477H1KNSY3B5    | dzth            |      145174 | 2023-07-31 15:53:50 |  AI SpongeBob
| user_vb7mch05njgnp | idkman01        |       77741 | 2024-06-29 03:33:34 |  AI Sonic + a little AI SpongeBob
| U:8D706H5C7E5MF    | yigithan        |       41965 | 2023-05-03 07:35:43 | -- Ripping off our API (???)
| U:4Z8DK9T7K4170    | devproject2023  |       29530 | 2023-03-05 21:19:27 | -- Ripping off our API (???)
| U:5Z4ZMBVZT8FYP    | blastbeng       |       21126 | 2022-10-25 21:33:29 | -- Italian AI streamer? Only uses 23 voices, all Italian
| U:YX31ZJ517T40G    | johnloberger    |       18340 | 2023-06-14 21:34:52 | AI South Park
| U:6JJJRNN0B17CP    | backspace23     |       16229 | 2023-10-15 07:57:08 | -- Twitch tool? "Hello streamer! You look amazing today! Keep on being pog!." + usernames
| U:89XRNEWENPCGX    | thevisitorx     |       15138 | 2022-12-16 09:44:37 | -- Only uses 32 voices. Very weird set of voices.
| U:QPEXYBZJ5TB9K    | thebigo         |       14141 | 2022-09-06 01:38:52 | -- 92 voices, almost exclusively female voices!

