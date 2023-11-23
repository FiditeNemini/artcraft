import React, { useState } from "react";
import { NavLink } from "react-router-dom";

interface TabProps {
  to: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabProps[];
}

interface TabContentProps {
  children: React.ReactNode;
}

function Tab({ to, label }: TabProps) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        className="nav-link fs-6 px-3 px-lg-4"
        activeClassName="active"
      >
        {label}
      </NavLink>
    </li>
  );
}

function TabContent({ children }: TabContentProps) {
  return <div className="tab-content">{children}</div>;
}

function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].to);

  return (
    <nav>
      <ul className="nav nav-tabs">
        {tabs.map((tab) => (
          <Tab key={tab.to} to={tab.to} label={tab.label} />
        ))}
      </ul>
      <TabContent>
        {tabs.map((tab) => (
          <div
            key={tab.to}
            className={`tab-pane fade ${
              activeTab === tab.to ? "show active" : ""
            }`}
          >
            {tab.content}
          </div>
        ))}
      </TabContent>
    </nav>
  );
}

export default Tabs;
