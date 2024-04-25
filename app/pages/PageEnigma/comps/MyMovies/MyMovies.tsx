import { TransitionDialogue } from "~/components";
import { activeJobs, movies, viewMyMovies } from "~/pages/PageEnigma/store";
import { CompletedCard } from "~/pages/PageEnigma/comps/MyMovies/CompletedCard";
import { InProgressCard } from "~/pages/PageEnigma/comps/MyMovies/InProgressCard";
import { useSignals } from "@preact/signals-react/runtime";

export function MyMovies() {
  useSignals();

  return (
    <TransitionDialogue
      title="My Movies"
      isOpen={viewMyMovies.value}
      width={850}
      onClose={() => (viewMyMovies.value = false)}>
      {activeJobs.value.jobs.length > 0 && (
        <div className="mb-8">
          <div className="mb-4">In Progress</div>
          {activeJobs.value.jobs.map((movie) => (
            <InProgressCard key={movie.job_token} movie={movie} />
          ))}
        </div>
      )}
      <div>
        <div className="mb-4">Completed</div>
        <div className="h-[500px] overflow-y-auto">
          {movies.value.movies.map((movie) => (
            <CompletedCard key={movie.token} movie={movie} />
          ))}
        </div>
      </div>
    </TransitionDialogue>
  );
}
