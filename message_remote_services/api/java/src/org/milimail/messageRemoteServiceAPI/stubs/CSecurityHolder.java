package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CSecurityHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Tuesday, May 13, 2008 4:03:40 PM CEST
*/

public final class CSecurityHolder implements org.omg.CORBA.portable.Streamable
{
  public CSecurity value = null;

  public CSecurityHolder ()
  {
  }

  public CSecurityHolder (CSecurity initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CSecurityHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CSecurityHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CSecurityHelper.type ();
  }

}
