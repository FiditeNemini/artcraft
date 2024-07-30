import { StaticImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import React, { ReactNode } from "react";
import SocialIcons from "./SocialIcons";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <nav className="bg-panel">
        <div className="mx-auto flex max-w-screen-xl items-center px-4 py-3.5">
          <div className="grow">
            <Link to="/">
              <StaticImage
                alt="Logo"
                src="../images/Storyteller-Logo.png"
                height={36}
              />
            </Link>
          </div>
          <SocialIcons />
        </div>
      </nav>
      <div className="mx-auto my-4 w-full max-w-screen-xl grow px-4 md:my-8">
        {children}
      </div>
      <footer className="bg-panel">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/80 lg:flex-row lg:py-3">
            <span>© 2024 All Rights Reserved, Storyteller.ai</span>
            <SocialIcons />
          </div>
        </div>
      </footer>
    </div>
  );
}
