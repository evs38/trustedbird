#!/bin/sh
# Get extension version from file

[ -e "$1/version" ] || exit

cat "$1/version" | head -n 1
