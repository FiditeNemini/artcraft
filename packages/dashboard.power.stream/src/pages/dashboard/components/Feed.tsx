import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo, faVolumeUp } from "@fortawesome/free-solid-svg-icons";

function Feed() {
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
    <div className="panel p-4 d-flex flex-column gap-3">
      <div className="d-flex">
        <h4 className="flex-grow-1 fw-bold">Queued TTS</h4>
        <div>icons</div>
      </div>
      <div>
        <div className="panel inner p-2 d-flex gap-4 align-items-center">
          <FontAwesomeIcon icon={faVolumeUp} className="ms-2 fs-4" />
          <div className="flex-grow-1">
            <p className="fw-semibold text-white fs-7">BFlatastic sent a TTS</p>
            <p className="fs-7">Hello, this is a test message.</p>
          </div>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faUndo} />
          </button>
        </div>
      </div>
      <div>
        <div className="panel inner p-2 d-flex gap-4 align-items-center">
          <FontAwesomeIcon icon={faVolumeUp} className="ms-2 fs-4" />
          <div className="flex-grow-1">
            <p className="fw-semibold text-white fs-7">BFlatastic sent a TTS</p>
            <p className="fs-7">Hello, this is a test message.</p>
          </div>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faUndo} />
          </button>
        </div>
      </div>
      <div>
        <div className="panel inner p-2 d-flex gap-4 align-items-center">
          <FontAwesomeIcon icon={faVolumeUp} className="ms-2 fs-4" />
          <div className="flex-grow-1">
            <p className="fw-semibold text-white fs-7">BFlatastic sent a TTS</p>
            <p className="fs-7">Hello, this is a test message.</p>
          </div>
          <button className="btn btn-primary btn-small">
            <FontAwesomeIcon icon={faUndo} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { Feed };
