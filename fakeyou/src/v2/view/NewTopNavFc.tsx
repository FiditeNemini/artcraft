import React from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { Link } from 'react-router-dom';

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

  return (
    <>
    <nav className="navbar is-transparent">
  <div className="navbar-brand">
    <Link className="navbar-item" to="/">
      <img src="https://bulma.io/images/bulma-logo.png" alt="FakeYou: Cartoon and Celebrity Text to Speech" width="112" height="28" />
    </Link>
    <div className="navbar-burger" data-target="navbarExampleTransparentExample">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>

  <div id="navbarExampleTransparentExample" className="navbar-menu">
    <div className="navbar-start">
      <a className="navbar-item" href="https://bulma.io/">
        Home
      </a>
      <div className="navbar-item has-dropdown is-hoverable">
        <a className="navbar-link" href="https://bulma.io/documentation/overview/start/">
          Docs
        </a>
        <div className="navbar-dropdown is-boxed">
          <a className="navbar-item" href="https://bulma.io/documentation/overview/start/">
            Overview
          </a>
          <a className="navbar-item" href="https://bulma.io/documentation/overview/modifiers/">
            Modifiers
          </a>
          <a className="navbar-item" href="https://bulma.io/documentation/columns/basics/">
            Columns
          </a>
          <a className="navbar-item" href="https://bulma.io/documentation/layout/container/">
            Layout
          </a>
          <a className="navbar-item" href="https://bulma.io/documentation/form/general/">
            Form
          </a>
          <hr className="navbar-divider" />
          <a className="navbar-item" href="https://bulma.io/documentation/elements/box/">
            Elements
          </a>
          <a className="navbar-item is-active" href="https://bulma.io/documentation/components/breadcrumb/">
            Components
          </a>
        </div>
      </div>
    </div>

    <div className="navbar-end">
      <div className="navbar-item">
        <div className="field is-grouped">
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
          <p className="control">
            <a className="button is-primary" href="https://github.com/jgthms/bulma/releases/download/0.9.3/bulma-0.9.3.zip">
              <span className="icon">
                <i className="fas fa-download"></i>
              </span>
              <span>Download</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</nav>
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
    </>
  )
}

export { NewTopNavFc };
