import './VoiceCloneRequestPage.css';

import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState }  from 'react';

interface Props {
}

function VoiceCloneRequestPage(props: Props) {
  // Contact
  const [emailAddress, setEmailAddress] = useState("");
  const [discord, setDiscord] = useState("");

  // Visibility

  //const getLeaderboard = useCallback(async () => {
  //  const leaderboardReponse = await GetLeaderboard();

  //  if (GetLeaderboardIsOk(leaderboardReponse)) {
  //    setLeaderboard(leaderboardReponse);
  //    setTtsLeaderboard(leaderboardReponse.tts_leaderboard);
  //    setW2lLeaderboard(leaderboardReponse.w2l_leaderboard);
  //  } else if (GetLeaderboardIsErr(leaderboardReponse)) {
  //    switch(leaderboardReponse) {
  //      // TODO: There's an issue with the queries not returning before the deadline.
  //      // I should add a Redis TTL cache to store the results and an async job to warm the cache.
  //      case LeaderboardLookupError.NotFound:
  //        if (retryCount < 3) {
  //          setTimeout(() => getLeaderboard(), 1000);
  //          setRetryCount(retryCount+1);
  //        }
  //        break;
  //    }
  //  }
  //}, [retryCount]);

  //useEffect(() => {
  //  getLeaderboard();
  //}, [getLeaderboard]);

  return (
    <div>

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose4_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title is-1">
                Professionally Clone Your Voice
              </p>
              <p className="subtitle is-3">
                (or any voice) for just $70
              </p>

            </div>

          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">

          <h1 className="title is-2">Want a Custom Voice You Can Use?</h1>
          <h1 className="subtitle is-4">For Music, Videos, Twitch Rewards, API, friends, family&hellip; whatever you want!</h1>

          <p>
            We have an extremely talented staff that will personally handle your voice clone request. 
            Please help us understand more about your voice and how you want to use it, and we'll be in touch
            shortly.
          </p>

          <br />

          <h1 className="title is-3">First, how should we get in touch?</h1>

          <div className="field">
            <label className="label">Email Address</label>
            <div className="control has-icons-left">
              <input className="input is-medium is-fullwidth" type="text" placeholder="Email Address" value="" />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </div>
            <p className="help is-success"></p>
            <p className="help is-danger"></p>
          </div>

          <div className="field">
            <label className="label">
              Discord Username (Optional, but an alternate way to reach you.)
              <br />
            </label>
            <div className="control has-icons-left">
              <input className="input is-medium is-fullwidth" type="text" placeholder="Discord" value="" />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </div>
            <p className="help">
              Don't forget the <em>#0000</em> part of your username!
            </p>
            <p className="help is-danger"></p>
          </div>

          <br />

          <h1 className="title is-3">Who's voice is this?</h1>

          <p>If it's your voice, you'll be able to do anything you want with it. If it's another person's voice, you may have 
            limits on how you can use it (eg. limits on commercialization.) That doesn't mean we can't help you. Even if you
            just want your favorite character so you can make Twitter memes, that's fine!</p>

          <br />

          <div className="checkbox-block">
            <div className="control">
              <label className="radio">
                <input type="radio" name="answer" />
                &nbsp;My own voice
              </label>
              <br />
              <label className="radio">
                <input type="radio" name="answer" />
                &nbsp;A family member's voice
              </label>
              <br />
              <label className="radio">
                <input type="radio" name="answer" />
                &nbsp;Another person's voice
              </label>
            </div>
          </div>

          <br />

          <h1 className="title is-3">How will you use it?</h1>

          <p>Click as many as you plan to use!</p>

          <br />

          <div className="checkbox-block">
            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;For Music (for creating new songs)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;For Games (because NPCs won't talk by themselves)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;For Twitch TTS (creating rewards for my stream, helping me engage and monetize)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;For API use (unlimited use of the FakeYou.com API for anything you want to build)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;Other (Oooh, now we're curious!)
            </label>
          </div>

          <br />

          <div className="field">
            <label className="label">Let us know more about your use (optional)</label>
            <div className="control has-icons-left">
              <input className="input is-medium is-fullwidth" type="text" placeholder="Optional details" value="" />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </div>
            <p className="help is-success"></p>
            <p className="help is-danger"></p>
          </div>

          <br />

          <h1 className="title is-3">Do you want it to be private?</h1>

          <p>(We'll accept multiple answers here, because maybe you want to use it multiple ways.)</p>

          <br />

          <div className="checkbox-block">
            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;This is for private use for just me
            </label>

            <br />
            
            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;This is for private use amongst a group of people
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;This is for public use
            </label>
          </div>

          <br />

          <h1 className="title is-3">How's your audio quality?</h1>

          <p>It's okay if you don't have a quality source of audio, but the results are top notch only with a good recording setup.</p>

          <br />

          <div className="checkbox-block">
            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;I have a good microphone (and I know what a condenser microphone is)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" />
              &nbsp;I have really good preexisting recordings.
            </label>
          </div>

          <br />

          <h1 className="title is-3">Anything else?</h1>


          <div className="field">
            <label className="label">Do you have any questions for us?</label>
            <div className="control">
              <textarea className="textarea" placeholder="Optional Questions"></textarea>
            </div>
          </div>          

          <div className="field">
            <label className="label">Do you have any important notes or details?</label>
            <div className="control">
              <textarea className="textarea" placeholder="Optional Notes"></textarea>
            </div>
          </div>          

          <br />

          <button className="button is-link is-large is-fullwidth">Clone my voice!</button>

        </div>
      </section>
    </div>
  );
}

export { VoiceCloneRequestPage }