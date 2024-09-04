import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faRightFromBracket,
  faUser,
} from "@fortawesome/pro-thin-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Gravatar } from "../../ui/Gravatar";

import { authentication } from "~/signals";

// style constants
import {
  paperWrapperStyles,
  transitionTimingStyles,
} from "~/components/styles";

export function ProfileDropdown() {
  useSignals();
  const {
    signals: { userInfo },
    fetchers: { logout },
  } = authentication;

  if (!userInfo.value) {
    return null;
  }
  const username = userInfo.value.core_info.username;
  const emailHash = userInfo.value.core_info.gravatar_hash;
  const profileUrl = `https://storyteller.ai/profile/${userInfo.value.core_info.display_name}`;
  const avatarIndex = userInfo.value.core_info.default_avatar.image_index;
  const backgroundColorIndex =
    userInfo.value.core_info.default_avatar.color_index;

  const options = [
    {
      label: "Logout",
      icon: faRightFromBracket,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={twMerge(
          "flex size-12 cursor-pointer items-center gap-1.5",
          "data-[hover]:opacity-70",
        )}
      >
        <Gravatar
          size={34}
          username={username}
          email_hash={emailHash}
          avatarIndex={avatarIndex}
          backgroundIndex={backgroundColorIndex}
        />

        <FontAwesomeIcon icon={faChevronDown} />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className={twMerge(
          paperWrapperStyles,
          "mt-4 flex w-fit flex-col px-0 focus:outline-none",
          transitionTimingStyles,
          "data-[closed]:scale-95 data-[closed]:opacity-0",
        )}
      >
        <MenuItem
          key={0}
          as="a"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className={twMerge(
            "flex w-full items-center gap-2 text-nowrap px-4 py-2 text-start text-sm font-medium",
            "data-[focus]:bg-gray-200 data-[focus]:text-primary-600",
          )}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>My Profile</span>
        </MenuItem>
        {options.map((option, index) => (
          <MenuItem
            as="button"
            key={index + 1}
            className={twMerge(
              "flex w-full items-center gap-2 px-4 py-2 text-start text-sm font-medium",
              "data-[focus]:bg-gray-200",
            )}
            onClick={option.onClick}
          >
            <FontAwesomeIcon icon={option.icon} />
            <span>{option.label}</span>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
