package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageComposeServiceOperations.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Friday, June 13, 2008 3:22:41 PM CEST
*/

public interface MessageComposeServiceOperations 
{
  void SendMessage (CAccount p_account, CMessage p_message, MessageSendListener p_listener, boolean openComposeWindowOnBadFormat) throws InternalServerException;
} // interface MessageComposeServiceOperations
