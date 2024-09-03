import { Fragment } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faRightFromBracket,
  faUser,
} from "@fortawesome/pro-thin-svg-icons";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Gravatar } from "../ui/Gravatar";
import { twMerge } from "tailwind-merge";

import { authentication } from "~/signals";

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
        as="div"
        className="group flex size-12 cursor-pointer items-center gap-1.5 transition-opacity duration-150 hover:opacity-90"
      >
        <Gravatar
          size={34}
          username={username}
          email_hash={emailHash}
          avatarIndex={avatarIndex}
          backgroundIndex={backgroundColorIndex}
        />
        <FontAwesomeIcon icon={faCaretDown} />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute -right-2 mt-2.5 w-fit rounded-xl border border-ui-border bg-ui-panel shadow-lg">
          <MenuItems static className="flex flex-col py-2 focus:outline-none">
            <MenuItem key={0}>
              {() => (
                <a
                  className="duration-50 group flex w-full items-center gap-2 text-nowrap px-4 py-2 text-start text-sm font-medium transition-all"
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faUser} />
                  My Profile
                </a>
              )}
            </MenuItem>
            {options.map((option, index) => (
              <MenuItem key={index + 1}>
                {() => (
                  <button
                    className="duration-50 group flex w-full items-center gap-2 px-4 py-2 text-start text-sm font-medium transition-all"
                    onClick={() => option.onClick()}
                  >
                    <FontAwesomeIcon icon={option.icon} />
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </div>
      </Transition>
    </Menu>
  );
}
