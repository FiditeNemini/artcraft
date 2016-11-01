// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

export function getRandomInt(min: number, max: number) : number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
