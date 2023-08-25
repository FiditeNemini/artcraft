import React, { useEffect } from "react";

import { a, useTrail, useSprings, SpringValue } from '@react-spring/web';
import "./Spinner.scss";

const allCoords = [
  [16,8,16,2],
  [20,9.0718,23,3.8756],
  [22.9282,12,28.1244,9],
  [24,16,30,16],
  [22.9282,20,28.1244,23],
  [20,22.9282,23,28.1244],
  [16,24,16,30],
  [12,22.9282,9,28.1244],
  [9.0718,20,3.8756,23],
  [9,16,2,16],
  [9.0718,12,3.8756,9],
  [12,9.0718,9,3.8756],
];

// const Line = ({ style, yah }:{ style: any, yah: any }) => {
//   const { base, opacity, coords } = style;
//   const jam = opacity.to((x: any) => { console.log("😎", x); return `16 8 16 ${ 2 * x }`; });
//   console.log("😎", opacity);
//   return <a.polyline {...{
//     fill: 'none',
//     points: jam,
//     strokeLinecap: 'round',
//     strokeLinejoin: 'round',
//     strokeWidth: '3',
//     style: { opacity: opacity.to((x: any) => x < .5 ? x : .5 - (x - .5) )},
//     transform: `rotate(${ 30 * yah })`,
//   }}/>
// };


const Line = ({ style, yah }:{ style: any, yah: any }) => {
  console.log("😎", yah);
  return <a.polyline {...{
    fill: 'none',
    points: `16 8 16 2`,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '3',
    transform: `rotate(${ 30 * yah })`,
  }}/>
};

export default function Spinner() {
  const yah = (s: number) => ({
    base: s ? 0 : 1000,
    coords: `16 8 16 ${2 + s}`, 
    opacity: s ? 0 : 1
  });
  const [ spinLines, api ] = useTrail(12, (num: any, telpe) => {
    return {
      config: { duration: 250 },
      delay: 0,
      loop: { reverse: true, delay: 250 * num },
      reset: true,
      from: yah(5),
      to: yah(0),
      onRest: () => console.log('🔥',telpe)
    }
  });

  // api.start();

  return <svg {...{ className: "fy-spinner", height: 32, viewBox: "0 0 32 32", width: 32 }}>
    { spinLines.map((style: any, key: number) => {
      console.log("👤",style,key,style[key]);
      return <Line {...{ key, yah: key, style: style }}/>
    }) }
</svg>;
};