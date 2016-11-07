#!/bin/bash
# This creates a Dockerfile in the AWS EBS format that is ready for deployment.
# Dockerfile, Dockerrun.aws.json, and packaged artifact files.
# In this case, the Rust server is packaged with the other dependencies.

set -ex
declare -r artifact_dir_name="files/"
declare -r artifact_dir="./docker/${artifact_dir_name}"

# Copy binary, sound samples, and configs (only if updated).
# No need to copy web files as these are hosted on AWS/EC2 instead.
mkdir -p $artifact_dir
rsync -utrv ./target/release/trumpet $artifact_dir
rsync -utrv ~/Dropbox/jungle.horse/sounds $artifact_dir
rsync -utrv {dictionary,config.toml} $artifact_dir

declare -r artifact_zip="./docker_image.zip"

pushd docker
zip -r $artifact_zip Dockerfile Dockerrun.aws.json
zip -r $artifact_zip $artifact_dir_name
popd

