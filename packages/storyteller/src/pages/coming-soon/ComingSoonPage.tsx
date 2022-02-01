import React from 'react';

function ComingSoonPage() {
  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Coming Soon
          </h1>
          <div className="content">

            <p>We'll be launching the following features within the next few months:</p>

            <ul>
              <li>Audience rewards
                <ul>
                  <li>Stream TTS</li>
                  <li>Deepfake Emotes (TTS + Green Screen W2L)</li>
                </ul>
              </li>
              <li>Voice and video 
                <ul>
                  <li>Real time voice conversion (change your voice to someone else's)</li>
                  <li>VoxelCam 3D volumetric camera (a webcam, but 3D, and directly injectable 
                    into games)</li>
                </ul>
              </li>
              <li>Storyteller Engine
                <ul>
                  <li>This is a high quality cinematic game engine.
                    You don't need to own an expensive computer. It can run in the cloud.</li>
                  <li>Real time 3D motion capture of one or more streamers / actors. 
                    Think VTubing, but Star Wars quality.</li>
                  <li>Dedicated control plane for camera, lighting, environmental control OPs.</li>
                  <li>Embed rich content: games, browser panes, video feeds</li>
                  <li>Let your audience control your world</li>
                </ul>
              </li>
            </ul>

            <p>You'll be able to make films, Hollywood-quality streams, and so much more! </p>

          </div>
        </div>
      </section>
    </div>

  )
}

export { ComingSoonPage }