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
  padding?: boolean;
}

interface TabsProps {
  tabs: TabProps[];
}

interface TabContentProps {
  children: React.ReactNode;
  padding?: boolean;
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

function TabContent({ children, padding }: TabContentProps) {
  const paddingClasses = padding ? "p-3 py-4 p-md-4" : "";
  return <div className={`tab-content ${paddingClasses}`}>{children}</div>;
}

function Tabs({ tabs }: TabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const initialTab = tabs.find(tab => tab.to === currentPath) || tabs[0];
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
    if (activeTab === tabTo) {
      return;
    }
    setFade({ opacity: 0 });
    setTimeout(() => setActiveTab(tabTo), 50);
  };

  const activeTabProps = tabs.find(tab => tab.to === activeTab);

  return (
    <nav>
      <ul className="nav nav-tabs">
        {tabs.map(tab => (
          <Tab
            key={tab.to}
            to={tab.to}
            label={tab.label}
            onClick={() => handleTabClick(tab.to)}
            icon={tab.icon}
          />
        ))}
      </ul>
      <TabContent padding={activeTabProps?.padding}>
        {tabs.map(tab => (
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
