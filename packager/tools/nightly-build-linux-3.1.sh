#!/bin/sh
# Build Trustedbird and add-ons then upload the files to packages.trustedbird.org
# (Linux version)

REMOTE_SERVER=
REMOTE_DIRECTORY=
DIRECTORY_NAME=`date +"%Y%m%d"`
LOG=buildlog-3.1

[ -e build.xml ] || { echo "Can't find build.xml"; exit; }

# Build
ant -Dnightly=1 -Dversion=3.1 distclean trustedbird >"$LOG" 2>&1 || { echo "building failed" | tee -a "$LOG"; }

# Prepare files
[ -d dist ] || exit
mkdir -p dist/$DIRECTORY_NAME 
mv dist/*.xpi dist/*.zip dist/*.tar.gz dist/*.tar.bz2 dist/*.deb dist/$DIRECTORY_NAME/ >/dev/null 2>&1

# Upload files
scp -r dist/$DIRECTORY_NAME $REMOTE_SERVER:$REMOTE_DIRECTORY/nightly/ >/dev/null 2>&1 || echo "scp failed"

# Create "latest" link
ssh $REMOTE_SERVER rm $REMOTE_DIRECTORY/nightly/latest
ssh $REMOTE_SERVER ln -s $DIRECTORY_NAME $REMOTE_DIRECTORY/nightly/latest

# Clean old files
ssh $REMOTE_SERVER /var/www/vhosts/packages.trustedbird.org/clean-nightly
