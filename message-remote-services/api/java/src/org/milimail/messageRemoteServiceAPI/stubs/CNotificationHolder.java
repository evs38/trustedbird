package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CNotificationHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
*/

public final class CNotificationHolder implements org.omg.CORBA.portable.Streamable
{
  public CNotification value = null;

  public CNotificationHolder ()
  {
  }

  public CNotificationHolder (CNotification initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CNotificationHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CNotificationHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CNotificationHelper.type ();
  }

}
