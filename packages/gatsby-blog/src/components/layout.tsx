import { StaticImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import React, { ReactNode } from "react";
import SocialIcons from "./SocialIcons";

export default function Layout({ children }: { children: ReactNode }) {

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <nav className="bg-panel">
        <div className="mx-auto max-w-screen-xl py-3.5 px-4 flex items-center">
          <div className="grow">
            <Link to="/">
               <StaticImage alt="Logo" src="../images/Storyteller-Logo.png" height={36} />
            </Link>
          </div>
          <SocialIcons />
        </div>
      </nav>
      <div className="grow mx-auto max-w-screen-xl px-4 my-4 md:my-8 w-full">
        {children}
      </div>
      <footer className="bg-panel">
        <div className="text-white/80 text-sm mx-auto max-w-screen-xl py-3 px-4 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-3">
        © 2024 All Rights Reserved, Storyteller.ai
        <SocialIcons />
        </div>
      </footer>
    </div>
    
  );
}