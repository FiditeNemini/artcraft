import React from 'react';
import { BackLink } from '../_common/BackLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { PATRONS } from '../../../data/Patrons';
import { PatreonLink } from '../_common/PatreonLink';

interface Props {
  sessionWrapper: SessionWrapper,
}

function PatronPage(props: Props) {
  return (
    <div>
      <h1 className="title is-1"> Thanks to our Patrons! </h1>

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
  )
}

export { PatronPage }