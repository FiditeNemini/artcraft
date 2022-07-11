import React from 'react';
import { BackLink } from '../_common/BackLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { PATRONS } from '../../../data/Patrons';
import { PatreonLink } from '@storyteller/components/src/elements/PatreonLink';

interface Props {
  sessionWrapper: SessionWrapper,
}
<script src="https://fonts.googleapis.com"></script>

function PatronPage(props: Props) {
  return (
    <>
     
      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose7_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <h1 className="display-5 fw-bold">
                Thanks to our Patrons!
              </h1>
              <p className="subtitle">
                Our Patrons help support our work.
              </p>
            </div>

          </div>

        </div>
      </section>

      <div>
        <div className="content">
          <p>Our Patrons help pay offset (but not completely cover) our expensive server bills.</p>

          <ul>
            {PATRONS.map(patron => {
              return (<li>{patron.username} &mdash; ${patron.donationTotal}</li>);
            })}
          </ul>

          <p>Patrons will get first looks at new features, get dedicated access to Patron-only 
            Discord channels, can ask for specific voices from our in-house audio engineers,
            and more!</p>

          <p>Please consider <PatreonLink text="donating on Patreon" iconAfterText={true} />.</p>

          <BackLink link={FrontendUrlConfig.indexPage()} text='Back to main' />
        </div>
        </div>
    
      
      
    </>
  )
}

export { PatronPage }