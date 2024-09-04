import { twMerge } from "tailwind-merge";

import { ProfileDropdown } from "./ProfileDropdown";

import { paperWrapperStyles } from "~/components/styles";

export const ToolbarUserProfile = () => {
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        "mr-4 mt-2 flex w-fit items-center gap-4 px-4",
      )}
    >
      <div className="w-40">
        <img src="/brand/Storyteller-Logo.png" alt="Storyteller Logo" />
      </div>
      <ProfileDropdown />
    </div>
  );
};
