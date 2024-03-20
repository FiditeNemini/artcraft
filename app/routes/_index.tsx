import type { MetaFunction } from "@remix-run/deno";
import sonic from "./_assets/sonic-the-hedgehog-classic-sonic.gif";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export default function Index() {
  return (
    <div className="size-full">
      <img
        alt="sonic"
        src={sonic}
        className="
          fixed
          h-screen w-screen
          top-0 left-0
          object-cover
          -z-10
        "
      />
    </div>
  );
}
