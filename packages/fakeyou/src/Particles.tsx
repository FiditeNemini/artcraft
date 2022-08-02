import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "./particles.json";
import { ISourceOptions } from "tsparticles-engine";

function ParticlesBG() {
  let options = particlesOptions

  function checkDownloadSpeed() {
    const startTime = (new Date()).getTime();
    let endTime: any;

    window.onload = function () {
      endTime = (new Date()).getTime()

      if ((endTime - startTime) < 500) options.particles.number.value = 70
    }

    window.onerror = function (err, msg) {
      console.log('error checking speed')
    }
  }

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
    checkDownloadSpeed();
  }, []);

  return (
    <div id="particles-container">
      <Particles
        options={options as ISourceOptions}
        init={particlesInit}
      />
    </div>
  );
}

export default ParticlesBG;
