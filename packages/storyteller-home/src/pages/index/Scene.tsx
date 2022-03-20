import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

//import { PCDLoader } from '@loaders.gl/pcd';
//import {load} from '@loaders.gl/core';
import { PCDLoader } from './PCDLoader';
import { OrbitControls } from './OrbitControls';

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

    //const aspect= window.innerWidth / window.innerHeight;
    const aspect = width / height;

    const scene = new THREE.Scene();

    //const camera = new THREE.PerspectiveCamera(75, perspective, 0.1, 1000);
    const camera = new THREE.PerspectiveCamera(30, aspect, 0.01, 40);
    camera.position.set( 0, 0, 1 );
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      alpha: true, // transparent bg
    });

    function render() {
      renderer.render( scene, camera );
    }

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    renderer.setSize(width, height);
    
    (mountRef.current as any).appendChild(renderer.domElement);
    
    //const geometry = new THREE.BoxGeometry(1, 1, 1);
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //const cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);
    
    const animate = function () {
      requestAnimationFrame(animate);
      //cube.rotation.x += 0.01;
      //cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    
    animate();

    // instantiate a loader
    const loader = new PCDLoader();

    // load a resource
    loader.load(
      // resource URL
      '/assets/temp.pcd',
      // called when the resource is loaded
      function ( mesh  : any ) {
        mesh.geometry.center();
        mesh.geometry.rotateX( Math.PI );
        scene.add( mesh );
        mesh.material.color.setHex( 0xffffff );
        //mesh.scale.x = 3;
        //mesh.position.x = 0;
      },
      // called when loading is in progresses
      function ( xhr : any ) {
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error : any) {
        console.log( 'An error happened' );
      }
    );

    /*async function doLoad() {
      const url = '/assets/temp.pcd';
      const options = {};
      const data = await load(url, PCDLoader, options);

      console.log('loaded pcd', data);

      scene.add(data);
    }
    doLoad();
    */


    return () => (mountRef.current as any).removeChild(renderer.domElement);
  }, []);


  return (
    <div ref={mountRef}></div>
  );
}

export default Scene;
