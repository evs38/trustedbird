package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessage.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Wednesday, March 26, 2008 11:21:20 AM CET
*/

public final class CMessage implements org.omg.CORBA.portable.IDLEntity
{
  public String recipients_to[] = null;
  public String recipients_cc[] = null;
  public String recipients_bcc[] = null;
  public String subject = null;
  public String body = null;
  public String uuid = null;
  public CSecurity security = null;

  public CMessage ()
  {
  } // ctor

  public CMessage (String[] _recipients_to, String[] _recipients_cc, String[] _recipients_bcc, String _subject, String _body, String _uuid, CSecurity _security)
  {
    recipients_to = _recipients_to;
    recipients_cc = _recipients_cc;
    recipients_bcc = _recipients_bcc;
    subject = _subject;
    body = _body;
    uuid = _uuid;
    security = _security;
  } // ctor

} // class CMessage