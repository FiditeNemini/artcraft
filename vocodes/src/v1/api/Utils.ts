
function getRandomInt(min: number, max: number) : number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomArrayValue<T>(array: Array<T>) : T {
  let index = getRandomInt(0, array.length);
  return array[index];
}

export { getRandomInt, getRandomArrayValue }
