import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSpring, a } from "@react-spring/web";
import "./Tabs.scss";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface TabProps {
  to: string;
  label: string;
  content?: React.ReactNode;
  icon?: IconDefinition;
}

interface TabsProps {
  tabs: TabProps[];
}

interface TabContentProps {
  children: React.ReactNode;
}

function Tab({ to, label, icon, onClick }: TabProps & { onClick: () => void }) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className="nav-link fs-6 px-3 px-lg-4"
        activeClassName="active"
        onClick={onClick}
      >
        {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
        {label}
      </NavLink>
    </li>
  );
}

function TabContent({ children }: TabContentProps) {
  return <div className="tab-content">{children}</div>;
}

function Tabs({ tabs }: TabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const initialTab = tabs.find((tab) => tab.to === currentPath) || tabs[0];
  const [activeTab, setActiveTab] = useState(initialTab.to);

  const [fade, setFade] = useSpring(() => ({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 50 },
  }));

  useEffect(() => {
    setFade({ opacity: 1 });
  }, [activeTab, setFade]);

  useEffect(() => {
    setActiveTab(currentPath);
  }, [currentPath]);

  const handleTabClick = (tabTo: string) => {
    setFade({ opacity: 0 });
    setTimeout(() => setActiveTab(tabTo), 50);
  };

  return (
    <nav>
      <ul className="nav nav-tabs">
        {tabs.map((tab) => (
          <Tab
            key={tab.to}
            to={tab.to}
            label={tab.label}
            onClick={() => handleTabClick(tab.to)}
            icon={tab.icon}
          />
        ))}
      </ul>
      <TabContent>
        {tabs.map((tab) => (
          <a.div
            key={tab.to}
            style={fade}
            className={`tab-pane fade ${
              activeTab === tab.to ? "show active" : ""
            }`}
          >
            {tab.content}
          </a.div>
        ))}
      </TabContent>
    </nav>
  );
}

export default Tabs;
