noinst_LIBRARIES = libmrs.a
SDK = $(mozilla_sdk)/sdk/include
DIR = $(mozilla_sdk)/include
AM_CPPFLAGS = -Wall -I $(DIR)  -I $(DIR)/msgbase  -I $(DIR)/xpcom  -I $(DIR)/mailnews -I $(DIR)/string  -I $(DIR)/msgdb  -I $(DIR)/msgbaseutil  -I $(DIR)/msgcompose  -I $(DIR)/appshell  -I $(DIR)/dom  -I $(DIR)/msgsmime -I $(DIR)/mime -I $(DIR)/rdf -I $(DIR)/necko -DMOZILLA_INTERNAL_API  -I $(SDK) -I ${top_srcdir}/lib/omniORB-4.1.2/include
libmrs_a_SOURCES = AccountService_i.cpp AccountService_i.h MessageComposeService_i.cpp MessageComposeService_i.h MessageRemoteSendListener.cpp  ServicesSK.cpp Services.h MRSLogger.h MRSLogger.cpp MessageBrowseService_i.h MessageBrowseService_i.cpp MessageStreamListener.h MessageStreamListener.cpp
