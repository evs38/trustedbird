package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageComposeServiceHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Thursday, June 12, 2008 11:49:38 AM CEST
*/

public final class MessageComposeServiceHolder implements org.omg.CORBA.portable.Streamable
{
  public MessageComposeService value = null;

  public MessageComposeServiceHolder ()
  {
  }

  public MessageComposeServiceHolder (MessageComposeService initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = MessageComposeServiceHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    MessageComposeServiceHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return MessageComposeServiceHelper.type ();
  }

}
