#!/usr/bin/env python3

"""
Starts a demo HTTP server to capture and transform audio
as a live demonstration of the trained model.
Brandon Thomas 2019-07-29 <bt@brand.io> <echelon@gmail.com>
"""

import argparse
import falcon
import io
import librosa
import numpy as np
import os
import scipy
import soundfile
import tensorflow as tf
import subprocess
import tempfile
import json

from falcon_multipart.middleware import MultipartMiddleware
#from model import CycleGAN
#from preprocess import *
from wsgiref import simple_server

from vocodes_common import TacotronWaveglowPipeline
from vocodes_common import print_gpu_info
from vocodes_common import load_tacotron_model
from vocodes_common import load_waveglow_model

print("TensorFlow version: {}".format(tf.version.VERSION))

print_gpu_info()

INDEX_HTML = '''
<!doctype html>
<html>
  <body>
    <meta charset="utf-8" />
    <h1>TTS Inference</h1>
    <script src="./script/recorder.js" type="application/javascript"></script>
    <script type="application/javascript">
      var audio_context;
      var recorder;
      // NB: Capture code originates from 'recorder.js' demo.
      function startUserMedia(stream) {
        var input = audio_context.createMediaStreamSource(stream);
        window.recorder = new Recorder(input);
      }
      function createDownloadLink() {
        window.recorder && window.recorder.exportWAV(function(blob) {
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload=function(e) {
            console.log('response received');
            var objectUrl = window.URL.createObjectURL(this.response);
            console.log('audio URL', objectUrl);
            var audio = document.getElementById('audio');
            audio.src = objectUrl;
            audio.play();
          };
          var fd = new FormData();
          fd.append("audio_data", blob, "audio_file.wav");
          console.log(blob);
          console.log('sending...');
          xhr.open("POST","/upload",true);
          xhr.send(fd);
          console.log('sent');
        });
      }
      function startRecording(button) {
        window.recorder && window.recorder.record();
        document.getElementById('start').disabled = true;
        document.getElementById('stop').disabled = false;
      }
      function stopRecording(button) {
        window.recorder && window.recorder.stop();
        document.getElementById('start').disabled = false;
        document.getElementById('stop').disabled = true;
        createDownloadLink();
        window.recorder.clear();
      }
      function handleSubmit(ev) {
        let value = document.getElementById('text').value;
        ev.preventDefault();
        console.log(value);
        postInference(value);
        return false;
      }
      function postInference(text) {
        const request_payload = {
          'inference_text': text,
        };
        
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/infer");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(request_payload));
      }
      window.onload = function init() {
        document.getElementById('form').addEventListener('submit', (ev) => handleSubmit(ev));
      };
    </script>
    <button id="start" onclick="startRecording(this);">record</button>
    <br>
    <br>
    <button id="stop" onclick="stopRecording(this);" disabled>stop</button>
    <br>
    <br>
    <audio controls id="audio">
      <source id="source" src="" type="audio/wav">
      Your browser does not support the audio element.
    </audio>
    
    <hr />
    <form id="form">
      <input id="text" type="text" name="text" />
      <button>Submit TTS</button>
    </form>
  </body>
</html>
'''


#class Converter():
#    def __init__(self, model_dir, model_name):
#        self.num_features = 24
#        self.sampling_rate = 16000
#        self.frame_period = 5.0
#
#        self.model = CycleGAN(num_features = self.num_features, mode = 'test')
#
#        self.model.load(filepath = os.path.join(model_dir, model_name))
#
#        """
#        # NB: Save the graph
#        definition = self.model.sess.graph_def
#        directory = 'saved_model_2'
#        tf.train.write_graph(definition, directory, 'saved_model_2.pb', as_text=True)
#        # https://github.com/tensorflow/models/issues/3530#issuecomment-395968881
#        output_dir = './saved_model/'
#        builder = tf.saved_model.builder.SavedModelBuilder(output_dir)
#        builder.add_meta_graph_and_variables(
#            self.model.sess,
#            [tf.saved_model.tag_constants.SERVING],
#            main_op=tf.tables_initializer(),
#        )
#        builder.save()
#        """
#
#        """
#        builder.add_meta_graph_and_variables(
#            self.model.sess,
#            [tf.saved_model.tag_constants.SERVING],
#            signature_def_map={
#                'predict_images':
#                    prediction_signature,
#                signature_constants.DEFAULT_SERVING_SIGNATURE_DEF_KEY:
#                    classification_signature,
#            },
#            main_op=tf.tables_initializer())
#        """
#
#        self.mcep_normalization_params = np.load(os.path.join(model_dir, 'mcep_normalization.npz'))
#        self.mcep_mean_A = self.mcep_normalization_params['mean_A']
#        self.mcep_std_A = self.mcep_normalization_params['std_A']
#        self.mcep_mean_B = self.mcep_normalization_params['mean_B']
#        self.mcep_std_B = self.mcep_normalization_params['std_B']
#
#        self.logf0s_normalization_params = np.load(os.path.join(model_dir, 'logf0s_normalization.npz'))
#        self.logf0s_mean_A = self.logf0s_normalization_params['mean_A']
#        self.logf0s_std_A = self.logf0s_normalization_params['std_A']
#        self.logf0s_mean_B = self.logf0s_normalization_params['mean_B']
#        self.logf0s_std_B = self.logf0s_normalization_params['std_B']
#
#    def convert(self, wav, conversion_direction='A2B'):
#        wav = wav_padding(wav = wav, sr = self.sampling_rate, frame_period = self.frame_period, multiple = 4)
#        f0, timeaxis, sp, ap = world_decompose(wav = wav, fs = self.sampling_rate, frame_period = self.frame_period)
#        coded_sp = world_encode_spectral_envelop(sp = sp, fs = self.sampling_rate, dim = self.num_features)
#        coded_sp_transposed = coded_sp.T
#
#        if conversion_direction == 'A2B':
#            f0_converted = pitch_conversion(f0 = f0, mean_log_src = self.logf0s_mean_A, std_log_src = self.logf0s_std_A, mean_log_target = self.logf0s_mean_B, std_log_target = self.logf0s_std_B)
#            coded_sp_norm = (coded_sp_transposed - self.mcep_mean_A) / self.mcep_std_A
#            coded_sp_converted_norm = self.model.test(inputs = np.array([coded_sp_norm]), direction = conversion_direction)[0]
#            coded_sp_converted = coded_sp_converted_norm * self.mcep_std_B + self.mcep_mean_B
#        else:
#            f0_converted = pitch_conversion(f0 = f0, mean_log_src = self.logf0s_mean_B, std_log_src = self.logf0s_std_B, mean_log_target = self.logf0s_mean_A, std_log_target = self.logf0s_std_A)
#            coded_sp_norm = (coded_sp_transposed - self.mcep_mean_B) / self.mcep_std_B
#            coded_sp_converted_norm = self.model.test(inputs = np.array([coded_sp_norm]), direction = conversion_direction)[0]
#            coded_sp_converted = coded_sp_converted_norm * self.mcep_std_A + self.mcep_mean_A
#
#        coded_sp_converted = coded_sp_converted.T
#        coded_sp_converted = np.ascontiguousarray(coded_sp_converted)
#        decoded_sp_converted = world_decode_spectral_envelop(coded_sp = coded_sp_converted, fs = self.sampling_rate)
#        wav_transformed = world_speech_synthesis(f0 = f0_converted, decoded_sp = decoded_sp_converted, ap = ap, fs = self.sampling_rate, frame_period = self.frame_period)
#
#        # For debugging model output, uncomment the following line:
#        # librosa.output.write_wav('model_output.wav', wav_transformed, self.sampling_rate)
#
#        # TODO: Perhaps ditch this. It's probably unnecessary work.
#        upsampled = librosa.resample(wav_transformed, self.sampling_rate, 48000)
#        pcm_data = upsampled.astype(np.float64)
#        stereo_pcm_data = np.tile(pcm_data, (2,1)).T
#
#        buf = io.BytesIO()
#        scipy.io.wavfile.write(buf, 48000, stereo_pcm_data.astype(np.float32))
#        return buf

## Set up model
## This should live long in memory, so we do it up front.
#model_dir_default = './model/sf1_tm1'
#model_name_default = 'sf1_tm1.ckpt'
#converter = Converter(model_dir_default, model_name_default)

#tacotron = load_tacotron_model('/home/bt/models/tacotron2/tacotron2_uberduck_Noire.pt')
#waveglow = load_waveglow_model('/home/bt/models/waveglow/waveglow_256channels_universal_v5.pt')
pipeline = TacotronWaveglowPipeline()

class IndexHandler():
    def on_get(self, request, response):
        response.content_type = 'text/html'
        response.body = INDEX_HTML

class ApiHandler():
    def on_post(self, request, response):
        raw_data = json.load(request.bounded_stream)

        # Request parameters
        vocoder_checkpoint_path = raw_data.get('vocoder_checkpoint_path')
        synthesizer_checkpoint_path = raw_data.get('synthesizer_checkpoint_path')
        inference_text = raw_data.get('inference_text')
        output_audio_filename = raw_data.get('output_audio_filename')
        output_spectrogram_filename = raw_data.get('output_spectrogram_filename')
        output_metadata_filename = raw_data.get('output_metadata_filename')

        print('vocoder_checkpoint_path: {}'.format(vocoder_checkpoint_path))
        print('synthesizer_checkpoint_path: {}'.format(synthesizer_checkpoint_path))
        print('inference_text: {}'.format(inference_text))
        print('output_audio_filename: {}'.format(output_audio_filename))
        print('output_spectrogram_filename: {}'.format(output_spectrogram_filename))
        print('output_metadata_filename: {}'.format(output_metadata_filename))

        pipeline.maybe_load_waveglow_model(vocoder_checkpoint_path)
        pipeline.maybe_load_tacotron_model(synthesizer_checkpoint_path)

        inference_args = {
            'raw_text': inference_text,
            'output_audio_filename': output_audio_filename,
            'output_spectrogram_filename': output_spectrogram_filename,
            'output_metadata_filename': output_metadata_filename,
        }

        pipeline.infer(inference_args)

        #response.content_type = 'audio/ogg'
        #with open(out_file, mode='rb') as f:
        #    response.data = f.read()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    api = falcon.API(middleware=[MultipartMiddleware()])
    api.add_route('/', IndexHandler())
    api.add_route('/infer', ApiHandler())
    #api.add_static_route('/script', os.path.abspath('./script'))
    #api.add_static_route('/sound', os.path.abspath('./sound'))
    print('Serving on 0.0.0.0:%d' % args.port)
    simple_server.make_server('0.0.0.0', args.port, api).serve_forever()

if __name__ == '__main__':
    main()
