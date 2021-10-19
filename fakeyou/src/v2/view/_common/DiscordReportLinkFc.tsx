import React from 'react';
import { DiscordLink } from './DiscordLink';

interface Props {
}

function ReportDiscordLinkFc(props: Props) {
  return (
    <div className="content">
      <p>Report inappropriate content on <DiscordLink />.</p>
    </div>
  )
}

export { ReportDiscordLinkFc };
