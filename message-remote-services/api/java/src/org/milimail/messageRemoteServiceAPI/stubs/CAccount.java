package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAccount.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
*/

public final class CAccount implements org.omg.CORBA.portable.IDLEntity
{
  public String serverHostName = null;
  public String key = null;

  public CAccount ()
  {
  } // ctor

  public CAccount (String _serverHostName, String _key)
  {
    serverHostName = _serverHostName;
    key = _key;
  } // ctor

} // class CAccount
