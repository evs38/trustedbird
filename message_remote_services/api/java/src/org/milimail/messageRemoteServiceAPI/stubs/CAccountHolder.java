package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAccountHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Thursday, June 12, 2008 11:49:38 AM CEST
*/

public final class CAccountHolder implements org.omg.CORBA.portable.Streamable
{
  public CAccount value = null;

  public CAccountHolder ()
  {
  }

  public CAccountHolder (CAccount initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CAccountHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CAccountHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CAccountHelper.type ();
  }

}
