import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function TopNav() {

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
            <img src="/storyteller-nav-logo-mascot-pink.png" alt="Storyteller: Stream tech" />
          </Link>
          <div className={navbarBurgerClasses} data-target="navbarExampleTransparentExample" onClick={() => toggleHamburger()}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div id="navbarExampleTransparentExample" className={navbarClasses}>
          <div className="navbar-start">

            <Link to="/stream"
              className="navbar-item"
              onClick={() => closeHamburger()}
              >Stream TTS</Link>

            <Link to="/coming-soon"
              className="navbar-item"
              onClick={() => closeHamburger()}
              >Coming Soon</Link>

            {/* 
            <div className="navbar-item has-dropdown is-hoverable">
              <Link to="/"
                className="navbar-link"
                onClick={() => closeHamburger()}
                >Community</Link>

              <div className="navbar-dropdown is-boxed">
                {/* NB: There's an "is-active" class that looks nice. * /}

                <Link to="/contribute"
                  className="navbar-item"
                  onClick={() => closeHamburger()}
                  ><FontAwesomeIcon icon={faUpload} />&nbsp;&nbsp;Contribute / Upload</Link>

              </div>
            </div>
            */}
          </div>

          {/*<div className="navbar-end">
            <div className="navbar-item">
              <div className="field is-grouped">
                <p className="control">
                  TODO
                </p>
              </div>
            </div>
          </div>*/}
        </div>
      </nav>
    </>
  )


}

export { TopNav }