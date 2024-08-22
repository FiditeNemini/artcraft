#!/bin/bash

# This script is to run live portrait on bare metal local dev.
# It's probably preferable to run on local k8s, but this can be used in the interim.
# TODO(bt,2024-08-18): Remove hardcoded paths

set -euxo pipefail 

export SCOPED_EXECUTION_JOB_TYPES=live_portrait

# MAIN_IPA_WORKFLOW
# FACE_DETAILER_WORKFLOW
# UPSCALER_WORKFLOW

export COMFY_INFERENCE_ROOT_DIRECTORY="/home/bt/dev/storyteller/storyteller-ml/workflows/comfy"

# COMFY_INFERENCE_CONFIG_PATH
# COMFY_INFERENCE_EXECUTABLE_OR_COMMAND
# COMFY_SETUP_SCRIPT
# COMFY_LAUNCH_COMMAND
# COMFY_STARTUP_HEALTHCHECK_ENABLED
# COMFY_INFERENCE_MAYBE_VENV_COMMAND
# COMFY_TIMEOUT_SECONDS
# COMFY_INFERENCE_MAYBE_DOCKER_IMAGE
# COMFY_MOUNTS_DIRECTORY
# COMFY_VIDEO_PROCESSING_SCRIPT
# COMFY_STYLES_DIRECTORY
# COMFY_WORKFLOWS_DIRECTORY
# COMFY_MAPPINGS_DIRECTORY

# /home/bt/dev/storyteller/storyteller-ml/workflows/comfy/../ComfyLauncher/ComfyRunnerForSidecar.py
# COMFY_INFERENCE_EXECUTABLE_OR_COMMAND="venv/bin/python ../ComfyLauncher/ComfyRunnerForSidecar.py"

# COMFY_INFERENCE_EXECUTABLE_OR_COMMAND
# "python3 /app/ComfyLauncher/

#export COMFY_INFERENCE_EXECUTABLE_OR_COMMAND="venv/bin/python ./ComfyLauncher/ComfyRunnerForSidecar.py"
export COMFY_INFERENCE_EXECUTABLE_OR_COMMAND="venv/bin/python ./ComfyLauncher/ComfyLivePortraitRunner.py --server-restart-trigger-file /tmp/restart.txt"

export COMFY_LAUNCH_COMMAND="bash /home/bt/dev/storyteller/storyteller-ml/workflows/comfy/live-runner-comfy-server-starter.sh"

export BASE_LIVE_PORTRAIT_WORKFLOW="25-07-2024/yae_LivingPortrait(Cuda)_25-07_API.json"

# For downstream Python script
export V2V_WORKFLOWS_DIRECTORY="/home/bt/dev/storyteller/storyteller-ml/workflows/comfy/workflow_configs"
export COMFY_ROOT_DIRECTORY="/home/bt/dev/storyteller/storyteller-ml/workflows/comfy/ComfyUI"

# Watermarks
export FAKEYOU_WATERMARK_PATH="/home/bt/dev/storyteller/storyteller-rust/includes/container_includes/image_assets/fakeyou_watermark.png"
export STORYTELLER_WATERMARK_PATH="/home/bt/dev/storyteller/storyteller-rust/includes/container_includes/image_assets/storyteller_watermark.png"

export FAKEYOU_WATERMARK_SCALE="0.2"

cargo run --bin inference-job

