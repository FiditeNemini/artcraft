import React from 'react';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { Link } from "react-router-dom";
import { DiscordLink } from '../_common/DiscordLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ContributeIndexPage(props: Props) {
  const categoryActionName = props.sessionWrapper.canEditCategories() ? "Create" : "Suggest";

  return (
    <div>
      <div>
        <h1 className="title is-1"> Contribute to FakeYou! </h1>
        <h1 className="subtitle is-3"> You make FakeYou <strong>better</strong> by contributing </h1>
      </div>

      <br />

      <div className="content is-medium">
        <p>
          You'll get credited for everything you contribute. You'll also get queue priority, 
          be eligible to win prizes, and help us become a Hollywood-killing deepfake 
          tooling, streaming, and filmmaking powerhouse.
        </p>

        <h3 className="title is-3"> Upload Models </h3>

        <p>Create new voices and video templates for FakeYou. <DiscordLink text="Join our Discord" iconAfterText={true} /> to learn how.</p>

        <Link
          to="/upload/tts"
          className="button is-link is-large is-fullwidth "
          >Upload voice (TTS model)</Link>

        <br />

        <Link
          to="/upload/w2l_video"
          className="button is-link is-large is-fullwidth "
          >Upload lipsync video (w2l)</Link>

        <br />

        <Link
          to="/upload/w2l_photo"
          className="button is-link is-large is-fullwidth"
          >Upload lipsync photo (w2l)</Link>

        <h3 className="title is-3"> {categoryActionName} Categories </h3>

        <p>Help us organize the models!</p>

        <Link
          to={FrontendUrlConfig.createCategoryPage()}
          className="button is-info is-large is-fullwidth"
          >{categoryActionName} category</Link>

        <h3 className="title is-3"> More </h3>

        <p> Want to contribute code, design, or data science? <DiscordLink text="Say hi in Discord" iconAfterText={true} />! </p>

      </div>
    </div>
  )
}

export { ContributeIndexPage };
