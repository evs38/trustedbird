#/bin/bash
# generate doc with JSDoc
#
# Download JSDoc script: http://jsdoc.sourceforge.net/#install
# and install it.
# Change JsDocPath variable
#
# Daniel Rocher - 2008-02-20

# path for JSDoc
JsDocPath="/home/daniel/utilitaires/JSDoc/jsdoc.pl"

# Project logo
logoPath=./chrome/skin/notificationsviewer.png

# project summary file
projectSummary="project_summary.txt"

# document files
files="./chrome/content/*.js"

# output directory
outputDirectory="doc"


# remove old files
if [ -d  $outputDirectory ] ; then rm $outputDirectory/* -f 2>/dev/null ; fi


perl $JsDocPath -d $outputDirectory --project-summary $projectSummary  --no-sources $files


