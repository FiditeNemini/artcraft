import React, { useState } from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { Link } from 'react-router-dom';
import { MigrationTopNavSession } from '../../migration/MigrationTopNav_Session';
import { FrontendUrlConfig } from '../../common/FrontendUrlConfig';

interface Props {
  sessionWrapper: SessionWrapper,
  logoutHandler: () => void,
  querySessionCallback : () => void,
}

function NewTopNavFc(props: Props) {
  let myDataLink = '/signup';

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername();
    //myDataLink = `/profile/${username}/data`;
    myDataLink = `/profile/${username}`;
  }

  const [mobileHamburgerIsActive, setMobileHamburgerIsActive] = useState<boolean>(false);

  const toggleHamburger = () => { 
    setMobileHamburgerIsActive(!mobileHamburgerIsActive);
  }

  const navbarClasses = mobileHamburgerIsActive ? "navbar-menu is-active" : "navbar-menu";
  const navbarBurgerClasses = mobileHamburgerIsActive ? "navbar-burger is-active" : "navbar-burger";

  return (
    <>
    <nav className="navbar is-transparent padding-bottom-1em">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <img src="/fakeyou/fakeyou-nav-logo.png" alt="FakeYou: Cartoon and Celebrity Text to Speech" />
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
            >TTS</Link>

          <Link to="/video"
            className="navbar-item"
            >Video</Link>

          <div className="navbar-item has-dropdown is-hoverable">
            <Link to={myDataLink}
              className="navbar-link"
              >Community</Link>

            <div className="navbar-dropdown is-boxed">

              <Link to="/contribute"
                className="navbar-item"
                >Contribute</Link>

              <Link to="/firehose"
                className="navbar-item"
                >Feed</Link>

              <Link to={FrontendUrlConfig.patronsPage()}
                className="navbar-item"
                >Patrons</Link>

              <Link to="/leaderboard"
                className="navbar-item"
                >Leaderboard</Link>


              <hr className="navbar-divider" />

              <Link to={myDataLink}
                className="navbar-item is-active"
                >My Data</Link>


            </div>
          </div>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="field is-grouped">
              <p className="control">
                <MigrationTopNavSession
                  sessionWrapper={props.sessionWrapper}
                  enableAlpha={true}
                  querySessionAction={props.querySessionCallback}
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
