import type {
  MetaFunction,
  LinksFunction 
} from "@remix-run/deno";
import sonic from "./assets/sonic-the-hedgehog-classic-sonic.gif";
import basecss from "./assets/base.css";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://rsms.me/inter/inter.css",
    },
    {
      rel: "stylesheet",
      href: basecss,
    },
  ];
};

export default function Index() {
  return (
    <div>
      <img
        alt="sonic"
        src={sonic}
        style={{
          width: "100%"
        }}
      />
    </div>
  );
}
