package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageComposeServiceOperations.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 5:38:41 PM CET
*/

public interface MessageComposeServiceOperations 
{
  void SendMessage (CAccount p_account, CMessage p_message, MessageSendListener p_listener, boolean openComposeWindowOnBadFormat) throws CInternalServerException;
} // interface MessageComposeServiceOperations
