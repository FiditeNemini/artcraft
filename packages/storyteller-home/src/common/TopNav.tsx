import { Link } from "react-router-dom";
import { useLocomotiveScroll } from "react-locomotive-scroll";

interface Props {}

function TopNav(props: Props) {
  const { scroll } = useLocomotiveScroll();
  const navBar = document.querySelector("nav");

  scroll.on("scroll", (position: { scroll: { y: number } }) => {
    if (position.scroll.y > 50) {
      navBar!.classList.add("nav-scroll");
    } else {
      navBar!.classList.remove("nav-scroll");
    }
  });

  return (
    <>
      <nav id="navbar" className="container-fluid">
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
        </div>
      </nav>
    </>
  );
}

export { TopNav };
