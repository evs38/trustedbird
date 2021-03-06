package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAccountHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
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
