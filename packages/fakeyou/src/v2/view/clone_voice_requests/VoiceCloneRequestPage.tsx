import './VoiceCloneRequestPage.css';

import { faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState }  from 'react';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

interface Props {
}

function VoiceCloneRequestPage(props: Props) {
  // Contact
  const [emailAddress, setEmailAddress] = useState("");
  const [discord, setDiscord] = useState("");

  // Visibility
  const [isForPublicUse, setIsForPublicUse] = useState(false);
  const [isForPrivateUse, setIsForPrivateUse] = useState(false);

  // Use
  const [isForTwitchTts, setIsForTwitchTts] = useState(false);
  const [isForApiUse, setIsForApiUse] = useState(false);
  const [isForMusic, setIsForMusic] = useState(false);
  const [isForGames, setIsForGames] = useState(false);
  const [isForOther, setIsForOther] = useState(false);
  const [optionalNotesOnUse, setOptionalNotesOnUse] = useState("");

  // Subject/ownership
  const [isOwnVoice, setIsOwnVoice] = useState(false);
  const [isThirdPartyVoice, setIsThirdPartyVoice] = useState(false);
  const [notesOnSubject, setNotesOnSubject] = useState("");
  
  // Equipment
  const [hasCleanAudioRecordings, setHasCleanAudioRecordings] = useState(false);
  const [hasGoodMicrophone, setHasGoodMicrophone] = useState(false);

  // Comments
  const [optionalQuestions, setOptionalQuestions] = useState("");
  const [optionalExtraComments, setOptionalExtraComments] = useState("");

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

  const handleEmailAddressChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setEmailAddress((ev.target as HTMLInputElement).value);
  };

  const handleDiscordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setDiscord((ev.target as HTMLInputElement).value);
  };

  const handleSubjectChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    switch (value) {
      case 'mine':
        setIsOwnVoice(true);
        setIsThirdPartyVoice(false);
        break;
      case 'family':
        setIsOwnVoice(false);
        setIsThirdPartyVoice(true);
        break;
      case 'client':
        setIsOwnVoice(false);
        setIsThirdPartyVoice(true);
        break;
      case '3rd':
        setIsOwnVoice(false);
        setIsThirdPartyVoice(true);
        break;
    }
  };

  const handleSubjectNotesChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setNotesOnSubject((ev.target as HTMLInputElement).value);
  };

  const handleIsForMusicChange = () => {
    setIsForMusic(!isForMusic);
  };

  const handleIsForGamesChange = () => {
    setIsForGames(!isForGames);
  };

  const handleIsForTwitchTtsChange = () => {
    setIsForTwitchTts(!isForTwitchTts);
  };

  const handleIsForApiUseChange = () => {
    setIsForApiUse(!isForApiUse);
  };

  const handleIsForOtherChange = () => {
    setIsForOther(!isForOther);
  };

  const handleOptionalNotesOnUseChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setOptionalNotesOnUse((ev.target as HTMLInputElement).value);
  };

  const handleIsForPrivateUseChange = () => {
    setIsForPrivateUse(!isForPrivateUse);
  };

  const handleIsForPublicUseChange = () => {
    setIsForPublicUse(!isForPublicUse);
  };

  const handleHasCleanAudioRecordingsChange= () => {
    setHasCleanAudioRecordings(!hasCleanAudioRecordings);
  };

  const handleHasGoodMicrophoneChange = () => {
    setHasGoodMicrophone(!hasGoodMicrophone);
  };

  const handleOptionalExtraCommentsChange = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    setOptionalExtraComments((ev.target as HTMLTextAreaElement).value);
  };

  const handleOptionalQuestionsChange= (ev: React.FormEvent<HTMLTextAreaElement>) => {
    setOptionalQuestions((ev.target as HTMLTextAreaElement).value);
  };

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
          <h1 className="subtitle is-4">For Music, Videos, Twitch Rewards, API, Friends, Family&hellip; whatever you want!</h1>

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
              <input 
                className="input is-medium is-fullwidth" 
                type="text" 
                placeholder="Email Address" 
                value={emailAddress} 
                onChange={handleEmailAddressChange} 
                />
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
              <input className="input is-medium is-fullwidth" 
                type="text" 
                placeholder="Discord" 
                value={discord} 
                onChange={handleDiscordChange} 
                />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faDiscord} />
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
                <input type="radio" name="subject" value="mine" onChange={handleSubjectChange} />
                &nbsp;My own voice
              </label>
              <br />
              <label className="radio">
                <input type="radio" name="subject" value="family" onChange={handleSubjectChange} />
                &nbsp;A family member's voice
              </label>
              <br />
              <label className="radio">
                <input type="radio" name="subject" value="client" onChange={handleSubjectChange} />
                &nbsp;A client's voice
              </label>
              <br />
              <label className="radio">
                <input type="radio" name="subject" value="3rd" onChange={handleSubjectChange} />
                &nbsp;Another person's voice
              </label>
            </div>
          </div>

          <br />

          <div className="field">
            <label className="label">If it isn't your voice, tell us about who it is!</label>
            <div className="control has-icons-left">
              <input 
                className="input is-medium is-fullwidth" 
                type="text" 
                placeholder="Notes on the person" 
                value={notesOnSubject}
                onChange={handleSubjectNotesChange}
                />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faUser} />
              </span>
            </div>
            <p className="help is-success"></p>
            <p className="help is-danger"></p>
          </div>

          <br />

          <h1 className="title is-3">How will you use it?</h1>

          <p>Click as many as you plan to use!</p>

          <br />

          <div className="checkbox-block">
            <label className="checkbox">
              <input type="checkbox" checked={isForMusic} onChange={handleIsForMusicChange} />
              &nbsp;For Music (for creating new songs)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={isForGames} onChange={handleIsForGamesChange} />
              &nbsp;For Games (because NPCs won't talk by themselves)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={isForTwitchTts} onChange={handleIsForTwitchTtsChange} />
              &nbsp;For Twitch TTS (creating rewards for my stream, helping me engage and monetize)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={isForApiUse} onChange={handleIsForApiUseChange} />
              &nbsp;For API use (unlimited use of the FakeYou.com API for anything you want to build)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={isForOther} onChange={handleIsForOtherChange} />
              &nbsp;Other (Now we're curious!)
            </label>
          </div>

          <br />

          <div className="field">
            <label className="label">Let us know more about your use (optional)</label>
            <div className="control has-icons-left">
              <input 
                className="input is-medium is-fullwidth" 
                type="text" 
                placeholder="Optional details" 
                value={optionalNotesOnUse}
                onChange={handleOptionalNotesOnUseChange}
                />
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
              <input type="checkbox" checked={isForPrivateUse} onChange={handleIsForPrivateUseChange} />
              &nbsp;This is for private use amongst a group of people
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={isForPublicUse} onChange={handleIsForPublicUseChange} />
              &nbsp;This is for public use
            </label>
          </div>

          <br />

          <h1 className="title is-3">How's your audio quality?</h1>

          <p>It's okay if you don't have a quality source of audio, but the results are top notch only with a good recording setup.</p>

          <br />

          <div className="checkbox-block">
            <label className="checkbox">
              <input type="checkbox" checked={hasGoodMicrophone} onChange={handleHasGoodMicrophoneChange} />
              &nbsp;I have a good microphone (and I know what a condenser microphone is)
            </label>

            <br />

            <label className="checkbox">
              <input type="checkbox" checked={hasCleanAudioRecordings} onChange={handleHasCleanAudioRecordingsChange} />
              &nbsp;I have really good preexisting recordings.
            </label>
          </div>

          <br />

          <h1 className="title is-3">Anything else?</h1>


          <div className="field">
            <label className="label">Do you have any questions for us?</label>
            <div className="control">
              <textarea 
                className="textarea" 
                placeholder="Optional Questions"
                onChange={handleOptionalQuestionsChange}
                value={optionalQuestions}
                ></textarea>
            </div>
          </div>          

          <div className="field">
            <label className="label">Do you have any important notes or details?</label>
            <div className="control">
              <textarea 
                className="textarea" 
                placeholder="Optional Notes"
                onChange={handleOptionalExtraCommentsChange}
                value={optionalExtraComments}
                ></textarea>
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