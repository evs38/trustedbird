package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CHeadersHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Tuesday, December 16, 2008 12:19:22 PM CET
*/

public final class CHeadersHolder implements org.omg.CORBA.portable.Streamable
{
  public CHeader value[] = null;

  public CHeadersHolder ()
  {
  }

  public CHeadersHolder (CHeader[] initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CHeadersHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CHeadersHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CHeadersHelper.type ();
  }

}
