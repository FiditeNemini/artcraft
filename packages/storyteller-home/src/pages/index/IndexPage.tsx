
import { faApple, faLinux, faSpeakap, faSpeakerDeck, faTwitch, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faArrowRight, faAsterisk, faFlask, faHeadphonesAlt, faMicrophone, faQuoteLeft, faUser, faUserAlt, faUserCircle, faUsers, faVoicemail } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import AudioSample from './AudioSample';

function IndexPage () {
  return (
    <div>

      <section className="section is-small">
        <h1 className="title is-1">
          Storyteller&nbsp;
          <figure className="image is-64x64 is-inline-block">
            <img src="/logo/storyteller_kitsune_logo_3000.png" alt="FakeYou's mascot!" />
          </figure>
        </h1>
        <h2 className="subtitle is-3">
          The future of production
        </h2>
        <p>We're streamers and filmmakers building all of the components of the future Hollywood studio.</p>
      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <div className="columns is-vcentered">
            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose2_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
            <div className="column">
              <p className="title is-3">
                1) <em>FakeYou</em> Text to Speech
              </p>
              <p className="subtitle is-5">
                FakeYou is used by millions of people every month.
              </p>
              <p>
                We've built a social platform for deep learning and generative models. 
                <br />
                <br />
                
                <em>FakeYou</em> is a place where creators can upload and 
                manage a variety of deep fake models: speech, music, lipsyncing, and more.
                We offer paid voice cloning services, an API with free 
                and paid tiers, and in the future, 
                our users will be able to monetize their own voices.
                Use this to dub your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section is-small">
        <h1 className="title is-4">Try It!</h1>
        <h2 className="subtitle is-6">
        [ demo goes here ]
        </h2>
        <br />

        <div className="columns">
          <div className="column">
            <a 
              className="button is-fullwidth is-large is-info is-inverted"
              href="https://fakeyou.com"
              >
              Check out our 1,500 other voices
            </a>
          </div>

          <div className="column">
            <a 
              className="button is-fullwidth is-large is-info"
              href="https://fakeyou.com/clone"
              >
              Then Clone&nbsp;<em>Your</em>&nbsp;Voice&nbsp;<FontAwesomeIcon icon={faUserCircle} />
            </a>
          </div>
        </div>
      </section>

      <section className="hero is-small is-link">
        <div className="hero-body">
          <div className="columns is-vcentered">

            <div className="column">
              <p className="title is-3">
                2) <em>Storyteller TTS for Twitch</em>
              </p>
              <p className="subtitle is-5">
                Twitch Streamers and Creators can engage and monetize
              </p>
              <p>
                It's tough to build an audience on Twitch. It's even tougher to earn an
                income. We've built the most comprehensive and engaging donation system 
                for Twitch to date, letting audience members pay to use Deep Fake voices 
                and emotes in their favorite streamers' live broadcasts. 
              </p>
            </div>

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose6_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
          </div>

          <h1 className="title is-4">Get started with your channel!</h1>
          <h2 className="subtitle is-6">
            There's nothing to install. It's the easiest, most engaging, most fun system for Twitch yet.
            &nbsp;
            <em><u>And it earns you money!</u></em>
          </h2>
          <a 
            className="button is-fullwidth is-large is-black is-inverted"
            href="https://create.storyteller.io"
            >
            Add to your stream now!&nbsp;<FontAwesomeIcon icon={faTwitch} />
          </a>
        </div>
      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <div className="columns is-vcentered">
            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose4_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
            <div className="column">
              <p className="title is-3">
                3) <em>FakeYou Voice Changer</em>
              </p>
              <p className="subtitle is-5">
                Now you can sound like someone else
              </p>
              <p>
                Change how you sound in <em>real time</em>. Choose your next voice.
                Great for your stream, hanging out in VR, or filming that historical drama.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section is-small">
        <h1 className="title is-4">Voice changing demo</h1>
        <h2 className="subtitle is-6">
        </h2>

        This is still an early beta. Voice quality will improve substantially over time.

        <br />
        <br />

        <div className="columns is-mobile has-text-centered">
          <div className="column">
            <AudioSample sampleUrl="/audio-samples/voice-conversion-1.mp3" />
            <br />
            <br />
            <p>
              <em>
                &ldquo;I've got a huge announcement. 
                This just sounds really, really great.
                And other than some phase distortion, artifacts, 
                this is just sounding really great. 
                And it's good for America. 
                And voice synthesis is amazing.&rdquo;
              </em>
            </p>
          </div>
          <div className="column">
            <AudioSample sampleUrl="/audio-samples/voice-conversion-2.mp3" />
            <br />
            <br />
            <p>
              <em>
                &ldquo;My favorite game is Super Smash Bros Ultimate. 
                It's a really, really great game. 
                It's huge. There's so many characters.&rdquo;
              </em>
            </p>
          </div>
        </div>

        <p className="has-text-centered">
          Brandon <FontAwesomeIcon icon={faArrowRight} /> Donald Trump<br />
          Real time voice to voice conversion.
        </p>



      </section>

      <section className="section is-small">
        <h1 className="title is-4">Sign up for your very own voice changer</h1>
        <h2 className="subtitle is-6">
          We'll be rolling this out shortly. Get on the list! Tell us who you want to be.
        </h2>
        <a 
          className="button is-fullwidth is-large is-info"
          href="https://create.storyteller.io"
          >
          Transform my voice!&nbsp;<FontAwesomeIcon icon={faMicrophone} />
        </a>
      </section>

      <section className="hero is-small is-link">
        <div className="hero-body">
          <div className="columns is-vcentered">
            <div className="column">
              <p className="title is-3">
                3) <em>Storyteller VoxelCam</em>
              </p>
              <p className="subtitle is-5">
                Volumetric capture for your stream, and soon for your film set.
              </p>
              <p>
                Webcams are boring and flat. You can use our volumetric camera in-stream to make
                your personality come to life. We'll be leveraging this tech to build a no-camera 
                virtual set.
              </p>
            </div>

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose5_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
          </div>

        <h1 className="title is-4">Volumetric cameras aren't limited to two dimensions</h1>
        <h2 className="subtitle is-6">
        </h2>

        <p>
        [ demo goes here ]
        </p>
        <br />

        <h1 className="title is-4">Downloads coming soon</h1>
        <h2 className="subtitle is-6">
          For Windows, Mac, and Linux
        </h2>

        <p>
          You'll need a Microsoft Kinect (v1, v2, Azure Kinect) or Intel RealSense camera. 
          We plan to support stereoscopic webcams soon.
        </p>

        <br />

        <div className="columns">
          <div className="column">
            <a 
              className="button is-fullwidth is-large is-info"
              href="#"
              >
              Windows&nbsp;<FontAwesomeIcon icon={faWindows} />
            </a>
          </div>

          <div className="column">

            <a 
              className="button is-fullwidth is-large is-info"
              href="#"
              >
              Mac&nbsp;<FontAwesomeIcon icon={faApple} />
            </a>

          </div>

          <div className="column">

            <a
              className="button is-fullwidth is-large is-info"
              href="#"
              >
              Linux&nbsp;<FontAwesomeIcon icon={faLinux} />
            </a>

          </div>
        </div>
        </div>
      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <div className="columns is-vcentered">
            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose9_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title is-3">
                4) <em>Storyteller Engine</em>
              </p>
              <p className="subtitle is-5">
                A fully 3D virtual set for your stream or film
              </p>
              <p>
                Our community contributes sets, character models, props, events, and more.
                Use motion or volumetric capture.
                Your audience can control everything. 
                Ideal for improv, news casts, interviews, gaming, fast virtual filmmaking, 
                and much more!
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="section is-small">
        <h1 className="title is-4">Demo and screenshots</h1>
        <h2 className="subtitle is-6">
        </h2>
        <br />

        <div className="columns">
          <div className="column">
            <figure className="image is-square">
              <img src="/screenshots/engine-fuji.png" />
            </figure>
          </div>

          <div className="column">
            <figure className="image is-square">
              <img src="/screenshots/engine-zelda-monsters.png" />
            </figure>
          </div>

          <div className="column">
            <figure className="image is-square">
              <img src="/screenshots/engine-point-cloud.png" />
            </figure>
          </div>
        </div>
      </section>

      <section className="section is-small">
        <h1 className="title is-4">Apply for our beta program</h1>
        <h2 className="subtitle is-6">
          We need early alpha testers
        </h2>
        <br />
        <a 
          className="button is-fullwidth is-large is-info"
          href="https://create.storyteller.io"
          >
          Ask us about hosting a stream!&nbsp;<FontAwesomeIcon icon={faFlask} />
        </a>

      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <p className="title is-3">
            Together we're going to make great things
          </p>
          <p className="subtitle is-5">
            We're just getting started
          </p>
          <p>
            Blah blah
          </p>
        </div>
      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <p className="title is-3">
            Press and social media mentions
          </p>
          <p className="subtitle is-5">
            TODO
          </p>
          <p>
            Blah blah
          </p>
        </div>
      </section>




    </div>
  );
}

export default IndexPage;
