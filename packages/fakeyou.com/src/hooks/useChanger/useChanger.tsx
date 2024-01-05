export default function useChanger({ ...state }) {
  const setProps = (name: string) => ({
    name,
    value: state[name][0],
    onChange: ({ target }: { target: { value: any } }) => { state[name][1](target.value); }
  });

 return { setProps, state };
};