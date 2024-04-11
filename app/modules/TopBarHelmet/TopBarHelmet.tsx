import { useLocation } from "@remix-run/react";

import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { TopBarInnerContext } from "~/contexts/TopBarInner";

export const TopBarHelmet = (props: { children: React.ReactNode | null }) => {
  const [showChild, setShowChild] = useState(false);
  // Wait until after client-side hydration to show
  useEffect(() => {
    setShowChild(true);
  }, []);
  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null;
  }

  return <LazyLoadTopBarInnerContent {...props} />;
};

const LazyLoadTopBarInnerContent = (props: {
  children: React.ReactNode | null;
}) => {
  const { setTopBarInner } = useContext(TopBarInnerContext) || {};
  const location = useLocation().pathname;

  useLayoutEffect(() => {
    if (setTopBarInner) {
      setTopBarInner({
        location: location,
        node: props.children,
      });
    }
  }, [setTopBarInner]);

  return null;
};
