import { useState } from 'react';
import { PageEnigma } from "../pages/PageEnigma";

export default function Cube(){
  const [riddle, setRiddle] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleInput = (event:React.ChangeEvent<HTMLInputElement>)=>{
    setRiddle(event.target.value);
  }

 const handleSubmit = () => {
    const state = riddle.length > 5 && riddle[riddle.length-1] === "!";
    setSubmitted(state);
  }

  if(submitted){
    return <PageEnigma />
  }else{
    return(
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={riddle} onChange={handleInput} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
  
}