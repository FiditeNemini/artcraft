import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faHome,
  faVideo,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";

function DashboardPage(props: Props) {
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
    <div className="parent">
      <h1 className="word mb-4">
        <span className="word">Dashboard</span>
      </h1>
      <button className="btn btn-primary w-100">
        Link your Twitch account
      </button>
    </div>
  );
}

export { DashboardPage };
