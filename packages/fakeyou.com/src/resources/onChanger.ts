type Setter = (x: any) => void;

export default function onChanger({ ...setters }: { [key: string]: Setter }) {
  return ({ target }: { target: { name: string; value: any } }) => {
    const targetName =
      target.name.charAt(0).toUpperCase() + target.name.slice(1);
    const todo: { [key: string]: Setter } = setters;
    todo["set" + targetName](target.value);
  };
}
