package org.milimail.messageRemoteServiceAPI.stubs;

/**
* SourceMessageListenerHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/ClientServices.idl
* Friday, December 5, 2008 5:38:42 PM CET
*/

public final class SourceMessageListenerHolder implements org.omg.CORBA.portable.Streamable
{
  public SourceMessageListener value = null;

  public SourceMessageListenerHolder ()
  {
  }

  public SourceMessageListenerHolder (SourceMessageListener initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = SourceMessageListenerHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    SourceMessageListenerHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return SourceMessageListenerHelper.type ();
  }

}
