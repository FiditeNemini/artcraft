import { config } from "@react-spring/web";
const n = (x:any) => {};

const basicTransition = ({ ...overwrite }, onRest = n, onStart = n) => ({
  config: config.gentle,
  from: { opacity: 0, },
  enter: { opacity: 1, },
  leave: { opacity: 0, },
  onRest,
  onStart,
  ...overwrite
});

export default basicTransition;