package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageBrowseServiceOperations.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:54 PM CET
*/

public interface MessageBrowseServiceOperations 
{
  void GetRootFolder (CAccount p_account, CFolderHolder p_rootFolder) throws CInternalServerException;
  void GetAllFolders (CFolder p_rootFolder, CFoldersHolder p_folders) throws CInternalServerException;
  void GetMessageHdrs (CFolder p_folder, CMessageHdrsHolder p_messageHdrs) throws CInternalServerException;
  void GetBody (CMessageHdr p_messageHdr, SourceMessageListener p_sourceMessageListener) throws CInternalServerException;
  void GetSourceMessage (String uri, org.omg.CORBA.StringHolder source) throws CInternalServerException;
} // interface MessageBrowseServiceOperations
