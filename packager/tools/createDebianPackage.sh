#!/bin/sh
# Create a Debian package from Milimail tar.gz package - launched by Ant
# Syntax: createDebianPackage.sh WORK_DIR ARCHIVE VERSION CONTROL_FILE

[ -d "$1" ] || exit
[ -f "$2" ] || exit
[ "$3" != "" ] || exit
[ -f "$4" ] || exit

rm -rf "$1/debian"
mkdir -p "$1/debian/DEBIAN" "$1/debian/usr/bin" "$1/debian/usr/local" || exit
cp "$4" "$1/debian/DEBIAN/control" || exit
sed -i "s|__VERSION__|$3|" "$1/debian/DEBIAN/control"
ln -s /usr/local/milimail/milimail "$1/debian/usr/bin/milimail" || exit
tar xfz "$2" -C "$1/debian/usr/local/" || exit
mv "$1/debian/usr/local/thunderbird" "$1/debian/usr/local/milimail" || exit
mv "$1/debian/usr/local/milimail/thunderbird" "$1/debian/usr/local/milimail/milimail" || exit
mv "$1/debian/usr/local/milimail/thunderbird-bin" "$1/debian/usr/local/milimail/milimail-bin" || exit
fakeroot dpkg-deb -b "$1/debian" "$1/milimail.deb" || exit
