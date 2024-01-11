import React, { useState } from 'react';
import { a, useTransition } from "@react-spring/web";
import { basicTransition } from "resources";

interface Props {
  debug?: boolean,
  labels: string[],
  index: number
}

export default function WorkDots({ debug, labels = [], index }: Props) {
  const [animating,animatingSet] = useState(false);
  const transitions = useTransition(index, basicTransition({
    onRest: () => animatingSet(false),
    onStart: () => animatingSet(true)
  }));

  if (debug) console.log("WorkDots ... Debug",index);

  return transitions((style: any, i: number, state: any) => {
    let isLeaving = state.phase === "leave";
    const content = (txt = "") =>
      <a.div {...{ style: {
        ...style,
        position: isLeaving && animating ? "absolute" : "relative" 
      } }}>{ 
         txt ? txt : <svg {...{ className: "fy-workdots" }}>
          <circle cx="2" cy="8" r="2" />
          <circle cx="8" cy="8" r="2" />
          <circle cx="14" cy="8" r="2" />
        </svg>
      }</a.div>;
    return [ content(""), ...labels.map((label,i) => content(label))][i];
  });
};