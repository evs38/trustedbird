#!/bin/sh
# Build milimail and extensions and upload the files to packages.milimail.org
# (Linux version)

REMOTE_SERVER=dga@62.193.246.126
REMOTE_DIRECTORY=/var/www/vhosts/packages.milimail.org/httpdocs
DIRECTORY_NAME=`date +"%Y%m%d"`

cd /home/dga/milimail

# Build
ant -Dnightly=1 >/dev/null 2>&1 || echo "building failed"

# Prepare files
[ -d dist ] || exit
mkdir -p dist/$DIRECTORY_NAME 
mv dist/*.xpi dist/*.zip dist/*.tar.gz dist/*.deb dist/$DIRECTORY_NAME/ >/dev/null 2>&1

# Upload files
scp -r dist/$DIRECTORY_NAME $REMOTE_SERVER:$REMOTE_DIRECTORY/nightly/ >/dev/null 2>&1 || echo "scp failed"
scp -r dist/updates $REMOTE_SERVER:$REMOTE_DIRECTORY/ >/dev/null 2>&1 || echo "scp failed"

# Create "latest" link
ssh $REMOTE_SERVER rm $REMOTE_DIRECTORY/nightly/latest
ssh $REMOTE_SERVER ln -s $DIRECTORY_NAME $REMOTE_DIRECTORY/nightly/latest

# Clean old files
ssh $REMOTE_SERVER /var/www/vhosts/packages.milimail.org/clean-nightly
