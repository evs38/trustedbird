package org.milimail.messageRemoteServiceAPI.stubs;

/**
* AttachmentsHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Thursday, June 12, 2008 11:49:38 AM CEST
*/

public final class AttachmentsHolder implements org.omg.CORBA.portable.Streamable
{
  public Attachment value[] = null;

  public AttachmentsHolder ()
  {
  }

  public AttachmentsHolder (Attachment[] initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = AttachmentsHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    AttachmentsHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return AttachmentsHelper.type ();
  }

}
