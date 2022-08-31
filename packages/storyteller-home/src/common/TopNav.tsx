import { Link } from "react-router-dom";
import { useLocomotiveScroll } from "react-locomotive-scroll";
import React, { useState } from "react";

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
            setTopBtn(false);
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

  return (
    <>
      <nav id="navbar" className={navClassNames}>
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 topnav px-3">
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
              <a href="#works" className="nav-link" data-scroll-to>
                What We Do
              </a>
            </li>
          </ul>

          <div className="col-md-3 text-end">
            <a
              className="btn btn-primary small fs-6"
              href="#about"
              data-scroll-to
            >
              Contact
            </a>
          </div>
        </div>
      </nav>
      <a href="#home" className={backToTop} data-scroll-to>
        <div className="btt-shape"></div>
        Back to Top
      </a>
    </>
  );
}

export { TopNav };
