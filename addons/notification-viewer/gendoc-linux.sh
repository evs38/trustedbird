#/bin/bash
# generate doc with JSDoc
#
# Download JSDoc script: http://jsdoc.sourceforge.net/#install
# and install it.
# Change JsDocPath variable
#
# Daniel Rocher - 2008-02-20

# path for JSDoc
JsDocPath="/home/raph/download/JSDoc/jsdoc.pl"

# Project logo
logoPath="./chrome/skin/notificationsviewer.png"

# project summary file
projectSummary="README"

# document files
files="./chrome/content/"

# output directory
outputDirectory="doc"


# remove old files
if [ -d  $outputDirectory ] ; then rm $outputDirectory/* -f 2>/dev/null ; fi


perl $JsDocPath -r -d $outputDirectory --logo $logoPath --project-summary $projectSummary  --no-sources $files


