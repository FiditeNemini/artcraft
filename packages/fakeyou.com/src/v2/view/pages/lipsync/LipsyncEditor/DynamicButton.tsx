import React from "react";
import { animated, useSpring } from "@react-spring/web";
import { useHover } from "hooks";
import { baseColors } from "resources";
import "./DynamicButton.scss"

interface Props {
  children?: string|JSX.Element|JSX.Element[];
  className?: string;
  disabled?: boolean;
  key?: boolean;
  [x:string]: any;
}

export default function DynamicButton({ children, className, disabled, key, ...rest }: Props) {
  const [hover, hoverProps = {}] = useHover({});
  const style = useSpring({
    backgroundColor: hover ? baseColors.primary : baseColors.another,
    config: { mass: 1, tension: 160, friction: 5 },
    opacity: disabled ? .5 : 1
  });

  return <animated.button {...{ className: `btn`, disabled, style, ...hoverProps, ...rest }}>
    { children }
  </animated.button>;
};