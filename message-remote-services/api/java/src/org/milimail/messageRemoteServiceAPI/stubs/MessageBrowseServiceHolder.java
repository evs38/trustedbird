package org.milimail.messageRemoteServiceAPI.stubs;

/**
* MessageBrowseServiceHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 10:31:26 AM CET
*/

public final class MessageBrowseServiceHolder implements org.omg.CORBA.portable.Streamable
{
  public MessageBrowseService value = null;

  public MessageBrowseServiceHolder ()
  {
  }

  public MessageBrowseServiceHolder (MessageBrowseService initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = MessageBrowseServiceHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    MessageBrowseServiceHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return MessageBrowseServiceHelper.type ();
  }

}
