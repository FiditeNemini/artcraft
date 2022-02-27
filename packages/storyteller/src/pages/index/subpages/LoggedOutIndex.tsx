import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

function LoggedOutIndex() {
  return (
    <div>
      <section className="section">
        <div className="container">

          <h1 className="title is-4"> <FontAwesomeIcon icon={faRocket} /> You'll need an account to continue&hellip;</h1>
          <Link
            to="/signup"
            className="button is-large is-info is-fullwidth"
            >
              Sign Up&nbsp;<FontAwesomeIcon icon={faSignInAlt} />
          </Link>

          <br />

          <Link
            to="/login"
            className="button is-large is-info is-outlined is-fullwidth"
            >
              Log In&nbsp;<FontAwesomeIcon icon={faSignInAlt} />
          </Link>

          <br />

        </div>
      </section>
    </div>
  )
}

export { LoggedOutIndex }