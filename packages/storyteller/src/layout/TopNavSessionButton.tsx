import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Logout } from '@storyteller/components/src/api/session/Logout';
import { t } from 'i18next';
import { Gravatar } from '@storyteller/components/src/elements/Gravatar';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  querySessionAction: () => void,
  closeHamburgerAction: () => void,
}

function TopNavSessionButton(props: Props) {
  let history = useHistory();

  if (!props.enableAlpha) {
    return <nav />
  }

  const logoutHandler = async () => {
    await Logout();
    props.querySessionAction();
    history.push('/');
  }

  let loggedIn = props.sessionWrapper.isLoggedIn();
  let displayName = props.sessionWrapper.getDisplayName();
  let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
  let gravatar = <span />;

  if (displayName === undefined) {
    displayName = 'My Account';
  }

  if (gravatarHash !== undefined) {
    gravatar = <Gravatar email_hash={gravatarHash} size={15} />
  }

  let sessionLink = <span />;
  let logoutLink = <span />;

  if (loggedIn) {
    let url = `https://fakeyou.com/profile/${displayName}`;
    sessionLink = (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={() => props.closeHamburgerAction()}
        className="button is-alert is-inverted is-pulled-right"
        > {gravatar}&nbsp; {displayName}</a>
    );
    logoutLink = <button
        className="button is-alert is-inverted is-pulled-right"
        onClick={async () => {
          await logoutHandler();
          props.closeHamburgerAction();
        }}
      >{t('common.logout')}</button>;
  } else {
    sessionLink = (
      <Link
        to="/signup"
        className="button is-danger is-pulled-right"
        onClick={() => props.closeHamburgerAction()}
        >{t('common.signUpLogin')}</Link>
    );
  }

  return (
    <span>
      {logoutLink}
      {sessionLink}
    </span>
  );
}

export { TopNavSessionButton };
