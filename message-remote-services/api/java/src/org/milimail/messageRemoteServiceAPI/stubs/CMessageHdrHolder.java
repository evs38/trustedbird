package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessageHdrHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Tuesday, December 9, 2008 4:49:24 PM CET
*/

public final class CMessageHdrHolder implements org.omg.CORBA.portable.Streamable
{
  public CMessageHdr value = null;

  public CMessageHdrHolder ()
  {
  }

  public CMessageHdrHolder (CMessageHdr initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CMessageHdrHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CMessageHdrHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CMessageHdrHelper.type ();
  }

}
