@echo on

rem Command file
rem generate doc with JSDoc
rem
rem Download JSDoc script: http://jsdoc.sourceforge.net/#install
rem and install it.
rem Change JsDocPath variable
rem
rem Olivier Brun - 2008-09-24

rem path for JSDoc
set JsDocPath=C:\Tools\JSDoc\jsdoc.pl

rem Project logo
set logoPath=.\chrome\content\images\logo_extension.png

rem project summary file
set projectSummary=README

rem document files
set files=.\

rem Create main directory if doesn't exist
set mainDirectory=Doc
if not exist %mainDirectory% mkdir %mainDirectory%

rem output directory
set outputDirectory=%mainDirectory%\js_doc


rem Clean up output directory
if exist %outputDirectory% del %outputDirectory%\*.* /Q

perl %JsDocPath% -r -d %outputDirectory% --logo %logoPath% --project-summary %projectSummary%  --no-sources %files%
