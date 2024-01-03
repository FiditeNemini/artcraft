import { config } from "@react-spring/web";

const basicTransition = ({ ...overwrite }) => ({
  config: config.gentle,
  from: { opacity: 0 },
  enter: { opacity: 1 },
  leave: { opacity: 0 },
  ...overwrite
});

export default basicTransition;