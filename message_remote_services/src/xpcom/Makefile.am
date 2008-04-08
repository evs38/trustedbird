SDK = $(mozilla_sdk)/sdk/include
DIR = $(mozilla_sdk)/include
AM_CPPFLAGS = -I $(DIR)  -I $(DIR)/msgbase  -I $(DIR)/xpcom  -I $(DIR)/mailnews -I $(DIR)/string  -I $(DIR)/necko  -I $(DIR)/msgbaseutil  -I $(DIR)/msgcompose -DXPCOM_GLUE -DMOZILLA_INTERNAL_API  -I $(SDK) -I ${top_srcdir}/lib/omniORB-4.1.2/include -I $(srcdir)/../corba/
lib_LTLIBRARIES= libMessageRemoteService.la
libMessageRemoteService_la_SOURCES=  MessageRemoteService.cpp MessageRemoteService.h IMessageRemoteService.h MessageRemoteServiceModule.cpp MessageRemoteService.h
libMessageRemoteService_la_LIBADD = ../corba/libmrs.a -L$(mozilla_sdk)/lib -lnspr4 -lplds4 -lxpcomglue ${top_srcdir}/lib/omniORB-4.1.2/lib/libomniORB4.a ${top_srcdir}/lib/omniORB-4.1.2/lib/libomnithread.a 
