import { useContext, useEffect, useState } from "react";
import { faSparkles } from "@fortawesome/pro-solid-svg-icons";
import { TopBarHelmet } from "~/modules/TopBarHelmet/TopBarHelmet";
import { Button } from "~/components";
import { EngineContext } from "../contexts/EngineContext";

export const Helmet = () => {
  const [helmetKey, setHelmetKey] = useState<number>(Date.now());
  const engineContext = useContext(EngineContext);
  
  const handleGenerateVideo = () => {
    engineContext?.generateVideo();
  };
  
  useEffect(()=>{
    setHelmetKey(Date.now());
  },[engineContext]);

  return (
    <TopBarHelmet key={helmetKey}>
      <Button icon={faSparkles} onClick={handleGenerateVideo}>Generate Movie</Button>
    </TopBarHelmet>
  );
}