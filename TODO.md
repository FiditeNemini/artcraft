Remaining Tasks
===============

Audio Samples
  - MORE SAMPLES
  - IMPROVED SAMPLES
  - Remove extra space between words (using parsing to insert spacing)
  - No more missing phonemes

Tokenizing
  - Plurals
  - Times (9 p.m. ET)

Parsing
  - (Everything in tokenizing)
  - Output a structured form of data with breath/pauses
    (periods, commas, etc...)
  - Decimal numbers
  - Monetary units ($10 -> ten dollars, $10 million -> ten million dollars)
  - Dates
  - Numbers that are years (2016)!
  - Twitter hashtags, usernames - conjoined word parsing (difficult)

Synthesis
  - Get rid of static with "Uhhh", "Ummm" of variable length (option).

Cleanup
  - Refactor into a very well-defined "SpeakRequest" with all
    parameters, including new ones like "is_twitter",
    "missing_word_mode = slience, record_pop, umm", etc.
  - Remove old query parameters
  - Set default volume

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

Extra
  - Clientside speed changing
  - Let people type nonsense syllables

Parsing Examples
----------------
- Camel case even outside of hashtags:
  - "Google acquires FameBit", StateOfW, AdaLovelaceDay
- Time: 7:30pm, 5:30ET, 9pm ET, 8:00 P.M., 8pm ET
- Hyphenated: 2-party

