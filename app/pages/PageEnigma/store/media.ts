import { signal } from "@preact/signals-core";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
import * as uuid from "uuid";

export const animationItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_5q9s6esz8ymjqz0bheh8nf4crtj2kx",
    type: AssetType.ANIMATION,
    length: 25,
    name: "Sit",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.ANIMATION,
    length: 25,
    name: "Idle",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.ANIMATION,
    length: 25,
    name: "Stand",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: "m_w5t517krrf63f3tj2288vsffmj87zw",
    type: AssetType.ANIMATION,
    length: 25,
    name: "Walk",
    thumbnail: "resources/characters/img01.png",
  },
]);

export const audioItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.AUDIO,
    length: 25,
    name: "Sing",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.AUDIO,
    length: 25,
    name: "Chatter",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: "m_403phjvjkbbaxxbz8y7r6qjay07mfd",
    type: AssetType.AUDIO,
    length: 25,
    name: "Talk",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.AUDIO,
    length: 25,
    name: "Yell",
    thumbnail: "resources/characters/img01.png",
  },
]);

export const cameraItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_w5nn3kjh1fbkmjrdac5b2qaba0pmyt",
    type: AssetType.CAMERA,
    name: "Block Stance",
    thumbnail: "resources/characters/img01.png",
  },
]);

export const characterItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Block Stance",
    thumbnail: "resources/characters/img01.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Elbow",
    thumbnail: "resources/characters/img02.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Stand Up",
    thumbnail: "resources/characters/img03.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Wave Sitting",
    thumbnail: "resources/characters/img04.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Idle",
    thumbnail: "resources/characters/img05.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Dancing",
    thumbnail: "resources/characters/img06.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Start Walking",
    thumbnail: "resources/characters/img07.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Start Fight",
    thumbnail: "resources/characters/img08.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Some Char",
    thumbnail: "resources/characters/img09.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Dancing 2",
    thumbnail: "resources/characters/img10.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Start Fight 2",
    thumbnail: "resources/characters/img11.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CHARACTER,
    name: "Dancing 3",
    thumbnail: "resources/characters/img12.png",
  },
]);

export const objectItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_w5nn3kjh1fbkmjrdac5b2qaba0pmyt",
    type: AssetType.OBJECT,
    name: "Block Stance",
    thumbnail: "resources/characters/img01.png",
  },
]);

export const shapeItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_w5nn3kjh1fbkmjrdac5b2qaba0pmyt",
    type: AssetType.CAMERA,
    name: "Block Stance",
    thumbnail: "resources/characters/img01.png",
  },
]);
