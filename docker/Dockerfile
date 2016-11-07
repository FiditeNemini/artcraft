# See `ebs-deployable.sh` in the root directory to create the AWS
# EBS-deployable zip file that contains all of the artifact files.
FROM ubuntu:14.04
MAINTAINER bt <bt@brand.io>
EXPOSE 8000
# Mount files inside container.
ADD files/ ./
# Go, go, go!
CMD ./trumpet -p 8000

