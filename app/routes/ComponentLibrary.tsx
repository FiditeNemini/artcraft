import { 
  Button,
  ButtonLink,
  H4, 
  LoadingBar
} from "~/components";


export default function ComponentLibrary () {
  return(
    <div className='bg-ui-panel w-10/12 max-w-7xl h-full min-h-96 mx-auto my-6 rounded-lg p-6'>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Buttons</H4>
        <div className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>ButtonLink</H4>
        <ButtonLink to="/">Back to /</ButtonLink>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <H4>Loading Bar</H4>
        <LoadingBar />
      </div>
    </div>
  );
};