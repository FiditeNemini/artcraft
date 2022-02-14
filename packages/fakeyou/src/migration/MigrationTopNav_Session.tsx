import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Logout } from '@storyteller/components/src/api/session/Logout';
import { Link, useHistory } from 'react-router-dom';
import { t } from 'i18next';
import { GravatarFc } from '../v2/view/_common/GravatarFc';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  querySessionAction: () => void,
  closeHamburgerAction: () => void,
}

function MigrationTopNavSession(props: Props) {
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
    gravatar = <GravatarFc email_hash={gravatarHash} size={15} />
  }

  let sessionLink = <span />;
  let logoutLink = <span />;

  if (loggedIn) {
    let url = `/profile/${displayName}`;
    sessionLink = (
      <Link
        to={url}
        onClick={() => props.closeHamburgerAction()}
        className="button is-alert is-inverted is-pulled-right"
        > {gravatar}&nbsp; {displayName}</Link>
    );
    logoutLink = <button
        className="button is-alert is-inverted is-pulled-right"
        onClick={async () => {
          await logoutHandler();
          props.closeHamburgerAction();
        }}
      >{t('coreUi.topNav.logout')}</button>;
  } else {
    sessionLink = (
      <Link
        to="/signup"
        className="button is-danger is-pulled-right"
        onClick={() => props.closeHamburgerAction()}
        >{t('coreUi.topNav.signUpLogin')}</Link>
    );
  }

  return (
    <span>
      {logoutLink}
      {sessionLink}
    </span>
  );
}

export { MigrationTopNavSession };
