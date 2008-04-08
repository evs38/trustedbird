TOP=.
CURRENT=.
BASE_OMNI_TREE=.


include $(TOP)/mk/beforeauto.mk

SUBDIRS = src

all::
	@(target="export"; $(MakeSubdirs))

install::
	@$(MakeSubdirs)
	@(subdirs="include idl contrib"; $(MakeSubdirs))

include $(TOP)/mk/afterauto.mk
