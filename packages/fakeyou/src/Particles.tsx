import React, { useCallback, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "./particles.json";
import { ISourceOptions } from "tsparticles-engine";

function ParticlesBG() {
  let [particleCount, setParticleCount] = useState(0);

  const checkDownloadSpeed = useCallback(() => {
    const startTime = (new Date()).getTime();
    let endTime: any;

    window.onload = function () {
      endTime = (new Date()).getTime()

      if ((endTime - startTime) < 750) {
        setParticleCount(70);
      }
    }

    window.onerror = function (err, msg) {
      console.log('error checking speed')
    }
  }, [setParticleCount]);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
    checkDownloadSpeed();
  }, [checkDownloadSpeed]);

  // NB(echelon): Stupid hack to deep copy object
  const optionsCopy = JSON.parse(JSON.stringify(particlesOptions));
  optionsCopy.particles.number.value = particleCount;

  return (
    <div id="particles-container">
      <Particles
        options={optionsCopy as ISourceOptions}
        init={particlesInit}
      />
    </div>
  );
}

export default ParticlesBG;
