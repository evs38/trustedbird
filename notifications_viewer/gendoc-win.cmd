@echo off
rem Command file
rem generate doc with JSDoc
rem
rem Download JSDoc script: http://jsdoc.sourceforge.net/#install
rem and install it.
rem Change JsDocPath variable
rem
rem Olivier Brun - 2008-09-25

rem path for JSDoc
set JsDocPath=C:\Tools\JSDoc\jsdoc.pl

rem Project logo
set logoPath=.\chrome\skin\notificationsviewer.png

rem project summary file
set projectSummary=project_summary.txt

rem document files
set files=.\chrome\content

rem output directory
set outputDirectory=doc

rem Clean up output directory
if exist %outputDirectory% rmdir %outputDirectory% /S /Q 

perl %JsDocPath% -r -d %outputDirectory% --logo %logoPath% --project-summary %projectSummary%  --no-sources %files%
