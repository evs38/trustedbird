package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CFoldersHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Friday, September 19, 2008 6:32:29 PM CEST
*/

public final class CFoldersHolder implements org.omg.CORBA.portable.Streamable
{
  public CFolder value[] = null;

  public CFoldersHolder ()
  {
  }

  public CFoldersHolder (CFolder[] initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CFoldersHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CFoldersHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CFoldersHelper.type ();
  }

}
