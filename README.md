Voder
=====

Voice things.

Current State
-------------

* Chunked/batched synthesis from the CycleGAN network is proven to work! 
* Desktop PC PulseAudio is borked. Need to get the `feedback.rs` demo working.
* Next steps:
  * Fix desktop audio so that mic and speaker work
  * Integrate Neural Network (or lightweight transform) into `feedback.rs/cpal` code.

TensorFlow
----------

### Tensorflow bindings (do they know things?)
I had to do a thing in the Cargo.toml,
```
[patch.crates-io]
# NB: Manually upgraded 'tensorflow-sys' library from 1.13.1 to 1.14.0
# The downloaded tensorflow libs in target/ must be moved to /lib 
# (I couldn't figure out the Rust linker flags)
tensorflow = { path = "/home/bt/dev/3rd/tensorflow.rs" }
```

The `libtensorflow.so.1` might go missing if dependencies change. I've been copying it 
around like a lazy person that doesn't understand the build process. Gross.

```
+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ ls -lA
-r-xr-xr-x 1 bt bt  34748520 Sep 30 01:55 libtensorflow_framework.so
-r-xr-xr-x 1 bt bt 216546752 Sep 30 01:55 libtensorflow.so

+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ cp ~/dev/voder/target/debug/build/tensorflow-sys-b3beaea4e172b1c8/out/libtensorflow.so.1 . 
+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ cp ~/dev/voder/target/debug/build/tensorflow-sys-b3beaea4e172b1c8/out/libtensorflow.so.1.14.0 . 
+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ cp ~/dev/voder/target/debug/build/tensorflow-sys-b3beaea4e172b1c8/out/libtensorflow_framework.so.1 . 
+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ cp ~/dev/voder/target/debug/build/tensorflow-sys-b3beaea4e172b1c8/out/libtensorflow_framework.so.1.14.0 . 
+ bt@halide:~/dev/voder/target/debug/build/tensorflow-sys-0fdab7e44f6d3e04/out$ ls -lA

-r-xr-xr-x 1 bt bt  34748520 Sep 30 01:55 libtensorflow_framework.so
-r-xr-xr-x 1 bt bt  34748520 Oct 11 00:31 libtensorflow_framework.so.1
-r-xr-xr-x 1 bt bt  34748520 Oct 11 00:31 libtensorflow_framework.so.1.14.0
-r-xr-xr-x 1 bt bt 216546752 Sep 30 01:55 libtensorflow.so
-r-xr-xr-x 1 bt bt 216546752 Oct 11 00:30 libtensorflow.so.1
-r-xr-xr-x 1 bt bt 216546752 Oct 11 00:31 libtensorflow.so.1.14.0

(And now it works. Ugh)
```

### Model 
Saved model (.pb file) must be in `saved_model/saved_model.pb` or similar. 

Need TensorFlow model tools:

`bazel build tensorflow/python/tools:saved_model_cli`

```
# NB: Save the graph
definition = self.model.sess.graph_def
directory = 'output_model_pb'
tf.train.write_graph(definition, directory, 'model.pb', as_text=False)

# https://github.com/tensorflow/models/issues/3530#issuecomment-395968881
output_dir = './saved_model/'
builder = tf.saved_model.builder.SavedModelBuilder(output_dir)
builder.add_meta_graph_and_variables(self.model.sess, [
	tf.saved_model.tag_constants.SERVING],)
builder.save()
```

Protos
------
Codegen for Rust is built in. Codegen for Python uses,

```
protoc --python_out=cycle_gan protos/audio.proto
```

Results
-------
Currently there is 4.39 seconds of delay between speaking and generated output
with the sidecar setup on my desktop computer. This is really great and seems
promising.

This gets up to 6.0 seconds later. Drift continues to accrue, but it's a slow 
build.

Resources
---------

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

Troubleshooting
---------------

THIS WORKS TO DEFEAT CHIPMUNK NOISES!

* https://bbs.archlinux.org/viewtopic.php?id=179923
  * https://wiki.archlinux.org/index.php/PulseAudio/Troubleshooting#Setting_the_default_fragment_number_and_buffer_size_in_PulseAudio

```
device.serial = "Focusrite_Scarlett_2i4_USB"
device.string = "surround40:1"
device.buffering.buffer_size = "1048576"
device.buffering.fragment_size = "524288"
```
PulseAudio's default sampling rate and bit depth are set to 44100Hz @ 16 bits. 

> 1048576 / 1411200 (buffer size)
0.7430385487528345  = 743 ms
> 524288 / 1411200 (fragment size)
0.37151927437641724 = 372 ms


