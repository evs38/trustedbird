package org.milimail.messageRemoteServiceAPI.stubs;

/**
* AttachmentHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Wednesday, May 21, 2008 11:06:48 AM CEST
*/

public final class AttachmentHolder implements org.omg.CORBA.portable.Streamable
{
  public Attachment value = null;

  public AttachmentHolder ()
  {
  }

  public AttachmentHolder (Attachment initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = AttachmentHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    AttachmentHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return AttachmentHelper.type ();
  }

}
