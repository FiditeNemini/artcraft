import React, { useState, useRef, useEffect } from "react";
import "./Accordion.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { animated, useSpring } from "@react-spring/web";

interface AccordionProps {
  children: React.ReactNode;
}

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isOpen]);

  const heightProps = useSpring({
    height: `${contentHeight}px`,
    from: {
      height: defaultOpen ? "auto" : "0px",
      config: { tension: 300, friction: 25 },
    },
  });

  const contentOpacityProps = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { tension: 300, friction: 25 },
  });

  return (
    <div className="fy-accordion-item">
      <div
        className={`fy-accordion-header p-3 ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span className={`caret-icon ${isOpen ? "caret-rotated" : ""}`}>
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>
      <animated.div style={heightProps}>
        <animated.div
          ref={contentRef}
          style={contentOpacityProps}
          className="fy-accordion-content"
        >
          {children}
        </animated.div>
      </animated.div>
    </div>
  );
}

function Accordion({ children }: AccordionProps) {
  return <div className="d-flex flex-column gap-3">{children}</div>;
}

Accordion.Item = AccordionItem;

export default Accordion;
