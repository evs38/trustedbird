package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAccount.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Thursday, June 12, 2008 11:49:38 AM CEST
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
