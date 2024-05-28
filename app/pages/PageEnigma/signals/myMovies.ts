import { signal } from "@preact/signals-core";

import { MediaInfo } from "~/pages/PageEnigma/models/movies";

export const viewMyMovies = signal(false);
export const generateMovieId = signal("");

export const myMovies = signal<MediaInfo[] | undefined>(undefined);

export const setMyMovies = (newSet: MediaInfo[]) => {
  myMovies.value = newSet;
};

export const shouldPollMyMovies = signal<boolean>(true);
