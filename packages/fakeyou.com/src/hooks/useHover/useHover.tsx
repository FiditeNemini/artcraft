import { useState } from 'react';

interface Props {
  onMouseEnter?: (e?: any) => void;
  onMouseLeave?: (e?: any) => void;
}

export default function useHover({ onMouseEnter = () => {}, onMouseLeave = () => {} }: Props) {
  const [ hover, hoverSet ] = useState(false);
  const onHover = (x:boolean) => (e: any) => { hoverSet(x); x ? onMouseEnter(e) : onMouseLeave(e) };
  return [ hover, { onMouseEnter: onHover(true), onMouseLeave: onHover(false)}];
};
