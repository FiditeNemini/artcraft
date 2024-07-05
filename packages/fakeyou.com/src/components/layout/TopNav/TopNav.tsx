import {
  faBars,
  faFaceViewfinder,
  faMessageDots,
  faSearch,
  faStar,
  faWandMagicSparkles,
  faWaveformLines,
  faXmark,
  faClipboardList,
  faPortalEnter,
  faHome,
  faCompass,
  faCloudUpload,
  faTrophy,
  faBookOpen,
  faFilms,
  faUser,
  faSignOutAlt,
  faScrewdriverWrench,
} from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { useLocalize, useModal, useSession } from "hooks";
import { InferenceJobsModal } from "components/modals";
import { useDomainConfig } from "context/DomainConfigContext";
import NavItem from "../../common/NavItem/NavItem";
import ProfileDropdown from "components/common/ProfileDropdown";
import "./TopNav.scss";
import { Website } from "@storyteller/components/src/env/GetWebsite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { GetDiscordLink } from "@storyteller/components/src/env/GetDiscordLink";
import { WebUrl } from "common/WebUrl";

interface TopNavProps {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

export default function TopNav({
  sessionWrapper,
  querySessionCallback,
  querySessionSubscriptionsCallback,
}: TopNavProps) {
  const domain = useDomainConfig();
  let history = useHistory();
  const [isMobileSearchBarVisible, setIsMobileSearchBarVisible] =
    useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapper = document.getElementById("wrapper");
  const [menuButtonIcon, setMenuButtonIcon] = useState(faBars);
  const { t } = useLocalize("SideNav");
  const isOnLandingPage = window.location.pathname === "/";
  const isOnLoginPage = window.location.pathname.includes("/login");
  const isOnSignUpPage = window.location.pathname.includes("/signup");
  const isOnStudioPage = window.location.pathname.includes("/studio");
  const isOnBetaKeyRedeemPage =
    window.location.pathname.includes("/beta-key/redeem");
  const isOnWaitlistSuccessPage = window.location.pathname.includes(
    "/waitlist-next-steps"
  );
  const isOnCreatorOnboardingPage = window.location.pathname.includes(
    "/creator-onboarding"
  );

  const { open } = useModal();
  const openModal = () => open({ component: InferenceJobsModal });
  const [isScrolled, setIsScrolled] = useState(false);
  const loggedIn = sessionWrapper.isLoggedIn();
  const showNavItem =
    (!loggedIn && (isOnLandingPage || isOnLoginPage || isOnSignUpPage)) ||
    domain.titlePart === "Storyteller AI";

  const [mobileMenu, setMobileMenu] = useState("d-none");

  const handleSearchButtonClick = () => {
    setIsMobileSearchBarVisible(true);
    setMenuButtonIcon(faBars);
    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.remove("toggled");
      }
    }
  };

  const onFocusHandler = () => {
    setIsFocused(true);
  };

  const onBlurHandler = () => {
    // Search field blur/Unfocusing hack: needs a little bit of delay for the result click event to register
    setTimeout(() => {
      setIsFocused(false);

      if (isMobileSearchBarVisible) {
        setIsMobileSearchBarVisible(false);
      }
    }, 100);
  };

  useEffect(() => {
    const topBarWrapper = document.getElementById("topbar-wrapper");

    const handleMenuToggle = (event: any) => {
      setMenuButtonIcon(event.detail.isOpen ? faXmark : faBars);
      if (event.detail.isOpen) {
        topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      } else {
        topBarWrapper?.classList.add("topbar-wrapper-transparent");
      }
    };

    window.addEventListener("menuToggle", handleMenuToggle);

    return () => {
      window.removeEventListener("menuToggle", handleMenuToggle);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logoutHandler = async () => {
    await Logout();
    querySessionCallback();
    querySessionSubscriptionsCallback();
    history.push("/");
  };

  let profileDropdown = <></>;

  const { user } = useSession();

  if (sessionWrapper.isLoggedIn()) {
    let displayName = user.display_name;
    let username = user.username;
    let emailHash = user.email_gravatar_hash;
    let avatarIndex = user.core_info.default_avatar.image_index;
    let backgroundColorIndex = user.core_info.default_avatar.color_index;

    profileDropdown = (
      <ProfileDropdown
        username={username || ""}
        displayName={displayName || ""}
        avatarIndex={avatarIndex}
        backgroundColorIndex={backgroundColorIndex}
        emailHash={emailHash || ""}
        logoutHandler={logoutHandler}
      />
    );
  }

  // const aiToolsDropdown = [
  //   { id: 1, name: "Text to Speech", link: "/tts", icon: faMessageDots },
  //   {
  //     id: 2,
  //     name: "Voice to Voice",
  //     link: "/voice-conversion",
  //     icon: faWaveformLines,
  //   },
  //   {
  //     id: 3,
  //     name: "Face Animator",
  //     link: "/face-animator",
  //     icon: faFaceViewfinder,
  //   },
  //   {
  //     id: 4,
  //     name: "Voice Designer",
  //     link: "/voice-designer",
  //     icon: faWandMagicSparkles,
  //   },
  //   {
  //     id: 5,
  //     name: "Text to Image",
  //     link: "/text-to-image",
  //     icon: faMessageImage,
  //   },
  //   // { id: 4, name: "Text to Image", link: "/text-to-image" },
  // ];

  const topBarWrapper = document.getElementById("topbar-wrapper");

  useEffect(() => {
    const pageContentWrapper = document.getElementById("page-content-wrapper");

    if (pageContentWrapper) {
      if (
        (domain.titlePart === "Storyteller AI" && isOnLandingPage) ||
        isOnBetaKeyRedeemPage ||
        isOnCreatorOnboardingPage ||
        isOnLoginPage ||
        isOnSignUpPage
      ) {
        pageContentWrapper.style.padding = "0px";
      } else {
        pageContentWrapper.style.padding = "";
      }
    }
  }, [
    domain.titlePart,
    isOnLandingPage,
    isOnBetaKeyRedeemPage,
    isOnWaitlistSuccessPage,
    isOnCreatorOnboardingPage,
    isOnLoginPage,
    isOnSignUpPage,
  ]);

  if (
    topBarWrapper &&
    domain.titlePart === "Storyteller AI" &&
    isOnLandingPage
  ) {
    topBarWrapper.classList.add("topbar-bg-transparent");
  } else {
    topBarWrapper?.classList.remove("topbar-bg-transparent");
  }

  useEffect(() => {
    const handleScroll = () => {
      if (
        topBarWrapper &&
        domain.titlePart === "Storyteller AI" &&
        isOnLandingPage
      ) {
        if (window.scrollY > 500) {
          topBarWrapper.classList.remove("topbar-bg-transparent");
        } else {
          topBarWrapper.classList.add("topbar-bg-transparent");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [domain.titlePart, isOnLandingPage, topBarWrapper]);

  if (
    isOnBetaKeyRedeemPage ||
    isOnWaitlistSuccessPage ||
    isOnCreatorOnboardingPage ||
    isOnSignUpPage ||
    isOnLoginPage
  ) {
    return null;
  }

  const handleNavLinkClick = () => {
    setMobileMenu("d-none");
    setMenuButtonIcon(faBars);
  };

  const handleMenuButtonClick = () => {
    if (mobileMenu === "d-none") {
      setMobileMenu("d-block");
      setMenuButtonIcon(faXmark);
    } else {
      setMobileMenu("d-none");
      setMenuButtonIcon(faBars);
    }
  };

  let userOrLoginButton = (
    <>
      <Button
        label="Login"
        small
        variant="secondary"
        onClick={() => {
          history.push("/login");
          handleNavLinkClick();
        }}
      />
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Button
        label="Sign Up"
        small
        onClick={() => {
          history.push("/signup");
          handleNavLinkClick();
        }}
      />
    </>
  );

  if (loggedIn) {
    let displayName = sessionWrapper.getDisplayName();
    // let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
    // let gravatar = <span />;

    if (displayName === undefined) {
      displayName = "My Account";
    }

    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <>
        <Button
          icon={faUser}
          label="My Profile"
          small
          variant="secondary"
          onClick={() => {
            history.push(url);
            handleNavLinkClick();
          }}
        />
      </>
    );

    signupOrLogOutButton = (
      <>
        <Button
          icon={faSignOutAlt}
          label="Logout"
          small
          variant="danger"
          onClick={async () => {
            await logoutHandler();
            handleNavLinkClick();
          }}
        />
      </>
    );
  }

  if (sessionWrapper.isLoggedIn()) {
    let displayName = sessionWrapper.getDisplayName();
    if (displayName === undefined) {
      displayName = "My Account";
    }
    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <Button
        icon={faUser}
        label="My Profile"
        small
        variant="secondary"
        onClick={() => history.push(url)}
        className="d-block d-lg-none"
      />
    );
  }

  return (
    <>
      {/* {domain.titlePart === "Storyteller AI" &&
        isOnLandingPage &&
        !isScrolled && (
          <div
            className="position-fixed top-0 end-0 pe-3 ps-3 d-flex align-items-center gap-2"
            style={{
              zIndex: 20,
              height: "65px",
              borderRadius: "0 0 0 0.75rem",
              backgroundColor: "#242433",
            }}
          >
            {loggedIn ? (
              <div className="d-flex gap-2 align-items-center">
                <Button
                  {...{
                    icon: faClipboardList,
                    label: "My Jobs",
                    onClick: openModal,
                    variant: "secondary",
                    small: true,
                  }}
                />
                {profileDropdown}
              </div>
            ) : (
              <>
                <Button
                  label="Login"
                  small
                  variant="secondary"
                  onClick={() => {
                    history.push("/login");
                  }}
                />
                <Button
                  label="Sign Up"
                  small
                  onClick={() => {
                    history.push("/signup");
                  }}
                />
              </>
            )}
          </div>
        )} */}
      <div
        id="topbar-wrapper"
        className={`position-fixed ${
          domain.titlePart !== "FakeYou"
            ? "topbar-bg-transparent"
            : !loggedIn && isOnLandingPage && !isScrolled
              ? "topbar-bg-dark"
              : ""
        }`.trim()}
      >
        <div className="topbar-nav">
          <div className="topbar-nav-left">
            <div className="d-flex gap-1 align-items-center">
              <Link to="/" className="me-3">
                <img
                  src={domain.logo}
                  alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                  height="36"
                  className="mb-1 d-none d-lg-block"
                />
                <img
                  src="/fakeyou/FakeYou-Logo-Mobile.png"
                  alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                  height="36"
                  className="mb-0 d-block d-lg-none"
                />
              </Link>

              {domain.titlePart === "FakeYou" && (
                <div className="d-none d-lg-block">
                  <NavItem
                    icon={faScrewdriverWrench}
                    label="Creator Tools"
                    link="/tools"
                  />
                </div>
              )}

              <NavItem
                icon={faCompass}
                label="Explore"
                link="/explore"
                className="d-none d-lg-block"
              />
              <NavItem
                icon={faStar}
                label="Pricing"
                link="/pricing"
                className="me-3 d-none d-lg-block"
              />
            </div>
          </div>

          <div className="topbar-nav-center">
            {/* Search Bar */}
            <div className="d-none d-lg-block">
              {domain.titlePart === "FakeYou" && (
                <>
                  {(!isOnLandingPage &&
                    !isOnLoginPage &&
                    !isOnSignUpPage &&
                    !isOnStudioPage) ||
                  (loggedIn &&
                    !isOnLoginPage &&
                    !isOnSignUpPage &&
                    !isOnStudioPage) ||
                  (isOnLandingPage &&
                    isScrolled &&
                    !isOnLoginPage &&
                    !isOnSignUpPage &&
                    !isOnStudioPage) ? (
                    <SearchBar
                      onFocus={onFocusHandler}
                      onBlur={onBlurHandler}
                      isFocused={isFocused}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="topbar-nav-right">
            {domain.titlePart === "Storyteller AI" &&
              sessionWrapper.canAccessStudio() && (
                <div className="d-none d-lg-block">
                  <Button
                    icon={faPortalEnter}
                    label="Enter Storyteller Studio"
                    href="https://studio.storyteller.ai/"
                    small={true}
                    className="me-2"
                  />
                </div>
              )}

            <div className="d-flex align-items-center gap-2">
              <div className="d-none d-lg-flex gap-2">
                {(domain.titlePart === "FakeYou" ||
                  (sessionWrapper.isLoggedIn() &&
                    domain.titlePart === "Storyteller AI")) && (
                  <Button
                    {...{
                      icon: faClipboardList,
                      label: "My Jobs",
                      onClick: openModal,
                      variant: "secondary",
                      small: true,
                    }}
                  />
                )}

                {loggedIn ? (
                  profileDropdown
                ) : (
                  <>
                    <Button
                      label="Login"
                      small
                      variant="secondary"
                      onClick={() => {
                        history.push("/login");
                      }}
                    />
                    <Button
                      label="Sign Up"
                      small
                      onClick={() => {
                        history.push("/signup");
                      }}
                    />
                  </>
                )}
              </div>
              {!showNavItem && (
                <>
                  <Button
                    icon={faClipboardList}
                    variant="secondary"
                    small={true}
                    label="My Jobs"
                    onClick={openModal}
                    className="d-lg-none"
                  />
                  <Button
                    icon={faSearch}
                    variant="secondary"
                    small={true}
                    square={true}
                    onClick={handleSearchButtonClick}
                    className="d-lg-none"
                  />
                </>
              )}

              <Button
                icon={menuButtonIcon}
                variant="secondary"
                small={true}
                square={true}
                onClick={handleMenuButtonClick}
                className="d-lg-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${mobileMenu} d-lg-none`} style={{ height: "100vh" }}>
          <ul className="sidebar-nav">
            <li>
              <NavLink
                exact={true}
                to={domain.website === Website.FakeYou ? "/" : "/dashboard"}
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="sidebar-heading-icon"
                />
                {domain.website === Website.FakeYou ? "Home" : "Dashboard"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pricing"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  className="sidebar-heading-icon"
                />
                {t("infoPricing")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/explore"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faCompass}
                  className="sidebar-heading-icon"
                />
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inference-jobs-list"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="sidebar-heading-icon"
                />
                My Jobs
              </NavLink>
            </li>
            <li className="sidebar-heading">{t("speechTitle")}</li>
            <li>
              <NavLink
                to="/tts"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faMessageDots}
                  className="sidebar-heading-icon"
                />
                {t("speechTts")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/voice-conversion"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faWaveformLines}
                  className="sidebar-heading-icon"
                />
                {t("speechVc")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/voice-designer"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faWandMagicSparkles}
                  className="sidebar-heading-icon"
                />
                {"Voice Designer"}
              </NavLink>
            </li>
            <li className="sidebar-heading">{t("videoTitle")}</li>

            <li>
              <NavLink
                to="/video-styletransfer"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faFilms}
                  className="sidebar-heading-icon"
                />
                {t("videoStyleTransfer")}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/face-animator"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faFaceViewfinder}
                  className="sidebar-heading-icon"
                />
                {t("videoFaceAnimator")}
              </NavLink>
            </li>

            {/* {maybeImageGeneration}

          {maybeBetaFeatures} */}

            <li className="sidebar-heading">{t("communityTitle")}</li>
            <li>
              <NavLink
                to="/contribute"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faCloudUpload}
                  className="sidebar-heading-icon"
                />
                {t("communityUploadModels")}
              </NavLink>
            </li>
            <li className="mb-3">
              <a href={GetDiscordLink()} target="_blank" rel="noreferrer">
                <FontAwesomeIcon
                  icon={faDiscord}
                  className="sidebar-heading-icon"
                />
                {t("communityDiscord")}
              </a>
              <NavLink
                to="/leaderboard"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="sidebar-heading-icon"
                />
                {t("communityLeaderboard")}
              </NavLink>
              <NavLink
                to="/guide"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="sidebar-heading-icon"
                />
                {t("communityGuide")}
              </NavLink>
            </li>

            <div className="px-4 d-flex d-lg-none gap-2 mb-2">
              {userOrLoginButton}
              {signupOrLogOutButton}
            </div>
          </ul>
        </div>

        {/* Mobile Searchbar */}
        {isMobileSearchBarVisible && (
          <div className="topbar-mobile-search-bar-container">
            <div className="topbar-mobile-search-bar">
              <SearchBar
                onFocus={onFocusHandler}
                onBlur={onBlurHandler}
                isFocused={isFocused}
                autoFocus={true}
              />

              <Button
                icon={faXmark}
                className="close-search-button"
                onClick={() => {
                  setIsMobileSearchBarVisible(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
