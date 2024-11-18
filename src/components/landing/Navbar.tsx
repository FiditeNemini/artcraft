import { Button } from "../ui";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <img
              src="/brand/Storyteller-Logo-Black.png"
              alt="Storyteller Board"
              className="h-9"
            />
          </div>
          <div className="flex items-center space-x-5">
            <a
              href="/login"
              className="font-medium !text-gray-600 hover:!text-gray-900"
            >
              Login
            </a>
            <Button className="btn btn-primary">Sign Up</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
