
import { faApple, faLinux, faTwitch, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faFlask, faMicrophone, faQuoteLeft, faUserCircle } from '@fortawesome/free-solid-svg-icons';
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
                Every day, artists and musicians use our tools to their to dub their 
                creative work.
                We offer paid voice cloning services, an API with free 
                and paid tiers, and in the future, 
                our users will be able to monetize their own voices.
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
            className="button is-fullwidth is-large is-info is-inverted"
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
          href="https://fakeyou.com/clone"
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
          We plan to support ordinary webcams too!
        </p>
        <br />

        <article className="message is-danger">
          <div className="message-body">
            Downloads coming April 8th, 2022!
          </div>
        </article>


        <div className="columns">
          <div className="column">
            <button 
              className="button is-fullwidth is-large is-info is-inverted"
              >
              Windows&nbsp;<FontAwesomeIcon icon={faWindows} />
            </button>
          </div>

          <div className="column">
            <button 
              className="button is-fullwidth is-large is-info is-inverted"
              >
              Mac&nbsp;<FontAwesomeIcon icon={faApple} />
            </button>
          </div>

          <div className="column">
            <button
              className="button is-fullwidth is-large is-info is-inverted"
              >
              Linux&nbsp;<FontAwesomeIcon icon={faLinux} />
            </button>
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
              <img src="/screenshots/engine-fuji.png" alt="screenshot" />
            </figure>
          </div>

          <div className="column">
            <figure className="image is-square">
              <img src="/screenshots/engine-zelda-monsters.png" alt="screenshot" />
            </figure>
          </div>

          <div className="column">
            <figure className="image is-square">
              <img src="/screenshots/engine-point-cloud.png" alt="screenshot" />
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
          href="https://discord.gg/H72KFXm"
          >
          Ask us about hosting a stream in Discord!&nbsp;<FontAwesomeIcon icon={faFlask} />
        </a>

      </section>

      <section className="hero is-small">
        <div className="hero-body">
          <p className="title is-3">
            Press and social media mentions
          </p>
          <p className="subtitle is-5">
            This is only a sample of our hundreds of mentions across the web
          </p>

          <div className="columns is-vcentered has-text-centered">

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
                      Tool of the Week: AI voice generator | [FakeYou ...] is a window into 
                      the future [...]. Play with it with a number of celebrity voices, including Judi Dench, 
                      Neil DeGrasse Tyson, and Bill Gates.</p>
                    
                    <p>Techstars</p>

                    <figure className="image is-64x64 is-inline-block">
                      <img src="/press-logos/techstars_logo.png" className="is-rounded" alt="logo" />
                    </figure>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
                      無料でビル・ゲイツやアーノルド・シュワルツネッガーなど有名人に好きな台詞をしゃべらせることができる「Vocodes」レビュー</p>
                    <p>
                      ("Vocodes" [now FakeYou] allows users to use celebrities such as Bill Gates and 
                      Arnold Schwarzenegger to speak their favorite lines for free.)</p>

                    <p>Gigazine</p>

                    <figure className="image is-64x64 is-inline-block">
                      <img src="/press-logos/gigazine_g.jpg" className="is-rounded" alt="logo" />
                    </figure>

                  </div>
                </div>
              </div>
            </div>

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
								      Have you ever wanted David Attenborough to narrate your audiobook? 
									    Judi Dench to read your shopping list? Gilbert Gottfried to... well... some things are better left unsaid.
                    </p>

                    <p>Shots</p>

                    <figure className="image is-64x64 is-inline-block">
                      <img src="/press-logos/shots.png" className="is-rounded" alt="logo" />
                    </figure>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="columns is-vcentered has-text-centered">

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
                      Un truco secreto de WhatsApp se acaba de volver tendencia en las redes sociales, 
                      sobre todo entre los fanáticos de Dragon Ball Super, debido a que permite que los 
                      usuarios puedan enviar audios con la voz de Gokú, 
                    </p>
                    <p>(A secret WhatsApp trick has just become a trend on social networks , especially 
                      among Dragon Ball Super fans , because it allows users to send audios with the 
                      voice of Goku</p>

                    <p>La República</p>

                  </div>
                </div>
              </div>
            </div>

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
                      We’ve previously seen apps like this, but Vocodes [now FakeYou] impresses with the sheer 
                      volume of voices available to test out.
                    </p>
                    <p>TheNextWeb</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-one-third">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <p>
                      <FontAwesomeIcon icon={faQuoteLeft} />&nbsp;
                      [Digital artist Glenn Marshall's recent project employs]
                      a classic 19th-century 
                      poem as AI-imaging fuel alongside an uncanny narration from an artificial Christopher Lee.
                      To make "In the Bleak Midwinter" even more, uh, bleak, Marshall then employed software called 
                      vo.codes [now FakeYou] to approximate a poetic narration in the voice of the late Sir Christopher Lee. 
                      [...] to be honest with you, we initially thought Marshall simply dubbed an old audio recording of 
                      Lee actually reading the poem, that's how convincing the result is.</p>

                    <p>Input</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

export default IndexPage;
