Remaining Tasks
===============

Tokenizing
  - Plurals
  - Ordinals (1st, 25th, ...)
  - Times (9 p.m. ET)
  - Hyphenated words
  - Monetary units - just parse the leading `$`, etc.
    and let the numbers be parsed as numbers!

Parsing
  - (Everything in tokenizing)
  - Dates
  - Twitter hashtags, usernames
    - CamelCase parsing
    - conjoinedword parsing

Scaling
  1. Load test
  2. Read wave files into memory
  3. Multi-server, with nginx as load balancer
  4. Prevent others from calling it
  5. Caching strategy

Presentation
  - Better frontend UI
  - Testing page (current frontend)
  - Art + sprite

Monetization
  - Can I get sued?
  - Ads
  - Native Apps
    - (I don't have time to learn this.)
    - Contact other developers?
    - PhoneGap? (Blah)

Parsing Examples
----------------
- Camel case even outside of hashtags: "Google acquires FameBit"
- Time: 5:30ET
