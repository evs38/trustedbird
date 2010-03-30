#!/bin/sh
# Get revision of a directory under Git

GIT_REV_DATE=`git log -n 1 --pretty=format:%ct -- $1 2>/dev/null`

[ -n "$GIT_REV_DATE" ] && date -u --date="@$GIT_REV_DATE" +%Y%m%d && exit

echo "0"
