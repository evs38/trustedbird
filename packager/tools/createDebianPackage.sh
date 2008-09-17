#!/bin/sh
# Create a Debian package from Trustedbird tar.gz package - launched by Ant
# Syntax: createDebianPackage.sh WORK_DIR ARCHIVE VERSION CONTROL_FILE

[ -d "$1" ] || exit
[ -f "$2" ] || exit
[ "$3" != "" ] || exit
[ -f "$4" ] || exit

rm -rf "$1/debian"
mkdir -p "$1/debian/DEBIAN" "$1/debian/usr/bin" "$1/debian/usr/local" || exit
cp "$4" "$1/debian/DEBIAN/control" || exit
sed -i "s|__VERSION__|$3|" "$1/debian/DEBIAN/control"
ln -s /usr/local/trustedbird/trustedbird "$1/debian/usr/bin/trustedbird" || exit
tar xfz "$2" -C "$1/debian/usr/local/" || exit
mv "$1/debian/usr/local/thunderbird" "$1/debian/usr/local/trustedbird" || exit
mv "$1/debian/usr/local/trustedbird/thunderbird" "$1/debian/usr/local/trustedbird/trustedbird" || exit
mv "$1/debian/usr/local/trustedbird/thunderbird-bin" "$1/debian/usr/local/trustedbird/trustedbird-bin" || exit
fakeroot dpkg-deb -b "$1/debian" "$1/trustedbird.deb" || exit
