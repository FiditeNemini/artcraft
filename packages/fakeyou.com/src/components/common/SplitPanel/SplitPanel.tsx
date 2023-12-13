import React, { ReactNode } from "react";

// Header, Body, and Footer Interfaces and Components
interface HeaderProps {
  children: ReactNode;
  padding?: boolean;
}
const Header: React.FC<HeaderProps> = ({ children, padding }) => {
  const headerClassName = `${padding ? "p-3 py-4 p-md-4" : ""}`.trim();
  return <div className={headerClassName}>{children}</div>;
};

interface BodyProps {
  children: ReactNode;
  padding?: boolean;
}
const Body: React.FC<BodyProps> = ({ children, padding }) => {
  const bodyClassName = `${padding ? "p-3 py-4 p-md-4" : ""}`.trim();
  return <div className={bodyClassName}>{children}</div>;
};

interface FooterProps {
  children: ReactNode;
  padding?: boolean;
}
const Footer: React.FC<FooterProps> = ({ children, padding }) => {
  const footerClassName = `${padding ? "p-3 py-4 p-md-4" : ""}`.trim();
  return <div className={footerClassName}>{children}</div>;
};

// Panel Interface
interface PanelProps {
  children: ReactNode;
  dividerHeader?: boolean;
  dividerFooter?: boolean;
  clear?: boolean;
  className?: string;
}

// Panel Component
const SplitPanel: React.FC<PanelProps> & {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
} = ({ children, dividerHeader, dividerFooter, clear, className }) => {
  let header: ReactNode, body: ReactNode, footer: ReactNode;

  const panelClassName = `${clear ? "panel-clear" : "panel"} ${
    className ? className : ""
  }`.trim();

  React.Children.toArray(children).forEach((child: ReactNode) => {
    if (React.isValidElement(child)) {
      switch (child.type) {
        case Header:
          header = child;
          break;
        case Body:
          body = child;
          break;
        case Footer:
          footer = child;
          break;
      }
    }
  });

  return (
    <div className={panelClassName}>
      {header}
      {dividerHeader && <hr className="m-0" />}
      {body}
      {dividerFooter && <hr className="m-0" />}
      {footer}
    </div>
  );
};

// Attach Header, Body, and Footer as static properties
SplitPanel.Header = Header;
SplitPanel.Body = Body;
SplitPanel.Footer = Footer;

export default SplitPanel;
