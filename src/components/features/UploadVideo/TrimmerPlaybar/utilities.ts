export const buttonStyles = "border border-ui-border bg-ui-panel cursor-grab";
export const verticalPositionStyles = "absolute top-1/2 -translate-y-1/2";

export const makePositionCalculator = (
  e: MouseEvent | React.MouseEvent<HTMLDivElement>,
) => {
  const thisEl = e.target as HTMLDivElement;
  const parentEl = thisEl.parentElement as HTMLDivElement;
  const parentWidth = parentEl.getBoundingClientRect().width;
  return (currE: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    const result = ((currE.clientX - parentEl.offsetLeft) / parentWidth) * 100;
    if (result < 0) {
      return 0;
    }
    if (result > 100) {
      return 100;
    }
    return result;
  };
};
