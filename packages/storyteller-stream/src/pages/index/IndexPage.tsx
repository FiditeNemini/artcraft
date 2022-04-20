import React from 'react';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { LoggedInIndex } from './subpages/LoggedInIndex';
import { LoggedOutIndex } from './subpages/LoggedOutIndex';

interface Props {
  sessionWrapper: SessionWrapper,
}

function IndexPage(props: Props) {

  let indexComponent = <></>;

  if (props.sessionWrapper.isLoggedIn()) {
    indexComponent  = <LoggedInIndex />
  } else {
    indexComponent = <LoggedOutIndex />
  }

  return (
    <div>

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose6_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title is-1">
                Storyteller TTS for Twitch
              </p>
              <p className="subtitle is-3">
                Supercharge your Stream
              </p>

              <p>
                Storyteller is a new platform built by the creators of the&nbsp; 
                <FakeYouExternalLink>FakeYou deep fake website</FakeYouExternalLink>. We're
                building virtual and deepfake production tools for your home studio. 
              </p>
            </div>

          </div>
        </div>
      </section>

      {indexComponent}

    </div>
  )
}

export { IndexPage }