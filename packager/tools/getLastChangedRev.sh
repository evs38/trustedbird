#!/bin/sh
# Get last changed revision of a SVN directory

[ -d "$1" ] || exit

printf "%06d" `LC_ALL=C svn info "$1" 2>/dev/null | grep "Last Changed Rev" | cut -d: -f2 | tr -d " "`
