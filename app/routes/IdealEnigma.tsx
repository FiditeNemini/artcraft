import { useState } from 'react';
import { PageEnigma } from "../pages/PageEnigma";

import { Button } from '~/components/Button';

export default function IdealEnigma(){
  //const [riddle, setRiddle] = useState<string>("");
  //const [submitted, setSubmitted] = useState<boolean>(false);

  //const handleInput = (event:React.ChangeEvent<HTMLInputElement>)=>{
  //  setRiddle(event.target.value);
  //}

  //const handleSubmit = () => {
  //  const state = riddle.length > 5 && riddle[riddle.length-1] === "!";
  //  setSubmitted(state);
  //}

  
  return <PageEnigma />
  if(submitted){
    return <PageEnigma />
  }else{
    return(
      <div className="w-full flex justify-center content-center">
        <form 
          className="mt-20 flex flex-col content-center"
          onSubmit={handleSubmit}
        >
          <label className='text-white'>
            Riddle:
          </label>
          <input type="text" value={riddle} onChange={handleInput} />
          <br/>
          <Button type="submit" className='text-white'>Submit</Button>
        </form>
      </div>

    );
  }
  
}