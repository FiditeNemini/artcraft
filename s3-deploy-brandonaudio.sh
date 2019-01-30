#!/bin/bash
# Upload all the things to S3.

set -ex

build_assets() {
  #gulp # FIXME(2019-01-30): Not sure why this isn't working. Not sure if critical.
  pushd ./frontend
  MINIFY=1 webpack
  popd
}

# Upload the assets that undergo frequent change (JS, CSS, etc.)
# Don't include large, infrequently changing files here as it's expensive.
upload_assets() {
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
  pushd ./web

  mkdir -p $output_dir
  cp *css $output_dir
  cp *html $output_dir
  cp output/* $output_dir

  # Modify URLs in index.html
  echo "> Modify asset paths, etc. in index.html."
  pushd $output_dir
  # /assets/output/main.built.js -> /assets/main.built.js
  sed -i "s/assets\/output/assets/g" index.html
  # /assets/main.built.js -> //cdn.brandon.audio/assets/${checksum}/main.built.js
  sed -i "s/\/assets/\/\/cdn.brandon.audio\/assets\/${checksum}/g" index.html
  # Variable substitutions
  sed -i "s/asset_content_hash/${checksum}/g" index.html
  sed -i "s/DEVELOPMENT/production/g" index.html
  sed -i "s/API_HOST/http:\/\/api.brandon.audio/g" index.html
  sed -i "s/CDN_HOST/\/\/cdn.brandon.audio/g" index.html
  popd

  aws s3 cp $output_dir s3://cdn.brandon.audio/assets/${checksum} --recursive
  aws s3 cp $output_dir/index.html s3://brandon.audio/index.html
  #aws s3 cp $output_dir/index.html s3://junglehorse.com/index.html

  popd
}

# Upload files to S3 that infrequently change.
# Don't run this often as it adds to PutObject costs!
upload_stable_assets() {
  echo '> Upload stable assets (images, robots.txt, etc.)'
  pushd web
  # S3 Bucket
  # brandon.audio website
  aws s3 cp error.html s3://brandon.audio/
  aws s3 cp favicon.ico s3://brandon.audio/favicon.ico
  aws s3 cp robots.txt s3://brandon.audio/

  # S3 Bucket
  # junglehorse.com website
  #aws s3 cp error.html s3://junglehorse.com/
  #aws s3 cp favicon.ico s3://junglehorse.com/favicon.ico
  #aws s3 cp robots.txt s3://junglehorse.com/

  # Cloudfront bucket.
  # Keep error.html in both buckets.
  aws s3 cp error.html s3://cdn.brandon.audio/
  aws s3 cp images/ s3://cdn.brandon.audio/images/ --recursive
  popd
}

upload_assets
upload_stable_assets

