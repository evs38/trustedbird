package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CHeaderHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:53 PM CET
*/

public final class CHeaderHolder implements org.omg.CORBA.portable.Streamable
{
  public CHeader value = null;

  public CHeaderHolder ()
  {
  }

  public CHeaderHolder (CHeader initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CHeaderHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CHeaderHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CHeaderHelper.type ();
  }

}
