type Setter = (x: any) => void

export default function onChanger({ ...setters }: { [key: string]: Setter }) {
  return ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: Setter } = setters;
    todo[target.name + "Set"](target.value);
  };
}