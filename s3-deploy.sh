#!/bin/bash
# Upload all the things to S3.

set -ex

build_assets() {
  gulp
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
  # /assets/main.built.js -> //cdn.jungle.horse/assets/${checksum}/main.built.js
  sed -i "s/\/assets/\/\/cdn.jungle.horse\/assets\/${checksum}/g" index.html
  # Variable substitutions
  sed -i "s/asset_content_hash/${checksum}/g" index.html
  sed -i "s/DEVELOPMENT/production/g" index.html
  sed -i "s/API_HOST/http:\/\/api.jungle.horse/g" index.html
  sed -i "s/CDN_HOST/\/\/cdn.jungle.horse/g" index.html
  popd

  aws s3 cp $output_dir s3://junglehorse-frontend/assets/${checksum} --recursive
  aws s3 cp $output_dir/index.html s3://jungle.horse/index.html
  aws s3 cp $output_dir/index.html s3://junglehorse.com/index.html

  popd
}

# Upload files to S3 that infrequently change.
# Don't run this often as it adds to PutObject costs!
upload_stable_assets() {
  echo '> Upload stable assets (images, robots.txt, etc.)'
  pushd web
  # S3 Bucket
  # jungle.horse website
  aws s3 cp error.html s3://jungle.horse/
  aws s3 cp favicon.ico s3://jungle.horse/favicon.ico
  aws s3 cp robots.txt s3://jungle.horse/

  # S3 Bucket
  # junglehorse.com website
  aws s3 cp error.html s3://junglehorse.com/
  aws s3 cp favicon.ico s3://junglehorse.com/favicon.ico
  aws s3 cp robots.txt s3://junglehorse.com/

  # Cloudfront bucket.
  # Keep error.html in both buckets.
  aws s3 cp error.html s3://junglehorse-frontend/
  aws s3 cp images/ s3://junglehorse-frontend/images/ --recursive
  popd
}

upload_assets
#upload_stable_assets

