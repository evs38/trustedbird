#!/bin/sh
# Create a Debian package from Trustedbird tar.gz package - launched by Ant
# Syntax: createDebianPackage.sh BUILD_DIR ARCHIVE VERSION PACKAGE_NAME TOOLS_DIRECTORY

[ -d "$1" ] || exit
[ -f "$2.tar.gz" -o -f "$2.tar.bz2" ] || exit
[ "$3" != "" ] || exit
[ "$4" != "" ] || exit
[ -d "$5" ] || exit

# Prepare Debian structure
rm -rf "$1/debian"
mkdir -p "$1/debian/DEBIAN" "$1/debian/usr/bin" "$1/debian/opt" "$1/debian/usr/share/menu" "$1/debian/usr/share/applications" "$1/debian/usr/share/pixmaps" || exit
cp "$5/debian-control" "$1/debian/DEBIAN/control" || exit
sed -i "s|__VERSION__|$3|" "$1/debian/DEBIAN/control"
sed -i "s|__PACKAGE_NAME__|$4|" "$1/debian/DEBIAN/control"
ln -s /opt/$4/trustedbird "$1/debian/usr/bin/$4" || exit

# Extract tarball
[ -f "$2.tar.gz" ] && tar xfz "$2.tar.gz" -C "$1/debian/opt/"
[ -f "$2.tar.bz2" ] && tar xfj "$2.tar.bz2" -C "$1/debian/opt/"
[ -d "$1/debian/opt/thunderbird" ] && mv "$1/debian/opt/thunderbird" "$1/debian/opt/$4"
[ -d "$1/debian/opt/trustedbird" ] && mv "$1/debian/opt/trustedbird" "$1/debian/opt/$4"

[ -d "$1/debian/opt/$4" ] || exit

# Copy menu and icons
cp "$5/$4.xpm" "$1/debian/usr/share/pixmaps/" || exit
cp "$5/$4.desktop" "$1/debian/usr/share/applications/" || exit
cp "$5/$4.menu" "$1/debian/usr/share/menu/" || exit

# Build package
fakeroot dpkg-deb -b "$1/debian" "$1/trustedbird.deb" || exit
