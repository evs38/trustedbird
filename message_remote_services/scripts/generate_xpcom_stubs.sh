#!/bin/bash
set -x

MOZILLA_SDK_PATH=~/workspace/mozilla/dist/sdk/bin/
MOZILLA_SDK_INCLUDE_PATH=~/workspace/mozilla/dist/sdk/idl/

$MOZILLA_SDK_PATH/xpidl -e ../src/xpcom/IMessageRemoteService.h -m header \
 -I$MOZILLA_SDK_INCLUDE_PATH ../src/xpcom/IMessageRemoteService.idl
 
 $MOZILLA_SDK_PATH/xpidl -e ../xpi/components/IMessageRemoteService.xpt -m typelib \
 -I$MOZILLA_SDK_INCLUDE_PATH ../src/xpcom/IMessageRemoteService.idl
 
