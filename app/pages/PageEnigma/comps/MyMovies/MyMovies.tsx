import { TransitionDialogue } from "~/components";
import { activeJobs, movies, viewMyMovies } from "~/pages/PageEnigma/store";
import { CompletedCard } from "~/pages/PageEnigma/comps/MyMovies/CompletedCard";
import { InProgressCard } from "~/pages/PageEnigma/comps/MyMovies/InProgressCard";
import { useSignals } from "@preact/signals-react/runtime";
import { faFilm } from "@fortawesome/pro-solid-svg-icons";

export function MyMovies() {
  useSignals();

  return (
    <TransitionDialogue
      title="My Movies"
      titleIcon={faFilm}
      className="max-w-4xl"
      childPadding={false}
      isOpen={viewMyMovies.value}
      onClose={() => (viewMyMovies.value = false)}>
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
              <CompletedCard key={movie.token} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </TransitionDialogue>
  );
}
