import asyncio
import base64
import json
import logging
import pathlib
import time
from io import BytesIO
from typing import Dict, Any, Optional, Tuple, Callable, List

import torch
import websockets
from PIL import Image
from diffusers import (
    StableDiffusionXLPipeline,
    StableDiffusionXLImg2ImgPipeline,
    AutoPipelineForImage2Image,
    LCMScheduler,
    UNet2DConditionModel,
)
from tqdm import tqdm
from huggingface_hub import HfApi, hf_hub_download

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
connected = False
pipe = None
model_initialized = False
current_settings = {}

# Custom TQDMProgressCallback for tracking download progress
class ProgressCallback:
    def __init__(self, websocket):
        self.websocket = websocket
        self.total = 0
        self.current = 0
        self.last_update_time = 0
        self.last_progress = 0
        self.stage = "downloading"
        self.current_file = ""
    
    async def __call__(self, current, total, file_name=""):
        self.total = total
        self.current = current
        self.current_file = file_name or self.current_file
        
        # Only send updates at most once every 500ms to avoid flooding the connection
        current_time = time.time()
        progress = int(100 * current / total) if total > 0 else 0
        
        if (current_time - self.last_update_time > 0.5 and progress != self.last_progress) or current >= total:
            self.last_update_time = current_time
            self.last_progress = progress
            
            await self.websocket.send(json.dumps({
                'type': 'progress_update',
                'stage': self.stage,
                'progress': progress,
                'file': self.current_file
            }))

# Pure functions
def decode_base64_to_image(base64_string: str) -> Image.Image:
    """Decode a base64 string to a PIL Image."""
    try:
        image_data = base64.b64decode(base64_string)
        return Image.open(BytesIO(image_data))
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        raise ValueError(f"Invalid base64 image: {e}")

def encode_image_to_base64(image: Image.Image) -> str:
    """Encode a PIL Image to a base64 string."""
    try:
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image to base64: {e}")
        raise ValueError(f"Error encoding image: {e}")

async def load_model(sdxl_checkpoint_path: pathlib.Path, progress_callback: Optional[ProgressCallback] = None) -> Tuple[AutoPipelineForImage2Image, bool]:
    """Load the SDXL model with LCM scheduler and report progress."""
    try:
        logger.info(f"Loading model from {sdxl_checkpoint_path}")
        
        if progress_callback:
            progress_callback.stage = "loading_unet"
            progress_callback.current_file = "latent-consistency/lcm-sdxl"
            await progress_callback(0, 100)
        
        # Load the UNet with LCM
        unet = UNet2DConditionModel.from_pretrained(
            "latent-consistency/lcm-sdxl",
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True,
        )
        
        if progress_callback:
            progress_callback.stage = "loading_base_model"
            progress_callback.current_file = str(sdxl_checkpoint_path)
            await progress_callback(25, 100)
        
        # Load the base model using the checkpoint path
        pipe = AutoPipelineForImage2Image.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            unet=unet,
            torch_dtype=torch.float16,
            variant="fp16",
           use_safetensors=True
        ).to("cuda")
        
        if progress_callback:
            progress_callback.stage = "configuring_scheduler"
            await progress_callback(75, 100)
        
        # Replace the scheduler with LCM scheduler
        pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
        
        if progress_callback:
            progress_callback.stage = "loading_lcm_adapter"
            progress_callback.current_file = "latent-consistency/lcm-lora-sdxl"
            await progress_callback(85, 100)
        
        # Load the default LCM adapter
        pipe.load_lora_weights("latent-consistency/lcm-lora-sdxl", adapter_name="lcm",from_safetensors=True)
        
        if progress_callback:
            await progress_callback(100, 100)
        
        return pipe, True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        if progress_callback:
            progress_callback.stage = "error"
            progress_callback.current_file = str(e)
            await progress_callback(0, 100)
        return None, False

async def load_lora(pipe: AutoPipelineForImage2Image, lora_path: pathlib.Path, adapter_name: str = "lora", progress_callback: Optional[ProgressCallback] = None) -> bool:
    """Load a LoRA adapter into the pipeline and report progress."""
    try:
        logger.info(f"Loading LoRA from {lora_path} as {adapter_name}")
        
        if progress_callback:
            progress_callback.stage = "loading_lora"
            progress_callback.current_file = str(lora_path)
            await progress_callback(0, 100)
        
        # Load the LoRA weights
        pipe.load_lora_weights(lora_path, adapter_name=adapter_name)
        
        if progress_callback:
            await progress_callback(100, 100)
            
        return True
    except Exception as e:
        logger.error(f"Error loading LoRA: {e}")
        if progress_callback:
            progress_callback.stage = "error"
            progress_callback.current_file = str(e)
            await progress_callback(0, 100)
        return False

def generate_image(
    pipe: AutoPipelineForImage2Image,
    image: Image.Image,
    prompt: str,
    lora_strength: float = 1.0,
    image_to_image_strength: float = 1.0,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 4,
    guidance_scale: float = 1.0,
    seed: Optional[int] = None
) -> Optional[Image.Image]:
    """Generate an image using the LCM model."""
    try:
        # Resize input image to match desired dimensions
        image = image.resize((width, height))
        
        # Set up generator for reproducibility if seed is provided
        generator = torch.manual_seed(seed) if seed is not None else None
        
        # Set lora adapter weights if available
        if hasattr(pipe, 'set_adapters') and len(pipe.adapters) > 0:
            # If we have both lcm and lora adapters
            if "lcm" in pipe.adapters and "lora" in pipe.adapters:
                pipe.set_adapters(["lcm", "lora"], adapter_weights=[1.0, lora_strength])
            # If we only have lcm adapter
            elif "lcm" in pipe.adapters:
                pipe.set_adapters(["lcm"], adapter_weights=[1.0])
        
        # Generate the image
        result = pipe(
            prompt=prompt,
            image=image,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            strength=image_to_image_strength,
            width=width,
            height=height,
            generator=generator
        )
        
        return result.images[0]
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        return None

async def handle_client(websocket):
    """Handle a client connection."""
    global connected, pipe, model_initialized, current_settings
    
    if connected:
        await websocket.send(json.dumps({
            'type': 'connection_error',
            'error': "Another client is already connected"
        }))
        await websocket.close(1008, "Another client is already connected")
        return
    
    connected = True
    logger.info("Client connected")
    
    # Create a progress callback for this connection
    progress_callback = ProgressCallback(websocket)
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                logger.info(f"Received message type: {data.get('type', 'unknown')}")
                logger.info(f"Full payload: {json.dumps(data, indent=2)}")
                
                # Check message type
                message_type = data.get('type', '')
                
                # Handle setup request - initializes the model and settings
                if message_type == 'setup':
                    logger.info("Processing setup message")
                    model_data = data.get('model', {})
                    lora_data = data.get('lora')
                    device = data.get('device', 'cuda')
                    
                    logger.info(f"Model data: {json.dumps(model_data, indent=2)}")
                    logger.info(f"LoRA data: {json.dumps(lora_data, indent=2) if lora_data else 'None'}")
                    logger.info(f"Device: {device}")
                    
                    # Extract setup parameters with detailed logging
                    model_path = model_data.get('path', '')
                    logger.info(f"Raw model path from message: '{model_path}'")
                    
                    # Check if the path is valid
                    if not model_path:
                        logger.error("Model path is empty")
                        await websocket.send(json.dumps({
                            'type': 'setup_response',
                            'success': False,
                            'error': 'Model path is required'
                        }))
                        continue
                    
                    # Convert to Path object
                    sdxl_checkpoint_path = pathlib.Path(model_path)
                    logger.info(f"Converted to pathlib.Path: '{sdxl_checkpoint_path}'")
                    logger.info(f"Path is absolute: {sdxl_checkpoint_path.is_absolute()}")
                    logger.info(f"Path exists check: {sdxl_checkpoint_path.exists()}")
                    
                    # If the path exists as a file
                    if sdxl_checkpoint_path.is_file():
                        logger.info(f"Path is a file: Yes")
                        logger.info(f"File size: {sdxl_checkpoint_path.stat().st_size / (1024*1024):.2f} MB")
                    else:
                        logger.info(f"Path is a file: No")
                    
                    # Store current settings
                    current_settings = {
                        'sdxl_checkpoint_path': str(sdxl_checkpoint_path),
                        'lora_path': str(lora_data['path']) if lora_data else None,
                        'lora_alpha': float(lora_data['alpha']) if lora_data else 1.0,
                        'device': device
                    }
                    logger.info(f"Current settings: {json.dumps(current_settings, indent=2)}")
                    
                    # Validate required parameters
                    if not sdxl_checkpoint_path.exists():
                        logger.error(f"Path does not exist: {sdxl_checkpoint_path}")
                        # Try alternative path format
                        alt_path = pathlib.Path(model_path.replace('\\', '/'))
                        logger.info(f"Trying alternative path format: {alt_path}")
                        logger.info(f"Alternative path exists check: {alt_path.exists()}")
                        
                        if alt_path.exists():
                            logger.info("Using alternative path format")
                            sdxl_checkpoint_path = alt_path
                        else:
                            await websocket.send(json.dumps({
                                'type': 'setup_response',
                                'success': False,
                                'error': f'SDXL checkpoint path does not exist: {sdxl_checkpoint_path}'
                            }))
                            continue
                    
                    # Load the model with progress reporting
                    logger.info(f"Loading model from: {sdxl_checkpoint_path}")
                    pipe, success = await load_model(sdxl_checkpoint_path, progress_callback)
                    
                    if not success:
                        await websocket.send(json.dumps({
                            'type': 'setup_response',
                            'success': False,
                            'error': 'Failed to load model'
                        }))
                        continue
                    
                    # Load LoRA if specified
                    lora_success = True
                    if lora_data and lora_data['path'] and pathlib.Path(lora_data['path']).exists():
                        lora_success = await load_lora(pipe, pathlib.Path(lora_data['path']), progress_callback=progress_callback)
                        if not lora_success:
                            await websocket.send(json.dumps({
                                'type': 'setup_response',
                                'success': False,
                                'error': f'Failed to load LoRA from {pathlib.Path(lora_data["path"])}'
                            }))
                            continue
                    
                    model_initialized = True
                    await websocket.send(json.dumps({
                        'type': 'setup_response',
                        'success': True,
                        'message': 'Model initialized successfully',
                        'settings': current_settings
                    }))
                
                # Handle settings update - changes settings without full reinitialization
                elif message_type == 'update_settings':
                    if not model_initialized:
                        await websocket.send(json.dumps({
                            'type': 'update_settings_response',
                            'success': False,
                            'error': 'Model not initialized. Send a setup request first.'
                        }))
                        continue
                    
                    settings_data = data.get('settings', {})
                    updates_applied = []
                    errors = []

                    # Check for LoRA path update
                    if 'lora_path' in settings_data and settings_data['lora_path'] != current_settings.get('lora_path'):
                        new_lora_path = pathlib.Path(settings_data['lora_path']) if settings_data['lora_path'] else None
                        
                        if new_lora_path and new_lora_path.exists():
                            # Load the new LoRA with progress reporting
                            lora_success = await load_lora(pipe, new_lora_path, progress_callback=progress_callback)
                            if lora_success:
                                current_settings['lora_path'] = str(new_lora_path)
                                updates_applied.append('lora_path')
                            else:
                                errors.append(f'Failed to load LoRA from {new_lora_path}')
                        elif new_lora_path:
                            errors.append(f'LoRA path does not exist: {new_lora_path}')
                        else:
                            # If LoRA path is None, we'll just update the setting
                            current_settings['lora_path'] = None
                            updates_applied.append('lora_path')
                    
                    # Handle any other settings that can be updated without reloading the model
                    # For example, default generation parameters
                    for param in ['default_lora_strength', 'default_image_to_image_strength',
                                 'default_width', 'default_height', 'default_steps',
                                 'default_guidance_scale']:
                        if param in settings_data:
                            current_settings[param] = settings_data[param]
                            updates_applied.append(param)
                    
                    # Send response
                    if errors:
                        await websocket.send(json.dumps({
                            'type': 'update_settings_response',
                            'success': False,
                            'error': ', '.join(errors),
                            'updates_applied': updates_applied,
                            'current_settings': current_settings
                        }))
                    else:
                        await websocket.send(json.dumps({
                            'type': 'update_settings_response',
                            'success': True,
                            'message': 'Settings updated successfully',
                            'updates_applied': updates_applied,
                            'current_settings': current_settings
                        }))
                
                # Handle generation request
                elif message_type == 'generate':
                    if not model_initialized:
                        await websocket.send(json.dumps({
                            'type': 'generate_response',
                            'success': False,
                            'error': 'Model not initialized. Send a setup request first.'
                        }))
                        continue
                    
                    generate_data = data.get('generate', {})
                    
                    # Extract generation parameters
                    base64_image = generate_data.get('image')
                    prompt = generate_data.get('prompt', '')
                    
                    # Use default settings if not provided
                    lora_strength = float(generate_data.get('lora_strength', current_settings.get('default_lora_strength', 1.0)))
                    image_to_image_strength = float(generate_data.get('image_to_image_strength', current_settings.get('default_image_to_image_strength', 1.0)))
                    width = int(generate_data.get('generated_image_width', current_settings.get('default_width', 1024)))
                    height = int(generate_data.get('generated_image_height', current_settings.get('default_height', 1024)))
                    num_inference_steps = int(generate_data.get('num_inference_steps', current_settings.get('default_steps', 4)))
                    guidance_scale = float(generate_data.get('guidance_scale', current_settings.get('default_guidance_scale', 1.0)))
                    seed = int(generate_data.get('seed')) if 'seed' in generate_data else None
                    
                    # Validate required parameters
                    if not base64_image:
                        await websocket.send(json.dumps({
                            'type': 'generate_response',
                            'success': False,
                            'error': 'Missing base64 image'
                        }))
                        continue
                    
                    # Decode the input image
                    input_image = decode_base64_to_image(base64_image)
                    
                    # Update for generation in progress
                    await websocket.send(json.dumps({
                        'type': 'progress_update',
                        'stage': 'generating',
                        'progress': 0,
                        'file': ""
                    }))
                    
                    # Generate the image
                    output_image = generate_image(
                        pipe=pipe,
                        image=input_image,
                        prompt=prompt,
                        lora_strength=lora_strength,
                        image_to_image_strength=image_to_image_strength,
                        width=width,
                        height=height,
                        num_inference_steps=num_inference_steps,
                        guidance_scale=guidance_scale,
                        seed=seed
                    )
                    
                    # Update for generation complete
                    await websocket.send(json.dumps({
                        'type': 'progress_update',
                        'stage': 'generating',
                        'progress': 100,
                        'file': ""
                    }))
                    
                    if output_image is None:
                        await websocket.send(json.dumps({
                            'type': 'generate_response',
                            'success': False,
                            'error': 'Failed to generate image'
                        }))
                        continue
                    
                    # Encode the output image to base64
                    output_base64 = encode_image_to_base64(output_image)
                    
                    # Send the result back to the client
                    await websocket.send(json.dumps({
                        'type': 'generate_response',
                        'success': True,
                        'image': output_base64
                    }))
                
                # Handle status request
                elif message_type == 'status':
                    await websocket.send(json.dumps({
                        'type': 'status_response',
                        'success': True,
                        'model_initialized': model_initialized,
                        'current_settings': current_settings
                    }))
                
                else:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'error': f'Unknown message type: {message_type}'
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'error': 'Invalid JSON'
                }))
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send(json.dumps({
                    'type': 'error',
                    'error': str(e)
                }))
    except websockets.exceptions.ConnectionClosed:
        logger.info("Connection closed")
    finally:
        connected = False
        logger.info("Client disconnected")

async def main():
    """Start the WebSocket server."""
    server = await websockets.serve(handle_client, "localhost", 8765)
    logger.info("Server started on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main()) 