package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessageHdrsHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Monday, September 22, 2008 6:24:12 PM CEST
*/

public final class CMessageHdrsHolder implements org.omg.CORBA.portable.Streamable
{
  public CMessageHdr value[] = null;

  public CMessageHdrsHolder ()
  {
  }

  public CMessageHdrsHolder (CMessageHdr[] initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CMessageHdrsHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CMessageHdrsHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CMessageHdrsHelper.type ();
  }

}
