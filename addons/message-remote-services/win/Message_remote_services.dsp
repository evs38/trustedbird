# Microsoft Developer Studio Project File - Name="Message_remote_services" - Package Owner=<4>
# Microsoft Developer Studio Generated Build File, Format Version 6.00
# ** DO NOT EDIT **

# TARGTYPE "Win32 (x86) Dynamic-Link Library" 0x0102

CFG=Message_remote_services - Win32 Debug
!MESSAGE This is not a valid makefile. To build this project using NMAKE,
!MESSAGE use the Export Makefile command and run
!MESSAGE 
!MESSAGE NMAKE /f "Message_remote_services.mak".
!MESSAGE 
!MESSAGE You can specify a configuration when running NMAKE
!MESSAGE by defining the macro CFG on the command line. For example:
!MESSAGE 
!MESSAGE NMAKE /f "Message_remote_services.mak" CFG="Message_remote_services - Win32 Debug"
!MESSAGE 
!MESSAGE Possible choices for configuration are:
!MESSAGE 
!MESSAGE "Message_remote_services - Win32 Release" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE "Message_remote_services - Win32 Debug" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE 

# Begin Project
# PROP AllowPerConfigDependencies 0
# PROP Scc_ProjName ""
# PROP Scc_LocalPath ""
CPP=cl.exe
MTL=midl.exe
RSC=rc.exe

!IF  "$(CFG)" == "Message_remote_services - Win32 Release"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 0
# PROP BASE Output_Dir "Release"
# PROP BASE Intermediate_Dir "Release"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 0
# PROP Output_Dir "Release"
# PROP Intermediate_Dir "Release"
# PROP Ignore_Export_Lib 0
# PROP Target_Dir ""
# ADD BASE CPP /nologo /MT /W3 /GX /Od /D "WIN32" /D "NDEBUG" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "MESSAGE_REMOTE_SERVICES_EXPORTS" /YX /FD /c
# ADD CPP /nologo /MT /W3 /GX /Od /I "..\lib\omniORB-4.1.2\include" /I "..\src\corba" /I "..\src\xpcom" /D "WIN32" /D "NDEBUG" /D "_WINSTATIC" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "MESSAGE_REMOTE_SERVICES_EXPORTS" /D "__WIN32__" /D "__x86__" /D _WIN32_WINNT=0x0400 /D "__NT__" /D __OSVERSION__=4 /D "MOZILLA_INTERNAL_API" /D "XP_WIN" /D "DSN" /YX /FD /c
# ADD BASE MTL /nologo /D "NDEBUG" /mktyplib203 /win32
# ADD MTL /nologo /D "NDEBUG" /mktyplib203 /win32
# ADD BASE RSC /l 0x40c /d "NDEBUG"
# ADD RSC /l 0x40c /d "NDEBUG"
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LINK32=link.exe
# ADD BASE LINK32 kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib /nologo /dll /machine:I386
# ADD LINK32 omniORB4.lib omniDynamic4.lib omnithread.lib xpcomglue_s.lib xpcom.lib xpcom_core.lib plc4.lib nspr4.lib plds4.lib msgbsutl_s.lib ws2_32.lib mswsock.lib advapi32.lib /nologo /dll /machine:I386 /out:"Release/libMessageRemoteService.dll" /libpath:"..\lib\omniORB-4.1.2\lib\x86_win32"
# SUBTRACT LINK32 /verbose /debug /nodefaultlib

!ELSEIF  "$(CFG)" == "Message_remote_services - Win32 Debug"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 1
# PROP BASE Output_Dir "Debug"
# PROP BASE Intermediate_Dir "Debug"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 1
# PROP Output_Dir "Debug"
# PROP Intermediate_Dir "Debug"
# PROP Ignore_Export_Lib 0
# PROP Target_Dir ""
# ADD BASE CPP /nologo /MTd /W3 /Gm /GX /ZI /Od /D "WIN32" /D "_DEBUG" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "MESSAGE_REMOTE_SERVICES_EXPORTS" /YX /FD /GZ /c
# ADD CPP /nologo /MTd /W3 /Gm /GX /ZI /Od /I "..\lib\omniORB-4.1.2\include" /I "..\src\corba" /I "..\src\xpcom" /D "__x86__" /D "__NT__" /D __OSVERSION__=4 /D "WIN32" /D "_DEBUG" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "MESSAGE_REMOTE_SERVICES_EXPORTS" /D "__WIN32__" /D _WIN32_WINNT=0x0400 /D "MOZILLA_INTERNAL_API" /D "XP_WIN" /YX /FD /GZ /c
# ADD BASE MTL /nologo /D "_DEBUG" /mktyplib203 /win32
# ADD MTL /nologo /D "_DEBUG" /mktyplib203 /win32
# ADD BASE RSC /l 0x40c /d "_DEBUG"
# ADD RSC /l 0x40c /d "_DEBUG"
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LINK32=link.exe
# ADD BASE LINK32 kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib /nologo /dll /debug /machine:I386 /pdbtype:sept
# ADD LINK32 omniORB4d.lib omniDynamic4d.lib omnithreadd.lib xpcomglue_s.lib xpcom.lib xpcom_core.lib plc4.lib nspr4.lib plds4.lib ws2_32.lib mswsock.lib advapi32.lib /nologo /dll /machine:I386 /nodefaultlib:"libcmt" /out:"Release/libMessageRemoteService.dll" /pdbtype:sept /libpath:"..\lib\omniORB-4.1.2\lib\x86_win32"
# SUBTRACT LINK32 /verbose /debug /nodefaultlib

!ENDIF 

# Begin Target

# Name "Message_remote_services - Win32 Release"
# Name "Message_remote_services - Win32 Debug"
# Begin Group "Source Files"

# PROP Default_Filter "cpp;c;cxx;rc;def;r;odl;idl;hpj;bat"
# Begin Source File

SOURCE=..\src\corba\AccountService_i.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageBrowseService_i.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageBrowseService_i.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageComposeService_i.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageRemoteSendListener.cpp
# End Source File
# Begin Source File

SOURCE=..\src\xpcom\MessageRemoteService.cpp
# End Source File
# Begin Source File

SOURCE=..\src\xpcom\MessageRemoteServiceModule.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\MRSLogger.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\ServicesSK.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\SourceStreamListener.cpp
# End Source File
# Begin Source File

SOURCE=..\src\corba\SourceStreamListener.h
# End Source File
# End Group
# Begin Group "Header Files"

# PROP Default_Filter "h;hpp;hxx;hm;inl"
# Begin Source File

SOURCE=..\src\corba\AccountService_i.h
# End Source File
# Begin Source File

SOURCE=..\src\xpcom\IMessageRemoteService.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageComposeService_i.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\MessageRemoteSendListener.h
# End Source File
# Begin Source File

SOURCE=..\src\xpcom\MessageRemoteService.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\MRSLogger.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\Services.h
# End Source File
# Begin Source File

SOURCE=..\src\corba\Utils.h
# End Source File
# End Group
# Begin Group "Resource Files"

# PROP Default_Filter "ico;cur;bmp;dlg;rc2;rct;bin;rgs;gif;jpg;jpeg;jpe"
# End Group
# End Target
# End Project
