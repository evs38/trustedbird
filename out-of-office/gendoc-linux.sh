#/bin/bash
# generate doc with JSDoc
#
# Download JSDoc script: http://jsdoc.sourceforge.net/#install
# and install it.
# Change JsDocPath variable
#
# Olivier Brun - 2008-09-24

# path for JSDoc
JsDocPath="/home/brunol/tools/JSDoc/jsdoc.pl"

# Project logo
logoPath="./chrome/content/images/logo_extension.png"

# project summary file
projectSummary="project_summary.txt"

# document files
files="./"

# output directory
outputDirectory="doc/js_doc"


# remove old files
if [ -d  $outputDirectory ] ; then rm $outputDirectory/* -f 2>/dev/null ; fi


perl $JsDocPath -d $outputDirectory --logo $logoPath --project-summary $projectSummary  --no-sources $files


