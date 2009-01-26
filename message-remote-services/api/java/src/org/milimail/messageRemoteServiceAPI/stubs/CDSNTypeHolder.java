package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CDSNTypeHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
*/

public final class CDSNTypeHolder implements org.omg.CORBA.portable.Streamable
{
  public CDSNType value = null;

  public CDSNTypeHolder ()
  {
  }

  public CDSNTypeHolder (CDSNType initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CDSNTypeHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CDSNTypeHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CDSNTypeHelper.type ();
  }

}
