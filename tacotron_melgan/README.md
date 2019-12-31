Tacotron + Melgan
=================
Runs Tacotron2 + Melgan as a fully end-to-end TTS system.

Compiling
---------
Libtorch has been problematic, so I have a good version here:

```
export LIBTORCH=/home/bt/dev/3rd/libtorch
export LD_LIBRARY_PATH=${LIBTORCH}/lib:$LD_LIBRARY_PATH
```

This was downloaded from 
https://download.pytorch.org/libtorch/cpu/libtorch-cxx11-abi-shared-with-deps-1.3.1%2Bcpu.zip

