package org.milimail.messageRemoteServiceAPI.stubs;

/**
* AccountServiceHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Monday, September 22, 2008 6:24:12 PM CEST
*/

public final class AccountServiceHolder implements org.omg.CORBA.portable.Streamable
{
  public AccountService value = null;

  public AccountServiceHolder ()
  {
  }

  public AccountServiceHolder (AccountService initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = AccountServiceHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    AccountServiceHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return AccountServiceHelper.type ();
  }

}
