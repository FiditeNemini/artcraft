import { Link } from "react-router-dom";

function MustBeLoggedInView() {
  return (
    <div className="pt-5 container pb-2 text-center">
      <img
        src="/assets/hero-kitsune.png"
        className="img-fluid mt-4"
        width="380"
        alt="Kitsune Mascot"
      />
      <h1 className="mt-5 mb-5 fw-bold">You must to be logged in to view.</h1>
      <div className="d-flex gap-3 justify-content-center">
        <Link to="/signup" className="btn btn-primary mb-5">
          Sign Up
        </Link>
        <Link to="/login" className="btn btn-secondary mb-5">
          Login
        </Link>
      </div>
    </div>
  );
}

export { MustBeLoggedInView };
