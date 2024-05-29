import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faRightFromBracket,
  faUser,
} from "@fortawesome/pro-solid-svg-icons";
import { Menu, Transition } from "@headlessui/react";
import { Gravatar } from "~/components/reusable";
import { twMerge } from "tailwind-merge";

interface ProfileDropdownProps {
  username: string;
  displayName: string;
  avatarIndex: number;
  backgroundColorIndex: number;
  emailHash: string;
  logoutHandler: () => void;
}

export default function ProfileDropdown({
  username,
  displayName,
  avatarIndex,
  backgroundColorIndex,
  emailHash,
  logoutHandler,
}: ProfileDropdownProps) {
  const options = [
    {
      label: "My Profile",
      icon: faUser,
      onClick: () => {
        window.location.href = `https://storyteller.ai/profile/${displayName}`;
      },
    },
    {
      label: "Logout",
      icon: faRightFromBracket,
      onClick: logoutHandler,
    },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button as="div">
        <div className="group flex cursor-pointer items-center gap-1.5 transition-opacity duration-150 hover:opacity-90">
          <Gravatar
            size={34}
            username={username}
            email_hash={emailHash}
            avatarIndex={avatarIndex}
            backgroundIndex={backgroundColorIndex}
          />
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className="absolute right-[-5px] mt-2.5 w-36 overflow-hidden rounded-lg bg-brand-secondary shadow-lg focus:outline-none"
        >
          <div>
            {options.map((option, index) => (
              <Fragment key={index}>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={twMerge(
                        "duration-50 group flex w-full items-center gap-2 bg-action/60 px-3 py-[10px] text-start text-sm font-medium text-white transition-all",
                        active && "bg-action-500/80",
                      )}
                      onClick={() => option.onClick()}
                    >
                      <FontAwesomeIcon icon={option.icon} />
                      {option.label}
                    </button>
                  )}
                </Menu.Item>
              </Fragment>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
