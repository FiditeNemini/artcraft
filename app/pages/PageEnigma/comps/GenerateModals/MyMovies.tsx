import {
  activeJobs,
  generateMovieId,
  movies,
  viewMyMovies,
} from "~/pages/PageEnigma/store";
import { CompletedCard } from "~/pages/PageEnigma/comps/GenerateModals/CompletedCard";
import { InProgressCard } from "~/pages/PageEnigma/comps/GenerateModals/InProgressCard";
import { useSignals } from "@preact/signals-react/runtime";
import { faFilm } from "@fortawesome/pro-solid-svg-icons";
import { TransitionDialogue } from "~/components";

interface Props {
  setMovieId: (page: string) => void;
}

export function MyMovies({ setMovieId }: Props) {
  useSignals();

  return (
    <TransitionDialogue
      title="My Movies"
      titleIcon={faFilm}
      className="max-w-4xl"
      childPadding={false}
      isOpen={viewMyMovies.value}
      onClose={() => {
        setMovieId("");
        viewMyMovies.value = false;
      }}>
      <div className="h-[560px] overflow-y-auto overflow-x-hidden rounded-b-lg">
        {activeJobs.value.jobs.length > 0 && (
          <div className="mb-3">
            <div className="mx-5 mb-1 font-medium">In Progress</div>
            {activeJobs.value.jobs.map((movie) => (
              <InProgressCard key={movie.job_token} movie={movie} />
            ))}
          </div>
        )}
        <div>
          <div className="mx-5 mb-1 font-medium">Completed</div>
          <div className="flex flex-col">
            {movies.value.movies.map((movie) => (
              <CompletedCard
                key={movie.token}
                movie={movie}
                setMovieId={setMovieId}
              />
            ))}
          </div>
        </div>
      </div>
    </TransitionDialogue>
  );
}
