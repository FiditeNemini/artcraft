// import {useState} from 'react';

import type { MetaFunction,
  //  LinksFunction 
  } from "@remix-run/deno";
// import sonic from "./assets/sonic-the-hedgehog-classic-sonic.gif";
// import basecss from "./assets/base.css";
import PageCube from "../pages/PageCube";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
// export const links: LinksFunction = () => {
//   return [
//     {
//       rel: "stylesheet",
//       href: "https://rsms.me/inter/inter.css",
//     },
//     {
//       rel: "stylesheet",
//       href: basecss,
//     },
//   ];
// };
export default function Index() {


  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      {/* <img
        alt="sonic"
        src={sonic}
        style={{
          width: "100%"
        }}
      /> */}
      <PageCube/>
      
      {/* <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul> */}
    </div>
  );
}
