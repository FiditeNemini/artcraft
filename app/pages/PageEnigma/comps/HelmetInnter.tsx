import { useContext } from "react";
import { faSparkles } from "@fortawesome/pro-solid-svg-icons";
import { Button } from "~/components";
import { EngineContext } from "../contexts/EngineContext";

export const HelmetInner = () => {
    const engineContext = useContext(EngineContext);

    const handleGenerateVideo = () => {
        console.log(engineContext)
        engineContext?.generateVideo();
    }

    return ( 
        <Button icon={faSparkles} onClick={handleGenerateVideo}>Generate Movie</Button>
    )
}