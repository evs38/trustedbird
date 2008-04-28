set sdk=C:\mozilla-v0\dist
set vc6sdk=C:\VisualStudio\VC98
set sdki=%sdk%\include
set include=%vc6sdk%\INCLUDE;%vc6sdk%\ATL\INCLUDE;%sdki%\xpcom;%sdki%\msgcompose;%sdki%\nspr;%sdki%\msgbase;%sdki%\msgcompose;%sdki%\mailnews;%sdki%\string;%sdki%\necko;%sdki%\msgdb;%sdki%\msgbaseutil;%sdki%\appshell;%sdki%\dom;%sdki%\msgsmime
set lib=%vc6sdk%\lib;%sdk%\lib
msdev Message_remote_services.dsw /MAKE  "Message_remote_services - Win32 Release" /REBUILD /USEENV 