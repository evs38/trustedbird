package org.milimail.messageRemoteServiceAPI.stubs;

/**
* AddressesHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, December 8, 2008 11:31:29 AM CET
*/

public final class AddressesHolder implements org.omg.CORBA.portable.Streamable
{
  public String value[] = null;

  public AddressesHolder ()
  {
  }

  public AddressesHolder (String[] initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = AddressesHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    AddressesHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return AddressesHelper.type ();
  }

}
