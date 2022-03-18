
import React from 'react';

function IndexPage () {
  return (
    <div>

      <section className="section is-small">
        <h1 className="title is-1">Storyteller</h1>
        <h2 className="subtitle is-3">
          The future of production
        </h2>
      </section>

      {/*
      <section className="hero is-small">
        <div className="hero-body">
          <div className="columns is-vcentered">
            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose2_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
            <div className="column">
              <p className="title is-1">
                Storyteller
              </p>
              <p className="subtitle is-3">
                The future of production
              </p>
            </div>
          </div>
        </div>
      </section>
      */}
      
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
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="section is-small">
        <h1 className="title">Try It!</h1>
        <h2 className="subtitle">
        </h2>
      </section>

      <section className="hero is-small">
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
                income. We've built the most engaging donation system for Twitch to date,
                letting audience members pay to use Deep Fake voices and emotes in their
                favorite streamers' live broadcasts. 
              </p>
            </div>

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose6_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section is-small">
        <h1 className="title is-4">Get started with your channel!</h1>
        <h2 className="subtitle is-6">
          There's nothing to install. It's the easiest, most engaging, most fun system for Twitch yet.
          And it earns <em>you</em> money.
        </h2>
      </section>



    </div>
  );
}

export default IndexPage;
