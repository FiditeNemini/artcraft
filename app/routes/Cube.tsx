import { useState } from 'react';
import { PageCube } from "../pages/PageCube";
import { Button } from '~/components';

export default function Cube(){
  const pausedRiddle = true;
  const [riddle, setRiddle] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleInput = (event:React.ChangeEvent<HTMLInputElement>)=>{
    setRiddle(event.target.value);
  }

 const handleSubmit = () => {
    const state = riddle.length > 5 && riddle[riddle.length-1] === "!";
    if(state)
      setSubmitted(state);
    else
      alert("What is the price for your blind eye?")
  }

  if(submitted || pausedRiddle){
    return <PageCube />
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