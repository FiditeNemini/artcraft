import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faHome,
  faVideo,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Sidebar() {
  // if (!props.sessionWrapper.isLoggedIn()) {
  //   return (
  //     <div className="container vh-100 d-flex align-items-center">
  //       <div className="w-100">
  //         <h1 className="text-center">Must Log In</h1>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="panel p-3">
      <div className="d-flex flex-column flex-shrink-0">
        <ul className="nav nav-pills flex-column gap-2">
          <li className="nav-item">
            <Link to="/" className="nav-link active d-flex" aria-current="page">
              <div className="icon">
                {/* <FontAwesomeIcon icon={faHome} /> */}
              </div>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/test" className="nav-link d-flex">
              <div className="icon">
                {/* <FontAwesomeIcon icon={faVolumeUp} /> */}
              </div>
              TTS Configs
            </Link>
          </li>
          <li>
            <a href="/" className="nav-link d-flex">
              <div className="icon">
                {/* <FontAwesomeIcon icon={faVideo} /> */}
              </div>
              OBS Setup
            </a>
          </li>
          <li>
            <a href="/" className="nav-link d-flex">
              <div className="icon">
                {/* <FontAwesomeIcon icon={faCog} /> */}
              </div>
              Settings
            </a>
          </li>
          <li>
            <a href="/" className="nav-link d-flex">
              <div className="icon">
                {/* <FontAwesomeIcon icon={faCog} /> */}
              </div>
              Support
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export { Sidebar };
