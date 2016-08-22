Trumpet
=======
1. for the lulz
2. ???
3. lol

Running the server
------------------
1. Install Rust >= 1.1.0
2. `cargo run`

Phoneme
-------
- [CMU Dictionary](http://svn.code.sf.net/p/cmusphinx/code/trunk/cmudict/), 
  which uses [Arpabet](https://en.wikipedia.org/wiki/Arpabet).
  - 54 units in the Arpabet:
    - Vowels:
      - 10 monophthongs
      - 5 diphthongs
      - 8 R-colored vowels
    - Consonants:
      - 6 Stops
      - 2 Affricates
      - 9 Fricatives
      - 6 Nasals
      - 5 Liquids
      - 3 Semivowels

Diphones
--------
Generate a list of phoneme 2-tuples.

Unit Selection
--------------
- Combine multiple sources into final output (words, phonemes, diphones)
- Have alternatives (words, phonemes) that pair better with others.
- Optimize joining on a score (start/ending pitch, tempo, etc.)

