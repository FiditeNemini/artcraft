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
                  <li>Deepfake Emotes</li>
                </ul>
              </li>
              <li>Voice and video 
                <ul>
                  <li>Real time voice conversion</li>
                  <li>VoxelCam 3D volumetric camera</li>
                </ul>
              </li>
              <li>Storyteller Engine
                <ul>
                  <li>High quality cinematic game engine </li>
                  <li>Real time 3D motion capture of one or more streamers / actors</li>
                  <li>Dedicated control plane for camera, lighting, control OPs</li>
                  <li>Embed rich content: games, browser panes, video feeds</li>
                </ul>
              </li>
            </ul>

            <p>You'll be able to make films, Hollywood-quality streams, and much more! </p>

          </div>
        </div>
      </section>
    </div>

  )
}

export { ComingSoonPage }