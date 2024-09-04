import { twMerge } from "tailwind-merge";

import { ProfileDropdown } from "./ProfileDropdown";

import { paperWrapperStyles } from "~/components/styles";

export const ToolbarUserProfile = () => {
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        "mr-4 mt-2 flex w-fit items-center gap-2 pl-4 pr-2",
      )}
    >
      <div className="-mt-1.5 w-10">
        <img
          src="/android-chrome-192x192.png"
          alt="Storyteller Logo"
          className="w-full"
        />
      </div>
      <ProfileDropdown />
    </div>
  );
};
