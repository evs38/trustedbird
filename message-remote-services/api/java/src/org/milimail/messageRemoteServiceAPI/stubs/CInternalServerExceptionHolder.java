package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CInternalServerExceptionHolder.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, December 8, 2008 11:31:29 AM CET
*/

public final class CInternalServerExceptionHolder implements org.omg.CORBA.portable.Streamable
{
  public CInternalServerException value = null;

  public CInternalServerExceptionHolder ()
  {
  }

  public CInternalServerExceptionHolder (CInternalServerException initialValue)
  {
    value = initialValue;
  }

  public void _read (org.omg.CORBA.portable.InputStream i)
  {
    value = CInternalServerExceptionHelper.read (i);
  }

  public void _write (org.omg.CORBA.portable.OutputStream o)
  {
    CInternalServerExceptionHelper.write (o, value);
  }

  public org.omg.CORBA.TypeCode _type ()
  {
    return CInternalServerExceptionHelper.type ();
  }

}
