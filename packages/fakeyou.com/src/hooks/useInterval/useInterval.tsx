import { useEffect, useRef } from 'react';

export interface IntervalEvent {
  end: number,
  index: number,
  start: number,
}

export default function useInterval(props: any) {
  const things = useRef({
    index: props.start || 0,
    ...props
  });

  useEffect(() => {
    const ticker = setInterval(() => {
      const { end = 3, index, onTick = (e: IntervalEvent) => {}, start = 0 } = things.current;
    	things.current.index = index < end ? index + 1 : start;
      onTick(things.current);

    }, things.current.interval);

    return () => clearInterval(ticker);
  },[]);

  return things.current;
};