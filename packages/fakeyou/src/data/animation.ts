//Animation property variables
export const distance = "30px";
export const delay = "100";
export const delay2 = "200";
export const duration = "400";

//pricing page
export const pricing1 = "0";
export const pricing2 = "100";
export const pricing3 = "200";

export const container = {
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  hidden: { opacity: 0 },
};

export const item = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 50 },
};

export const image = {
  visible: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  hidden: { opacity: 0, x: 100 },
};

export const panel = {
  visible: { opacity: 1, y: 0, transition: { delay: 0.25 } },
  hidden: { opacity: 0, y: 50 },
};
