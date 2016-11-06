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

# Modify URLs in index.html
echo "> Modify asset paths, etc. in index.html."
pushd $output_dir > /dev/null
# /assets/output/main.built.js -> /assets/main.built.js
sed -i "s/assets\/output/assets/g" index.html
# /assets/main.built.js -> /assets/${checksum}/main.built.js
sed -i "s/assets/assets\/${checksum}/g" index.html
sed -i "s/asset_content_hash/${checksum}/g" index.html
sed -i "s/DEVELOPMENT/production/g" index.html
popd > /dev/null

echo "> Upload to S3."
aws s3 cp $output_dir s3://junglehorse-frontend/assets/${checksum} --recursive
aws s3 cp $output_dir/index.html s3://junglehorse-frontend/index.html

popd > /dev/null
echo "> Done."

