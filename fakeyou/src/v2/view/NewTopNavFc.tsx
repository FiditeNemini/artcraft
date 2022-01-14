import React, { useState } from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { Link } from 'react-router-dom';
import { MigrationTopNavSession } from '../../migration/MigrationTopNav_Session';

interface Props {
  sessionWrapper: SessionWrapper,
  logoutHandler: () => void,
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
          <img src="/fakeyou/fakeyou-nav-logo-8.png" alt="FakeYou: Cartoon and Celebrity Text to Speech" />
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
              {/*
              <p className="control">
                <a className="bd-tw-button button" data-social-network="Twitter" data-social-action="tweet" data-social-target="https://bulma.io" target="_blank" href="https://twitter.com/intent/tweet?text=Bulma: a modern CSS framework based on Flexbox&amp;hashtags=bulmaio&amp;url=https://bulma.io&amp;via=jgthms">
                  <span className="icon">
                    <i className="fab fa-twitter"></i>
                  </span>
                  <span>
                    Tweet
                  </span>
                </a>
              </p>
              */}

              <p className="control">
                {/*
                <a className="button is-primary" href="https://github.com/jgthms/bulma/releases/download/0.9.3/bulma-0.9.3.zip">
                  <span className="icon">
                    <i className="fas fa-download"></i>
                  </span>
                  <span>Download</span>
                </a>
                */}

                <MigrationTopNavSession
                  sessionWrapper={props.sessionWrapper}
                  enableAlpha={true}
                  querySessionAction={() => { /* TODO */}}
                  />
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/*
    <nav>
      <div className="columns">
        <div className="column">
          <Link to="/"
            className="button is-link is-medium is-inverted"
            >TTS</Link>
        </div>
        <div className="column">
          <Link to="/video"
            className="button is-link is-medium is-inverted"
            >Video</Link>
        </div>
        <div className="column">
          <Link to="/contribute"
            className="button is-link is-medium is-inverted"
            >Contribute</Link>
        </div>
        <div className="column">
          <Link to={myDataLink}
            className="button is-link is-medium is-inverted"
            >My Data</Link>
        </div>
        <div className="column">
          <Link to="/firehose"
            className="button is-link is-medium is-inverted"
            >Feed</Link>
        </div>
        <div className="column">
          <Link to="/leaderboard"
            className="button is-link is-medium is-inverted"
            >Leaderboard</Link>
        </div>
      </div>
      <hr />


    </nav>
    */}
    </>
  )
}

export { NewTopNavFc };
