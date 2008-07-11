#!/bin/sh
# Build milimail and upload the files to packages.milimail.org
# (Windows version)

REMOTE_SERVER=dga@62.193.246.126
REMOTE_DIRECTORY=/var/www/vhosts/packages.milimail.org/httpdocs/
DIRECTORY_NAME=`date +"%Y%m%d"`

cd /c/milimail

# Build
ant -Dnightly=1 -Denv.vc6sdk="C:/Program Files/Microsoft Visual Studio" distclean extract-milimail update-milimail build-milimail package-milimail package-extension-mrs >/dev/null 2>&1 || echo "building failed"

# Prepare files
[ -d dist ] || exit
mkdir -p dist/$DIRECTORY_NAME 
mv dist/*.exe dist/*.xpi dist/$DIRECTORY_NAME/ >/dev/null 2>&1

# Upload files
scp -r dist/$DIRECTORY_NAME $REMOTE_SERVER:$REMOTE_DIRECTORY/nightly/ >/dev/null 2>&1 || echo "scp failed"
