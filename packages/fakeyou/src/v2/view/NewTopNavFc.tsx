import React, { useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Link } from 'react-router-dom';
import { MigrationTopNavSession } from '../../migration/MigrationTopNav_Session';
import { FrontendUrlConfig } from '../../common/FrontendUrlConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faGrinBeamSweat, faList, faTrophy, faUpload, faUser } from '@fortawesome/free-solid-svg-icons';
import { faPatreon } from '@fortawesome/free-brands-svg-icons';
import { t } from 'i18next';

interface Props {
  sessionWrapper: SessionWrapper,
  logoutHandler: () => void,
  querySessionCallback : () => void,
}

function NewTopNavFc(props: Props) {
  let myDataLink = '/signup';

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername();
    myDataLink = `/profile/${username}`;
  }

  const [mobileHamburgerIsActive, setMobileHamburgerIsActive] = useState<boolean>(false);

  const toggleHamburger = () => { 
    setMobileHamburgerIsActive(!mobileHamburgerIsActive);
  }

  const closeHamburger = () => { 
    // TODO: This is an ergonomic hack. 
    // The hamburger ideally should close whenever it is no longer active.
    setMobileHamburgerIsActive(false);
  }

  const navbarClasses = mobileHamburgerIsActive ? "navbar-menu is-active" : "navbar-menu";
  const navbarBurgerClasses = mobileHamburgerIsActive ? "navbar-burger is-active" : "navbar-burger";

  return (
    <>
      <nav className="navbar is-transparent padding-bottom-1em">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <img src="/fakeyou/fakeyou-nav-logo-mascot.webp" alt="FakeYou: Cartoon and Celebrity Text to Speech" />
          </Link>
          <div className={navbarBurgerClasses} data-target="navbarExampleTransparentExample" onClick={() => toggleHamburger()}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div id="navbarExampleTransparentExample" className={navbarClasses}>
          <div className="navbar-start">

            <Link to="/"
              className="navbar-item"
              onClick={() => closeHamburger()}
              >TTS</Link>

            <Link to="/video"
              className="navbar-item"
              onClick={() => closeHamburger()}
              >{t('coreUi.topNav.video')}</Link>

            <div className="navbar-item has-dropdown is-hoverable">
              <Link to={myDataLink}
                className="navbar-link"
                onClick={() => closeHamburger()}
                >{t('coreUi.topNav.community')}</Link>

              <div className="navbar-dropdown is-boxed">
                {/* NB: There's an "is-active" class that looks nice. */}

                <Link to="/contribute"
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faUpload} />&nbsp;&nbsp;{t('coreUi.topNav.contributeUpload')}</Link>

                <Link to="/leaderboard"
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faTrophy} />&nbsp;&nbsp;{t('coreUi.topNav.leaderboard')}</Link>

                <Link to={FrontendUrlConfig.patronsPage()}
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faPatreon}/>&nbsp;&nbsp;{t('coreUi.topNav.patrons')}</Link>

                <Link to="/firehose"
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faList} />&nbsp;&nbsp;{t('coreUi.topNav.feed')}</Link>

                <hr className="navbar-divider" />

                <Link to={myDataLink}
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faUser} />&nbsp;&nbsp;{t('coreUi.topNav.myData')}</Link>

                <hr className="navbar-divider" />

                <Link to={FrontendUrlConfig.aboutUsPage()}
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faGrinBeamSweat} />&nbsp;&nbsp;{t('coreUi.topNav.aboutUs')}</Link>

                <Link to={FrontendUrlConfig.termsPage()}
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faGavel} />&nbsp;&nbsp;{t('coreUi.topNav.terms')}</Link>

              </div>
            </div>

            <a href={FrontendUrlConfig.developerDocs()}
              className="navbar-item"
              onClick={() => closeHamburger()}
              >{t('coreUi.topNav.developers')}</a>

          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="field is-grouped">
                <p className="control">
                  <MigrationTopNavSession
                    sessionWrapper={props.sessionWrapper}
                    enableAlpha={true}
                    querySessionAction={props.querySessionCallback}
                    closeHamburgerAction={() => closeHamburger()}
                    />
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export { NewTopNavFc };
