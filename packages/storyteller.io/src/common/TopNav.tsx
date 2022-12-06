import { useLocomotiveScroll } from "react-locomotive-scroll";
import React, { useState, useEffect } from "react";

interface Props {}

function TopNav(props: Props) {
  const { scroll } = useLocomotiveScroll();
  const [isScrolling, setIsScrolling] = useState(false);
  const [showTopBtn, setTopBtn] = useState(false);

  if (!!scroll) {
    scroll.on(
      "scroll",
      (position: { scroll: { y: number } }, direction: string) => {
        if (position.scroll.y > 50) {
          // console.log(">> scroll > 50");
          if (!isScrolling) {
            setIsScrolling(true);
          }
        } else {
          // console.log(">> scroll < 50 ");
          if (isScrolling) {
            setIsScrolling(false);
          }
        }

        if (position.scroll.y > 400) {
          // console.log(">> scroll > 50");
          if (!showTopBtn) {
            setTopBtn(true);
          }
        } else {
          // console.log(">> scroll < 50 ");
          if (showTopBtn) {
            setTopBtn(false);
          }
        }
      }
    );
  }

  const navClassNames = isScrolling
    ? "container-fluid nav-scroll"
    : "container-fluid";

  const backToTop = showTopBtn
    ? "btn-to-top nav-link show"
    : "btn-to-top nav-link";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const hamburgerClassNames = mobileMenuOpen
    ? "button_container active"
    : "button_container";
  const menuClassNames = mobileMenuOpen ? "overlay open" : "overlay";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("lock-scroll");
    } else {
      document.body.classList.remove("lock-scroll");
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <nav id="navbar" className={navClassNames} data-scroll-section>
        <div className="d-none d-lg-flex flex-wrap align-items-center justify-content-center justify-content-md-between mt-3 topnav">
          <a
            href="/"
            className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none"
          >
            <img
              id="logo"
              src="/logo/Storyteller-Logo.png"
              alt="Storyteller Logo"
              height="36"
              className="mb-2"
            />
          </a>

          <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
            <li>
              <a href="#root" className="nav-link active" data-scroll-to>
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link" data-scroll-to>
                About
              </a>
            </li>
            <li>
              <a href="#products" className="nav-link" data-scroll-to>
                What We Do
              </a>
            </li>
            <li>
              <a href="#mentions" className="nav-link" data-scroll-to>
                Mentions
              </a>
            </li>
          </ul>

          <div className="col-md-3 text-end">
            <a href="#contact" className="btn btn-primary fs-6" data-scroll-to>
              Contact
            </a>
          </div>
        </div>

        <div className="d-flex d-lg-none justify-content-between pt-2">
          <a
            href="/"
            className="d-flex align-items-center text-dark text-decoration-none"
          >
            <img
              id="logo"
              src="/logo/Storyteller-Logo.png"
              alt="Storyteller Logo"
              height="36"
              className="mb-2"
            />
          </a>
          <button
            onClick={menuToggle}
            className={hamburgerClassNames}
            id="toggle"
            aria-controls="primary-menu"
            aria-expanded="false"
          >
            <span className="top"></span>
            <span className="middle"></span>
            <span className="bottom"></span>
          </button>
        </div>
      </nav>
      <div className={menuClassNames}>
        <div className="overlay-menu">
          <ul>
            <li className="nav-link active">
              <a onClick={menuToggle} href="#root" data-scroll-to>
                Home
              </a>
            </li>
            <li>
              <a onClick={menuToggle} href="#about" data-scroll-to>
                About
              </a>
            </li>
            <li>
              <a onClick={menuToggle} href="#products" data-scroll-to>
                What We Do
              </a>
            </li>
            <li>
              <a onClick={menuToggle} href="#mentions" data-scroll-to>
                Mentions
              </a>
            </li>
            <li className="mt-4">
              <a
                onClick={menuToggle}
                href="#contact"
                data-scroll-to
                className="btn btn-primary"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <a href="#home" className={backToTop} data-scroll-to>
        <div className="btt-shape"></div>
        Back to Top
      </a>
    </>
  );
}

export { TopNav };
