package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessage.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:54 PM CET
*/

public final class CMessage implements org.omg.CORBA.portable.IDLEntity
{
  public String recipients_to[] = null;
  public String recipients_cc[] = null;
  public String recipients_bcc[] = null;
  public CNotification notification = null;
  public String subject = null;
  public String body = null;
  public String uuid = null;
  public CSecurity security = null;
  public CHeader p_headers[] = null;
  public CAttachment p_attachments[] = null;

  public CMessage ()
  {
  } // ctor

  public CMessage (String[] _recipients_to, String[] _recipients_cc, String[] _recipients_bcc, CNotification _notification, String _subject, String _body, String _uuid, CSecurity _security, CHeader[] _p_headers, CAttachment[] _p_attachments)
  {
    recipients_to = _recipients_to;
    recipients_cc = _recipients_cc;
    recipients_bcc = _recipients_bcc;
    notification = _notification;
    subject = _subject;
    body = _body;
    uuid = _uuid;
    security = _security;
    p_headers = _p_headers;
    p_attachments = _p_attachments;
  } // ctor

} // class CMessage
