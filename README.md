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
      - 10 monophthongs (AO, AA, IY, UW, EH, IH, UH, AH, AX, AE)
      - 5 diphthongs (EY, AY, OW, AW, OY)
      - 8 R-colored vowels (ER, AXR, EH R, UH R, AO R, AA R, IH|IY R, AW R)
    - Consonants:
      - 6 Stops (P, B, T, D, K, G)
      - 2 Affricates (CH, JH)
      - 9 Fricatives (F, V, TH, DH, S, Z, SH, ZH, HH)
      - 6 Nasals (M, EM, N, EN, NG, ENG)
      - 5 Liquids (L, EL, R, DX, MX)
      - 3 Semivowels (Y, W, Q)

Diphones
--------
Generate a list of phoneme 2-tuples.

Unit Selection
--------------
- Combine multiple sources into final output (words, phonemes, diphones)
- Have alternatives (words, phonemes) that pair better with others.
- Optimize joining on a score (start/ending pitch, tempo, etc.)

