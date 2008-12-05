SDK = $(mozilla_sdk)/sdk/include
DIR = $(mozilla_sdk)/include
AM_CPPFLAGS = -Wall -I $(DIR)  -I $(DIR)/msgbase  -I $(DIR)/xpcom  -I $(DIR)/mailnews -I $(DIR)/string  -I $(DIR)/necko  -I $(DIR)/msgbaseutil  -I $(DIR)/msgcompose  -DMOZILLA_INTERNAL_API  -I $(SDK) -I ${top_srcdir}/lib/omniORB-4.1.2/include -I $(srcdir)/../corba/
lib_LTLIBRARIES= libMessageRemoteService.la
libMessageRemoteService_la_SOURCES=  MessageRemoteService.cpp MessageRemoteService.h IMessageRemoteService.h MessageRemoteServiceModule.cpp MessageRemoteService.h
libMessageRemoteService_la_LIBADD = ../corba/libmrs.a -L$(mozilla_sdk)/lib -lxpcomglue_s -lxpcom -lxpcom_core -lplds4 -lplc4 -lnspr4 -lpthread -lmsgbsutl_s ${top_srcdir}/lib/omniORB-4.1.2/lib/libomniORB4.a ${top_srcdir}/lib/omniORB-4.1.2/lib/libomnithread.a
