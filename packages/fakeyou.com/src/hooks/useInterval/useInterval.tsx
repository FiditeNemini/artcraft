import { useEffect, useRef, useState } from "react";

export interface IntervalEvent {
  end: number,
  index: number,
  start: number,
}

export default function useInterval(props: any) {
  const [ticker,tickerSet] = useState<number|null>(null);
  const config = useRef({
    index: props.start || 0,
    ...props
  });

  useEffect(() => {
    if (!ticker) {
      let newTicker = setInterval(() => {
        const { end = 3, index, locked = false, onTick = (e: IntervalEvent) => {}, start = 0 } = config.current;
        config.current.index = index < end ? index + 1 : start;

        if (!locked) onTick(config.current);
      }, props.interval);

      tickerSet(Number(newTicker) || 9999);
      // loadedSet(true);
    }
    if (props.locked !== config.current.locked) {
      config.current.locked = props.locked;
    }

    // if (kill && ticker) { // not needed for now
    //   return () => clearInterval(ticker);
    // }

  },[props,ticker]);

  return config.current;
};