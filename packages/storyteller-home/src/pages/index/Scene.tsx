import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
}

function Scene(props: Props) {
  const mountRef = useRef(null);

  /*const [isPlaying, setIsPlaying] = useState(false);

  const scene = useRef(function() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

  }());*/

  useEffect(() => {
    if (mountRef.current === null) {
      return;
    }

    // NB: Width of the div.
    // We were already using a div to attach the animation context, but it
    // also works for determining the width, per: 
    // https://thewebdev.info/2021/05/24/how-to-get-the-width-of-an-element-in-a-react-component/
    const width = (mountRef.current as any).offsetWidth;
    const height = 300;
    //const perspective = window.innerWidth / window.innerHeight;
    const perspective = width / height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, perspective, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true, // transparent bg
    });

    
    renderer.setSize(width, height);
    
    (mountRef.current as any).appendChild(renderer.domElement);
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    
    scene.add(cube);
    camera.position.z = 5;
    
    const animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    
    animate();

    return () => (mountRef.current as any).removeChild(renderer.domElement);
  }, []);


  return (
    <div ref={mountRef}></div>
  );
}

export default Scene;
