#!/bin/sh
# Create a Debian package from Trustedbird tar.gz package - launched by Ant
# Syntax: createDebianPackage.sh WORK_DIR ARCHIVE VERSION TOOLS_DIRECTORY

[ -d "$1" ] || exit
[ -f "$2" ] || exit
[ "$3" != "" ] || exit
[ -d "$4" ] || exit

# Prepare Debian structure
rm -rf "$1/debian"
mkdir -p "$1/debian/DEBIAN" "$1/debian/usr/bin" "$1/debian/usr/local" "$1/debian/usr/share/menu" "$1/debian/usr/share/applications" "$1/debian/usr/share/pixmaps" || exit
cp "$4/debian-control" "$1/debian/DEBIAN/control" || exit
sed -i "s|__VERSION__|$3|" "$1/debian/DEBIAN/control"
ln -s /usr/local/trustedbird/trustedbird "$1/debian/usr/bin/trustedbird" || exit

# Extract tarball
tar xfz "$2" -C "$1/debian/usr/local/" || exit
mv "$1/debian/usr/local/thunderbird" "$1/debian/usr/local/trustedbird" || exit

# Copy menu and icons
cp "$4/trustedbird.xpm" "$1/debian/usr/share/pixmaps/trustedbird.xpm" || exit
cp "$4/trustedbird.desktop" "$1/debian/usr/share/applications/" || exit
cp "$4/trustedbird.menu" "$1/debian/usr/share/menu/trustedbird.menu" || exit

# Build package
fakeroot dpkg-deb -b "$1/debian" "$1/trustedbird.deb" || exit
