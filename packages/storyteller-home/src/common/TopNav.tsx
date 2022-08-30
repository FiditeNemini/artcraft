import { Link } from "react-router-dom";

interface Props {}

function TopNav(props: Props) {
  // const nav = document.querySelector("topnav");
  // const navHeight = 70;
  // // the point the scroll starts from (in px)
  // let lastScrollY = 0;
  // // how far to scroll (in px) before triggering
  // const delta = 10;

  // // function to run on scrolling
  // function scrolled() {
  //   let sy = window.scrollY;
  //   // only trigger if scrolled more than delta
  //   if (Math.abs(lastScrollY - sy) > delta) {
  //     // scroll down -> hide nav bar
  //     if (sy > lastScrollY && sy > navHeight) {
  //       nav.classList.add("nav-up");
  //     }
  //     // scroll up -> show nav bar
  //     else if (sy < lastScrollY) {
  //       nav.classList.remove("nav-up");
  //     }
  //     // update current scroll point
  //     lastScrollY = sy;
  //   }
  // }

  // // Add event listener & debounce so not constantly checking for scroll
  // let didScroll = false;
  // window.addEventListener("scroll", function (e) {
  //   didScroll = true;
  // });

  // setInterval(function () {
  //   if (didScroll) {
  //     scrolled();
  //     didScroll = false;
  //   }
  // }, 250);

  return (
    <nav id="navbar" className="container-fluid">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 topnav px-3">
        <a
          href="/"
          className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none"
        >
          <img
            src="/logo/Storyteller-Logo.png"
            alt="Storyteller Logo"
            height="36"
            className="mb-2"
          />
        </a>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li>
            <a href="/" className="nav-link active">
              Home
            </a>
          </li>
          <li>
            <a href="/" className="nav-link">
              About
            </a>
          </li>
          <li>
            <a href="/" className="nav-link">
              What We Do
            </a>
          </li>
        </ul>

        <div className="col-md-3 text-end">
          <button type="button" className="btn btn-primary">
            Contact
          </button>
        </div>
      </header>
    </nav>
  );
}

export { TopNav };
