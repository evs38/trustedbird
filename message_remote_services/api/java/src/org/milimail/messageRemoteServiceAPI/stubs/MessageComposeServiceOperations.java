package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageComposeServiceOperations.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Wednesday, May 21, 2008 11:06:48 AM CEST
*/

public interface MessageComposeServiceOperations 
{
  void SendMessage (Account p_account, CMessage p_message, MessageSendListener p_listener, boolean openComposeWindowOnBadFormat) throws InternalServerException;
} // interface MessageComposeServiceOperations