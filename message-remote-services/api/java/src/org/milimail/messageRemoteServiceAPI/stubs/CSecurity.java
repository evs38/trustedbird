package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CSecurity.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:53 PM CET
*/

public final class CSecurity implements org.omg.CORBA.portable.IDLEntity
{
  public boolean isSigned = false;
  public boolean isCrypted = false;

  public CSecurity ()
  {
  } // ctor

  public CSecurity (boolean _isSigned, boolean _isCrypted)
  {
    isSigned = _isSigned;
    isCrypted = _isCrypted;
  } // ctor

} // class CSecurity
