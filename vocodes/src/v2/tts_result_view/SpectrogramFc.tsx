import React, { useEffect, useRef, useState }  from 'react';

interface Props {
  spectrogramJsonLink: string  
}

interface SpectrogramResponse {
  mel: Array<Array<number>>,
  mel_postnet: Array<Array<number>>,
  mel_for_scaling: Array<Array<number>>,
}

function SpectrogramFc(props: Props) {

  const canvasRef = useRef(null);
  const [maxSpectrogramValue, setMaxSpectrogramValue] = useState(-1000000.0);
  const [minSpectrogramValue, setMinSpectrogramValue] = useState(1000000.0);

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

  let draw = (ctx: any, data: any) => {

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

        for(let x = 0; x < data.length; x++) {
            for(let y = 0; y < data[0].length; y++) {
                let value = data[x][y] as any;
                console.log(value);
                ctx.fillRect( x, y, 1, 1 );
            }
        }

  }

  let linearizeImage = (image: Array<Array<number>>) : Uint8ClampedArray => {
    let width = image.length;
    let height = image[0].length;
    let size = width * height * 4;

    let bytes = new Uint8ClampedArray(size);


    // This works and makes a red rectangle
    //for (let k = 0; k < size; k += 4) {
    //    bytes[k] = 255;
    //    bytes[k+1] = 0;
    //    bytes[k+2] = 0;
    //    bytes[k+3] = 255;
    //}

    // origin is bottom left
    //for (let k = 0; k < size; k += 4) {
    //    let value = (k % 255);
    //    bytes[k] = k;
    //    bytes[k+1] = k;
    //    bytes[k+2] = k;
    //    bytes[k+3] = 255;
    //}


    let k = 0;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let value = image[i][j];

        //let k = i * width + j; // Blue vertical line at end
        //let k = j * height + i;


        bytes[k] = value;
        bytes[k+1] = value;
        bytes[k+2] = value;
        bytes[k+3] = 255;

        k += 4;
      }
    }

    return bytes;
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
      let spectrograms = res as SpectrogramResponse;

//      for (let i = 0; i < spectrograms.mel_postnet.length; i++) {
//        for (let j = 0; j < spectrograms.mel_postnet[i].length; j++) {
//          let value = spectrograms.mel_postnet[i][j];
//          if (value > maxSpectrogramValue) {
//            console.log('set max to', value);
//            setMaxSpectrogramValue(value);
//          } else if (value < minSpectrogramValue) {
//            console.log('set to', value);
//            setMinSpectrogramValue(value);
//          }
//        }
//      }
//
      console.log('min value:', minSpectrogramValue);
      let width = spectrograms.mel_for_scaling.length;
      let height = spectrograms.mel_for_scaling[0].length;

      let pixels = linearizeImage(spectrograms.mel_for_scaling);
      
      console.log('max value:', maxSpectrogramValue);

      var image = new ImageData(pixels, width, height);

      const canvas = canvasRef.current as any;
      const context = canvas.getContext('2d')

      createImageBitmap(image).then(renderer => {
        context.drawImage(renderer, 0, 0, width * 3, height * 3)
      });




//        const canvas = canvasRef.current as any;
//        const context = canvas.getContext('2d')
//
//        let frameCount = 0
//        let animationFrameId : any = undefined;
//        
//        const render = () => {
//        //console.log('render');
//        frameCount++
//        draw(context, data)
//
//            //let pixels = calculatePixels();
//            //var image = new ImageData(pixels, width, height);
//
//
//            //console.log('creating color bitmap...')
//            //createImageBitmap(image).then(renderer => {
//            //    context.drawImage(renderer, 0, 0, width * 3, height * 3)
//            //});
//
//
//        animationFrameId = window.requestAnimationFrame(render)
//        }
//        render()
//        
//        return () => {
//        window.cancelAnimationFrame(animationFrameId)
//        }
//



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
