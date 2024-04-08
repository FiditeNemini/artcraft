import { signal } from "@preact/signals-core";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
import * as uuid from "uuid";

export const animationItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_yzreg1494d08aepezj74607d2ascep",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Sit",
    thumbnail: "resources/characters/img04.png",
    isMine: true,
  },
  {
    version: 1,
    media_id: "m_qepzjytd4ahd5askdt2ngrwzj2aa3f",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Idle",
    thumbnail: "resources/characters/img07.png",
    isBookmarked: true,
  },
  {
    version: 1,
    media_id: "m_s7d4ems68sb2vqj4pdje1rc15q3ycp",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Walk",
    thumbnail: "resources/characters/img07.png",
  },
  {
    version: 1,
    media_id: "m_v06h821hj4dvst0mzm575jdka31f41",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Punch",
    thumbnail: "resources/characters/img08.png",
  },
  {
    version: 1,
    media_id: "m_q92keqa05gds69zyd8mkep7z9338t8",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Jump",
    thumbnail: "resources/characters/img06.png",
  },
  {
    version: 1,
    media_id: "m_0qmgsyxh5ng9c9ac3m0snzdqqs5q60",
    type: AssetType.ANIMATION,
    length: 100,
    name: "Dance",
    thumbnail: "resources/characters/img11.png",
  },
]);

export const audioItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_403phjvjkbbaxxbz8y7r6qjay07mfd",
    type: AssetType.AUDIO,
    length: 25,
    name: "Talk (Demo Sounds)",
    thumbnail: "resources/placeholders/audio_placeholder.png"
  },
  {
    version: 1,
    media_id: "m_w5nn3kjh1fbkmjrdac5b2qaba0pmyt",
    type: AssetType.AUDIO,
    length: 25,
    name: "NCS Song",
    thumbnail: "resources/placeholders/audio_placeholder.png"
  }
]);

export const cameraItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CAMERA,
    name: "Portrait Zoom Out",
    thumbnail: "resources/placeholders/placeholder.png",
  },
  {
    version: 1,
    media_id: uuid.v4(),
    type: AssetType.CAMERA,
    name: "Pan Left and Right",
    thumbnail: "resources/placeholders/placeholder.png",
  },
]);

export const characterItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_fmxy8wjnep1hdaz7qdg4n7y15d2bsp",
    type: AssetType.CHARACTER,
    name: "Shrek",
    thumbnail: "resources/placeholders/placeholder.png",
  },
  {
    version: 1,
    media_id: "m_9f3d3z94kk6m25zywyz6an3p43fjtw",
    type: AssetType.CHARACTER,
    name: "Stick Man",
    thumbnail: "resources/placeholders/placeholder.png",
  },
  {
    version: 1,
    media_id: "m_r7w1tmkx2jg8nznr3hyzj4k6zhfh7d ",
    type: AssetType.CHARACTER,
    name: "Female Doll",
    thumbnail: "resources/characters/img03.png",
  },
  {
    version: 1,
    media_id: "m_9sqg0evpr23587jnr8z3zsvav1x077 ",
    type: AssetType.CHARACTER,
    name: "Male Doll",
    thumbnail: "resources/characters/img03.png",
  },
  {
    version: 1,
    media_id: "m_4wva09qznapzk5rcvbxy671d1qx2pr ",
    type: AssetType.CHARACTER,
    name: "Story Girl",
    thumbnail: "resources/characters/img13.png",
  },
]);

export const objectItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "m_0xfrmekc56satjxn66wt6c9dkw7dxe",
    type: AssetType.OBJECT,
    name: "Pikachu Statue",
    thumbnail: "resources/placeholders/placeholder.png",
  },
]);
// In the future these will have shape id's
export const shapeItems = signal<MediaItem[]>([
  {
    version: 1,
    media_id: "",
    type: AssetType.SHAPE,
    name: "Cube",
    thumbnail: "resources/placeholders/placeholder.png",
  },
]);
