package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CInternalServerException.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Friday, September 19, 2008 6:32:29 PM CEST
*/

public final class CInternalServerException extends org.omg.CORBA.UserException
{
  public String cause = null;

  public CInternalServerException ()
  {
    super(CInternalServerExceptionHelper.id());
  } // ctor

  public CInternalServerException (String _cause)
  {
    super(CInternalServerExceptionHelper.id());
    cause = _cause;
  } // ctor


  public CInternalServerException (String $reason, String _cause)
  {
    super(CInternalServerExceptionHelper.id() + "  " + $reason);
    cause = _cause;
  } // ctor

} // class CInternalServerException
