import React, { useEffect, useRef }  from 'react';

interface Props {
  spectrogramJsonLink: string  
}

function SpectrogramFc(props: Props) {

  const canvasRef = useRef(null);

  let width = 150 * 3;
  let height = 80 * 3;

  let calculatePixels = () : Uint8ClampedArray => {
    let bytes = new Uint8ClampedArray(width * height * 4);

    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
        let k =  i + j * width;
        bytes[k] = 0;
        bytes[k+1] = 255;
        bytes[k+2] = 0;
        bytes[k+3] = 0;

      }
    }

    return bytes;
  }

  let updateCanvas = (ctx: any, frameCount: number) => {
    console.log('getting context...')
    //const ctx = (canvasRef as any).getContext('2d');
    //const canvas = canvasRef.current as any;
    //const ctx = canvas.getContext('2d')

    // let width = 300;
    // let height = 80;
    // ctx.clearRect(0,0, width, height);

    //if (this.props.currentSpectrogram !== undefined) {
    //  //let width = this.props.currentSpectrogram!.width;
    //  //let height = this.props.currentSpectrogram!.height;

    //  let pixels = currentSpectrogram.calculatePixelsForMode(this.props.spectrogramMode);

    //  var image = new ImageData(pixels, width, height);

    //  createImageBitmap(image).then(renderer => {
    //    ctx.drawImage(renderer, 0, 0, width * 3, height * 3)
    //  });
    //}

    console.log('getting pixels...')
    let pixels = calculatePixels();

    console.log('setting image data...')
    var image = new ImageData(pixels, width, height);

    console.log('creating color bitmap...')
    createImageBitmap(image).then(renderer => {
      ctx.drawImage(renderer, 0, 0, width * 3, height * 3)
    });
  }

  let draw = (ctx: any, frameCount: any) => {

        //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        //ctx.fillStyle = '#000000'
        //ctx.beginPath()
        //ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
        //ctx.fill()


        //let img = new Image();
        //ctx.drawImage(img, 0, 0);

        //////const imageData = ctx.getImageData(0, 0, width, height);
        //////const data = imageData.data;

        //////for (var i = 0; i < data.length; i += 4) {
        //////    data[i]     = 255; // red
        //////    data[i + 1] = 0; // green
        //////    data[i + 2] = 155; // blue
        //////}
        //////ctx.putImageData(imageData, 0, 0);

        let r = 0;
        let g = 200;
        let b = 250;
        let a = 100;
        ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

        for(let x = 0; x < width; x++) {
            for(let y = 0; y < height; y++) {
                ctx.fillRect( x, y, 1, 1 );
            }
        }

  }

  useEffect(() => {
    //const api = new ApiConfig();
    //const endpointUrl = api.viewTtsInferenceResult(token);

    fetch(props.spectrogramJsonLink, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log('got spectrogram', res);
      //updateCanvas();



        const canvas = canvasRef.current as any;
        const context = canvas.getContext('2d')

        let frameCount = 0
        let animationFrameId : any = undefined;
        
        const render = () => {
        //console.log('render');
        frameCount++
        draw(context, frameCount)

            //let pixels = calculatePixels();
            //var image = new ImageData(pixels, width, height);


            //console.log('creating color bitmap...')
            //createImageBitmap(image).then(renderer => {
            //    context.drawImage(renderer, 0, 0, width * 3, height * 3)
            //});


        animationFrameId = window.requestAnimationFrame(render)
        }
        render()
        
        return () => {
        window.cancelAnimationFrame(animationFrameId)
        }




    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });


  }, []); // NB: Empty array dependency sets to run ONLY on mount


  //if (this.props.currentSpectrogram !== undefined) {
  //  width = this.props.currentSpectrogram.width * 3;
  //  height = this.props.currentSpectrogram.height * 3;
  //}

  //let nextMode = nextSpectrogramMode(this.props.spectrogramMode);

  // TODO: This needs to go way up the tree.
  //onClick={() => this.props.changeSpectrogramMode(nextMode)}
  let canvas = <canvas 
    ref={canvasRef} 
    width={width}
    height={height}
    id="spectrogram"
    />

  return (
    <div>
      {canvas}
      <p>(Click or tap to change spectrogram theme.)</p>
    </div>
  )
}

export { SpectrogramFc };
