package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAttachment.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Tuesday, September 9, 2008 3:54:32 PM CEST
*/

public final class CAttachment implements org.omg.CORBA.portable.IDLEntity
{
  public String dirPath = null;
  public String fileName = null;
  public String mimeType = null;

  public CAttachment ()
  {
  } // ctor

  public CAttachment (String _dirPath, String _fileName, String _mimeType)
  {
    dirPath = _dirPath;
    fileName = _fileName;
    mimeType = _mimeType;
  } // ctor

} // class CAttachment
