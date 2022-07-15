import "./VoiceCloneRequestPage.css";

import { v4 as uuidv4 } from "uuid";
import {
  faEnvelope,
  faMicrophone,
  faRedo,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  CreateVoiceCloneApplication,
  CreateVoiceCloneApplicationIsError,
  CreateVoiceCloneApplicationIsSuccess,
  CreateVoiceCloneApplicationRequest,
} from "@storyteller/components/src/api/clone_requests/CreateVoiceCloneApplicationRequest";
import {
  CheckVoiceCloneApplication,
  CheckVoiceCloneApplicationIsError,
  CheckVoiceCloneApplicationIsSuccess,
  CheckVoiceCloneApplicationRequest,
} from "@storyteller/components/src/api/clone_requests/CheckVoiceCloneApplication";
import { Link } from "react-router-dom";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { distance, delay, delay2, duration } from "../../../data/animation";
import { USE_REFRESH } from "../../../Refresh";
const Fade = require("react-reveal/Fade");

interface Props {}

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

  // Form submission state
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [formWasSubmitted, setFormWasSubmitted] = useState(false);

  // Previous form submission state
  const [formWasPrevioiuslySubmitted, setFormWasPreviouslySubmitted] =
    useState(false);

  const checkPreviousApplication = useCallback(async () => {
    const request: CheckVoiceCloneApplicationRequest = {};

    const response = await CheckVoiceCloneApplication(request);

    if (CheckVoiceCloneApplicationIsSuccess(response)) {
      setFormWasPreviouslySubmitted(response.has_submitted);
    } else if (CheckVoiceCloneApplicationIsError(response)) {
    }
  }, []);

  useEffect(() => {
    checkPreviousApplication();
  }, [checkPreviousApplication]);

  const handleEmailAddressChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setEmailAddress((ev.target as HTMLInputElement).value);
  };

  const handleDiscordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setDiscord((ev.target as HTMLInputElement).value);
  };

  const handleSubjectChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    switch (value) {
      case "mine":
        setIsOwnVoice(true);
        setIsThirdPartyVoice(false);
        break;
      case "family":
        setIsOwnVoice(false);
        setIsThirdPartyVoice(true);
        break;
      case "client":
        setIsOwnVoice(false);
        setIsThirdPartyVoice(true);
        break;
      case "3rd":
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

  const handleOptionalNotesOnUseChange = (
    ev: React.FormEvent<HTMLInputElement>
  ) => {
    setOptionalNotesOnUse((ev.target as HTMLInputElement).value);
  };

  const handleIsForPrivateUseChange = () => {
    setIsForPrivateUse(!isForPrivateUse);
  };

  const handleIsForPublicUseChange = () => {
    setIsForPublicUse(!isForPublicUse);
  };

  const handleHasCleanAudioRecordingsChange = () => {
    setHasCleanAudioRecordings(!hasCleanAudioRecordings);
  };

  const handleHasGoodMicrophoneChange = () => {
    setHasGoodMicrophone(!hasGoodMicrophone);
  };

  const handleOptionalExtraCommentsChange = (
    ev: React.FormEvent<HTMLTextAreaElement>
  ) => {
    setOptionalExtraComments((ev.target as HTMLTextAreaElement).value);
  };

  const handleOptionalQuestionsChange = (
    ev: React.FormEvent<HTMLTextAreaElement>
  ) => {
    setOptionalQuestions((ev.target as HTMLTextAreaElement).value);
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      setFormErrorMessage("Email address is invalid");
      return false;
    }

    if (!!discord.trim() && !discord.includes("#")) {
      setFormErrorMessage(
        "Discord username is invalid. It needs the '#' number."
      );
      return false;
    }

    let request: CreateVoiceCloneApplicationRequest = {
      idempotency_token: uuidv4(),

      // Contact
      email_address: emailAddress.trim(),
      discord_username: discord.trim(),

      // Visibility
      is_for_private_use: isForPrivateUse,
      is_for_public_use: isForPublicUse,

      // Use
      is_for_studio: false, // TODO
      is_for_twitch_tts: isForTwitchTts,
      is_for_api_use: isForApiUse,
      is_for_music: isForMusic,
      is_for_games: isForGames,
      is_for_other: isForOther,

      // Subject/Ownership
      is_own_voice: isOwnVoice,
      is_third_party_voice: isThirdPartyVoice,

      // Equipment
      has_clean_audio_recordings: hasCleanAudioRecordings,
      has_good_microphone: hasGoodMicrophone,
    };

    if (!!optionalNotesOnUse) {
      request.optional_notes_on_use = optionalNotesOnUse.trim();
    }

    if (!!notesOnSubject) {
      request.optional_notes_on_subject = notesOnSubject.trim();
    }

    if (!!optionalQuestions) {
      request.optional_questions = optionalQuestions.trim();
    }

    if (!!optionalExtraComments) {
      request.optional_extra_comments = optionalExtraComments.trim();
    }

    const response = await CreateVoiceCloneApplication(request);

    if (CreateVoiceCloneApplicationIsSuccess(response)) {
      setFormWasSubmitted(true);
      setFormErrorMessage("");
    } else if (CreateVoiceCloneApplicationIsError(response)) {
      // TODO
    }

    return false;
  };

  let header = <></>;

  if (!USE_REFRESH) {
    header = (
      <>
        <section className="hero is-small">
          <div className="hero-body">
            <div className="columns is-vcentered">
              <div className="column is-one-third">
                <div className="mascot">
                  <img
                    src="/mascot/kitsune_pose4_black_2000.webp"
                    alt="FakeYou's mascot!"
                  />
                </div>
              </div>

              <div className="column">
                <p className="title is-1">Professionally Clone Your Voice</p>
                <p className="subtitle is-3">(or any voice) for just $70</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  } else {
    header = (
      <>
        <div className="container mb-4">
          <div className="row gx-3 flex-lg-row-reverse align-items-center">
            <div className="col-lg-6">
              <div className="d-flex justify-content-center">
                <Fade
                  right
                  distance={distance}
                  duration={duration}
                  delay={delay}
                >
                  <img
                    src="/mascot/kitsune_pose4.png"
                    className="ani4 load-hidden img-fluid"
                    width="560"
                    loading="lazy"
                    alt="FakeYou Mascot"
                  />
                </Fade>
              </div>
            </div>
            <div className="col-lg-6 px-md-2 px-lg-5 px-xl-2">
              <Fade bottom cascade distance={distance} duration={duration}>
                <div className="text-center text-lg-start">
                  <h1 className="display-5 fw-bold lh-1">
                    Professionally Clone Your Voice
                  </h1>
                  <h3 className="mb-4">(or any voice) for just $70</h3>
                  <div className="d-flex flex-column justify-content-center">
                    <h3>Want a Custom Voice You Can Use?</h3>
                    <p className="lead">
                      For Music, Videos, Twitch Rewards, API, Friends, Family…
                      whatever you want!
                    </p>
                  </div>
                </div>
              </Fade>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (formWasSubmitted) {
    return (
      <div>
        {header}

        <section className="section">
          <div className="container">
            <h1 className="title is-2">We've got it! We'll be in touch!</h1>
            <h1 className="title is-4">(We can't wait to clone your voice!)</h1>
          </div>

          <br />
          <br />

          <Link
            to={FrontendUrlConfig.indexPage()}
            className="button is-info is-large is-fullwidth is-outlined"
          >
            Back to home&nbsp;
            <FontAwesomeIcon icon={faRedo} />
          </Link>
        </section>
      </div>
    );
  }

  let previouslySubmittedNote = <></>;

  if (formWasPrevioiuslySubmitted) {
    previouslySubmittedNote = (
      <>
        <article className="message is-warning">
          <div className="message-body">
            It looks like you've already submitted a request, but feel free to
            submit another!
            <br />
            (Especially if you have another voice for us!)
          </div>
        </article>
      </>
    );
  }

  let errorMessage = <></>;
  if (!!formErrorMessage) {
    errorMessage = (
      <>
        <article className="message is-danger">
          <div className="message-body">
            <strong className="red">Error with form:</strong> {formErrorMessage}
          </div>
        </article>
      </>
    );
  }

  if (!USE_REFRESH) {
    return (
      <div>
        {header}

        <section className="section">
          <div className="container">
            <h1 className="title is-2">Want a Custom Voice You Can Use?</h1>
            <h1 className="subtitle is-4">
              For Music, Videos, Twitch Rewards, API, Friends, Family&hellip;
              whatever you want!
            </h1>

            {previouslySubmittedNote}

            <p>
              We have an extremely talented staff that will personally handle
              your voice clone request. Please help us understand more about
              your voice and how you want to use it, and we'll be in touch
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
                <input
                  className="input is-medium is-fullwidth"
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

            <p>
              If it's your voice, you'll be able to do anything you want with
              it. If it's another person's voice, you may have limits on how you
              can use it (eg. limits on commercialization.) That doesn't mean we
              can't help you. Even if you just want your favorite character so
              you can make Twitter memes, that's fine!
            </p>

            <br />

            <div className="checkbox-block">
              <div className="control">
                <label className="radio">
                  <input
                    type="radio"
                    name="subject"
                    value="mine"
                    onChange={handleSubjectChange}
                  />
                  &nbsp;My own voice
                </label>
                <br />
                <label className="radio">
                  <input
                    type="radio"
                    name="subject"
                    value="family"
                    onChange={handleSubjectChange}
                  />
                  &nbsp;A family member's voice
                </label>
                <br />
                <label className="radio">
                  <input
                    type="radio"
                    name="subject"
                    value="client"
                    onChange={handleSubjectChange}
                  />
                  &nbsp;A client's voice
                </label>
                <br />
                <label className="radio">
                  <input
                    type="radio"
                    name="subject"
                    value="3rd"
                    onChange={handleSubjectChange}
                  />
                  &nbsp;Another person's voice
                </label>
              </div>
            </div>

            <br />

            <div className="field">
              <label className="label">
                If it isn't your voice, tell us about who it is!
              </label>
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
                <input
                  type="checkbox"
                  checked={isForMusic}
                  onChange={handleIsForMusicChange}
                />
                &nbsp;For Music (for creating new songs)
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForGames}
                  onChange={handleIsForGamesChange}
                />
                &nbsp;For Games (because NPCs won't talk by themselves)
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForTwitchTts}
                  onChange={handleIsForTwitchTtsChange}
                />
                &nbsp;For Twitch TTS (creating rewards for my stream, helping me
                engage and monetize)
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForApiUse}
                  onChange={handleIsForApiUseChange}
                />
                &nbsp;For API use (unlimited use of the FakeYou.com API for
                anything you want to build)
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForOther}
                  onChange={handleIsForOtherChange}
                />
                &nbsp;Other (Now we're curious!)
              </label>
            </div>

            <br />

            <div className="field">
              <label className="label">
                Let us know more about your use (optional)
              </label>
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

            <p>
              (We'll accept multiple answers here, because maybe you want to use
              it multiple ways.)
            </p>

            <br />

            <div className="checkbox-block">
              <label className="checkbox">
                <input type="checkbox" />
                &nbsp;This is for private use for just me
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForPrivateUse}
                  onChange={handleIsForPrivateUseChange}
                />
                &nbsp;This is for private use amongst a group of people
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isForPublicUse}
                  onChange={handleIsForPublicUseChange}
                />
                &nbsp;This is for public use
              </label>
            </div>

            <br />

            <h1 className="title is-3">How's your audio quality?</h1>

            <p>
              It's okay if you don't have a quality source of audio, but the
              results are top notch only with a good recording setup.
            </p>

            <br />

            <div className="checkbox-block">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={hasGoodMicrophone}
                  onChange={handleHasGoodMicrophoneChange}
                />
                &nbsp;I have a good microphone (and I know what a condenser
                microphone is)
              </label>

              <br />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={hasCleanAudioRecordings}
                  onChange={handleHasCleanAudioRecordingsChange}
                />
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
              <label className="label">
                Do you have any important notes or details?
              </label>
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

            {errorMessage}

            <button
              className="button is-link is-large is-fullwidth"
              onClick={handleSubmit}
            >
              Clone my voice!&nbsp;
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {header}

      <Fade bottom duration={duration} distance={distance} delay={delay2}>
        <div className="container-panel pt-4 pb-5">
          <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
            <h1 className="panel-title fw-bold">Clone Your Voice</h1>
            <div className="py-6">
              {previouslySubmittedNote}
              <div className="d-flex flex-column gap-4">
                <p>
                  We have an extremely talented staff that will personally
                  handle your voice clone request. Please help us understand
                  more about your voice and how you want to use it, and we'll be
                  in touch shortly.
                </p>

                <h2>First, how should we get in touch?</h2>

                <div>
                  <label className="sub-title">Email Address</label>
                  <div className="form-group input-icon">
                    <span className="form-control-feedback">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Email Address"
                      value={emailAddress}
                      onChange={handleEmailAddressChange}
                    />
                  </div>
                  <p className="form-text"></p>
                  <p className="form-text red"></p>
                </div>

                <div>
                  <label className="sub-title">
                    Discord Username (Optional, but an alternate way to reach
                    you.)
                    <br />
                  </label>
                  <div className="form-group input-icon">
                    <span className="form-control-feedback">
                      <FontAwesomeIcon icon={faDiscord} />
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Discord"
                      value={discord}
                      onChange={handleDiscordChange}
                    />
                  </div>
                  <p className="form-text">
                    Don't forget the <em>#0000</em> part of your username!
                  </p>
                  <p className="form-text red"></p>
                </div>

                <div>
                  <h2 className="my-3">Who's voice is this?</h2>
                  <p>
                    If it's your voice, you'll be able to do anything you want
                    with it. If it's another person's voice, you may have limits
                    on how you can use it (eg. limits on commercialization.)
                    That doesn't mean we can't help you. Even if you just want
                    your favorite character so you can make Twitter memes,
                    that's fine!
                  </p>
                </div>

                <div className="form-check d-flex flex-column gap-2">
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="subject"
                      value="mine"
                      onChange={handleSubjectChange}
                    />
                    &nbsp;My own voice
                  </label>
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="subject"
                      value="family"
                      onChange={handleSubjectChange}
                    />
                    &nbsp;A family member's voice
                  </label>
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="subject"
                      value="client"
                      onChange={handleSubjectChange}
                    />
                    &nbsp;A client's voice
                  </label>
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="subject"
                      value="3rd"
                      onChange={handleSubjectChange}
                    />
                    &nbsp;Another person's voice
                  </label>
                </div>

                <div>
                  <label className="sub-title">
                    If it isn't your voice, tell us about who it is!
                  </label>
                  <div className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Notes on the person"
                      value={notesOnSubject}
                      onChange={handleSubjectNotesChange}
                    />
                  </div>
                  <p className="form-text"></p>
                  <p className="form-text red"></p>
                </div>

                <div>
                  <h2 className="my-3">How will you use it?</h2>
                  <p>Click as many as you plan to use!</p>
                </div>

                <div className="form-check d-flex flex-column gap-2">
                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForMusic}
                      onChange={handleIsForMusicChange}
                    />
                    &nbsp;For Music (for creating new songs)
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForGames}
                      onChange={handleIsForGamesChange}
                    />
                    &nbsp;For Games (because NPCs won't talk by themselves)
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForTwitchTts}
                      onChange={handleIsForTwitchTtsChange}
                    />
                    &nbsp;For Twitch TTS (creating rewards for my stream,
                    helping me engage and monetize)
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForApiUse}
                      onChange={handleIsForApiUseChange}
                    />
                    &nbsp;For API use (unlimited use of the FakeYou.com API for
                    anything you want to build)
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForOther}
                      onChange={handleIsForOtherChange}
                    />
                    &nbsp;Other (Now we're curious!)
                  </label>
                </div>
                <div>
                  <label className="sub-title">
                    Let us know more about your use (optional)
                  </label>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optional details"
                      value={optionalNotesOnUse}
                      onChange={handleOptionalNotesOnUseChange}
                    />
                  </div>
                  <p className="form-text"></p>
                  <p className="form-text red"></p>
                </div>

                <div>
                  <h2 className="my-3">Do you want it to be private?</h2>
                  <p>
                    (We'll accept multiple answers here, because maybe you want
                    to use it multiple ways.)
                  </p>
                </div>

                <div className="form-check d-flex flex-column gap-2">
                  <label className="form-check-label">
                    <input type="checkbox" className="form-check-input" />
                    &nbsp;This is for private use for just me
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForPrivateUse}
                      onChange={handleIsForPrivateUseChange}
                    />
                    &nbsp;This is for private use amongst a group of people
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isForPublicUse}
                      onChange={handleIsForPublicUseChange}
                    />
                    &nbsp;This is for public use
                  </label>
                </div>

                <div>
                  <h2 className="my-3">How's your audio quality?</h2>
                  <p>
                    It's okay if you don't have a quality source of audio, but
                    the results are top notch only with a good recording setup.
                  </p>
                </div>

                <div className="form-check d-flex flex-column gap-2">
                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={hasGoodMicrophone}
                      onChange={handleHasGoodMicrophoneChange}
                    />
                    &nbsp;I have a good microphone (and I know what a condenser
                    microphone is)
                  </label>

                  <label className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={hasCleanAudioRecordings}
                      onChange={handleHasCleanAudioRecordingsChange}
                    />
                    &nbsp;I have really good preexisting recordings.
                  </label>
                </div>

                <h2 className="mt-3">Anything else?</h2>

                <div>
                  <label className="sub-title">
                    Do you have any questions for us?
                  </label>
                  <div className="form-group">
                    <textarea
                      rows={4}
                      className="form-control"
                      placeholder="Optional Questions"
                      onChange={handleOptionalQuestionsChange}
                      value={optionalQuestions}
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="sub-title">
                    Do you have any important notes or details?
                  </label>
                  <div className="form-group">
                    <textarea
                      rows={4}
                      className="form-control"
                      placeholder="Optional Notes"
                      onChange={handleOptionalExtraCommentsChange}
                      value={optionalExtraComments}
                    ></textarea>
                  </div>
                </div>

                {errorMessage}

                <button
                  className="btn btn-primary btn-lg w-100 mt-2"
                  onClick={handleSubmit}
                >
                  Clone my voice!&nbsp;
                  <FontAwesomeIcon icon={faMicrophone} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export { VoiceCloneRequestPage };
