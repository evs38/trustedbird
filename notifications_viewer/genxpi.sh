#/bin/bash
# generate add-ons
#
# Daniel Rocher - 2008-02-20


# Extension name
name="notifications_viewer.xpi"

#Exclude list
exclude="exclude.txt"

# remove if exist
if [ -f $name ] ; then  rm -f $name >/dev/null 2>&1 ; fi

#now zip
zip -r  $name * -x@$exclude