package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessageHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:54 PM CET
*/

public final class CMessageHolder implements org.omg.CORBA.portable.Streamable
{
  public CMessage value = null;

  public CMessageHolder ()
  {
  }

  public CMessageHolder (CMessage initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CMessageHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CMessageHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CMessageHelper.type ();
  }

}
