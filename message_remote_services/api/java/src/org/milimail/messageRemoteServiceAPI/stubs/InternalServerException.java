package org.milimail.messageRemoteServiceAPI.stubs;

/**
* InternalServerException.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Tuesday, May 13, 2008 4:03:40 PM CEST
*/

public final class InternalServerException extends org.omg.CORBA.UserException
{
  public String cause = null;

  public InternalServerException ()
  {
    super(InternalServerExceptionHelper.id());
  } // ctor

  public InternalServerException (String _cause)
  {
    super(InternalServerExceptionHelper.id());
    cause = _cause;
  } // ctor


  public InternalServerException (String $reason, String _cause)
  {
    super(InternalServerExceptionHelper.id() + "  " + $reason);
    cause = _cause;
  } // ctor

} // class InternalServerException
