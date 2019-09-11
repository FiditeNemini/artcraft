Voder
=====

Voice things.

Crates to try:

- [hound](https://crates.io/crates/hound)
  - Encoder/decoder
  - Very mature (3.4.0)

- [cpal](https://crates.io/crates/cpal)
  - Hardware audio out, low level
  - Tons of downloads!

- [wavy](https://crates.io/crates/wavy)
  - Microphone in, speaker out
  - ALSA

- [sample](https://crates.io/crates/sample)
  - convert between floats, u8s, u16s, etc. via a trait
  - clip amplitude
  - scale playback
  - iterators
  - signal generators (sine, saw, noise, etc.)

- [sonogram](https://crates.io/crates/sonogram)
  - generate spectrograms! 
  - THEY LOOK SICK!

- [audrey](https://crates.io/crates/audrey)
  - supports range of audio encoders/decoders
  - flac, ogg, wav, alac

- [waveform](https://crates.io/crates/waveform)
  - generate images from wave files
  - con "it is probably threadsafe"

- [samplerate](https://crates.io/crates/samplerate)
  - sample rate conversion

- [riff-wave](https://crates.io/crates/riff-wave)
  - read and write wav files
  - con: old (2016)

- [wavefile](https://crates.io/crates/wavefile)
  - con: old (2016)
  - con: low on doc

- [pitch](https://crates.io/crates/pitch)
  - determine pitch and volume of samples
  - uses "bistream autocorrelation function (bcf)"
  - todo: also investigate BACF, uses peaks instead of zero-crossings

- [libwave](https://crates.io/crates/libwave)
  - wav library, based on nom zero-copy parser
  - PCM support
  - 18/16/32/64 bit support


Hardware
--------

Enumerate hardware:

* `pactl list short sinks`

The linux headphone jack is named at startup:

* `speaker-test -t wav -c 6 -D front`

To change the 'default' speaker,

```
pactl list short sinks
pactl set-default-sink 'alsa_output.pci-0000_00_1f.3.analog-stereo'
speaker-test -t wav -c 6 -D default
```

This makes the rust code work on Desktop.

Links
-----

* http://www.rossbencina.com/code/real-time-audio-programming-101-time-waits-for-nothing
