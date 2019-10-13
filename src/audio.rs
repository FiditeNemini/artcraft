
/*
f0, timeaxis, sp, ap = world_decompose(wav = wav, fs = self.sampling_rate, frame_period = self.frame_period)

Wav padding.shape: {} (30320,)
>> f0.shape: (380,)
>> timeaxis.shape: (380,)
>> sp.shape: (380, 513)
>> ap.shape: (380, 513)

def world_decompose(wav, fs, frame_period = 5.0):
  # Decompose speech signal into f0, spectral envelope and aperiodicity using WORLD
  wav = wav.astype(np.float64)
  f0, timeaxis = pyworld.harvest(wav, fs, frame_period = frame_period, f0_floor = 71.0, f0_ceil = 800.0)
  sp = pyworld.cheaptrick(wav, f0, timeaxis, fs)
  ap = pyworld.d4c(wav, f0, timeaxis, fs)
  return f0, timeaxis, sp, ap
*/