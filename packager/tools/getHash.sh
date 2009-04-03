#!/bin/sh
# Get sha1 hash of a file

SHA1SUM=`sha1sum "$1" 2>/dev/null | cut -d " " -f 1`

[ ! -z "$SHA1SUM" ] && echo "sha1:$SHA1SUM"
