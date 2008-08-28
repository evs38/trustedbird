#!/bin/sh
# Copy libtrustedbird.sh into add-on directory found in libtrustedbird.js-path

[ -e "$1/libtrustedbird.js-path" ] || exit

FILE_PATH="`cat \"$1/libtrustedbird.js-path\"`"
cp tools/libtrustedbird.js "$1/$FILE_PATH/"
