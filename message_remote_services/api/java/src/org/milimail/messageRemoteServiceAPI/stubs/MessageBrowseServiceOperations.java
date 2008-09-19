package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageBrowseServiceOperations.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Friday, September 19, 2008 6:32:29 PM CEST
*/

public interface MessageBrowseServiceOperations 
{
  void GetRootFolder (CAccount p_account, CFolderHolder p_rootFolder);
  void GetAllFolders (CFolder p_rootFolder, CFoldersHolder p_folders);
  void GetMessageHdrs (CFolder p_folder, CMessageHdrsHolder p_messageHdrs);
} // interface MessageBrowseServiceOperations
