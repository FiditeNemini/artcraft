import { signal } from "@preact/signals-core";
import { ActiveJob } from "~/pages/PageEnigma/models";
import { MediaInfo } from "~/pages/PageEnigma/models/movies";

export const viewMyMovies = signal(false);

export const activeJobs = signal<{ jobs: ActiveJob[] }>({ jobs: [] });
export const movies = signal<{ movies: MediaInfo[] }>({ movies: [] });
