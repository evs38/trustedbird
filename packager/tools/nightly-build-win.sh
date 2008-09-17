#!/bin/sh
# Build Trustedbird and add-ons then upload the files to packages.trustedbird.org
# (Windows version)

REMOTE_SERVER=dga@62.193.246.126
REMOTE_DIRECTORY=/var/www/vhosts/packages.milimail.org/httpdocs
DIRECTORY_NAME=`date +"%Y%m%d"`
LOG=buildlog

[ -e build.xml ] || { echo "Can't find build.xml"; exit; }

# Build
ant -Dnightly=1 -Denv.vc6sdk="C:/Program Files/Microsoft Visual Studio" distclean extract-archive-tb update-tb build-tb package-tb package-mrs >"$LOG" 2>&1 || { echo "building failed" | tee -a "$LOG"; }

# Prepare files
[ -d dist ] || exit
mkdir -p dist/$DIRECTORY_NAME 
mv dist/*.exe dist/*.xpi dist/$DIRECTORY_NAME/ >/dev/null 2>&1

# Upload files
scp -r dist/$DIRECTORY_NAME $REMOTE_SERVER:$REMOTE_DIRECTORY/nightly/ >/dev/null 2>&1 || echo "scp failed"
scp -r dist/updates $REMOTE_SERVER:$REMOTE_DIRECTORY/ >/dev/null 2>&1 || echo "scp failed"
