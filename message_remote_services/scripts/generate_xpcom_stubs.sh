#!/bin/bash
MOZILLA_SDK_PATH=~/workspace/mozilla-2.0/dist/sdk/bin/
MOZILLA_SDK_INCLUDE_PATH=~/workspace/mozilla-2.0/dist/sdk/idl/


$MOZILLA_SDK_PATH/xpidl -e ../src/xpcom/IMessageRemoteService.h -m header \
 -I$MOZILLA_SDK_INCLUDE_PATH ../src/xpcom/IMessageRemoteService.idl
 
 $MOZILLA_SDK_PATH/xpidl -e ../dist/IMessageRemoteService.xpt -m typelib \
 -I$MOZILLA_SDK_INCLUDE_PATH ../src/xpcom/IMessageRemoteService.idl
mkdir dist 
 echo "[INFO] ../src/xpcom/IMessageRemoteService.h created from ../src/xpcom/IMessageRemoteService.idl"
 echo "[INFO] dist/IMessageRemoteService.xpt created from ../src/xpcom/IMessageRemoteService.idl"
