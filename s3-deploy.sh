#!/bin/bash
# Upload all the things to S3.

build_assets() {
  gulp
  pushd ./frontend > /dev/null
  MINIFY=1 webpack
  popd > /dev/null
}

echo "> Build artifact."
build_assets

# Calculate output directory.
echo "> Calculate artifact SHA."
pushd ./web/output > /dev/null
declare checksum=$(find . -type f -exec md5sum {} + | awk '{print $1}' | \
                   sort | md5sum | awk '{print $1}')
popd > /dev/null

declare -r output_dir="deploy/${checksum}"

# Prep upload artifact.
echo "> Prep upload of artifact ${checksum}."
pushd ./web > /dev/null
mkdir -p $output_dir
cp *css $output_dir
cp *html $output_dir
cp -R images/ $output_dir
cp output/* $output_dir

echo "> Upload to S3."
aws s3 cp $output_dir s3://junglehorse-frontend/${checksum} --recursive

popd > /dev/null
echo "> Done."

