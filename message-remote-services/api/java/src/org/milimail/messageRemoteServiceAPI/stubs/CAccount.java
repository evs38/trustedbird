package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAccount.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 12, 2008 12:37:19 PM CET
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
