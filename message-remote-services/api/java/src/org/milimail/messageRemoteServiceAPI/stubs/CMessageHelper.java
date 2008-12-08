package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessageHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, December 8, 2008 11:31:29 AM CET
*/

abstract public class CMessageHelper
{
  private static String  _id = "IDL:CMessage:1.0";

  public static void insert (org.omg.CORBA.Any a, CMessage that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CMessage extract (org.omg.CORBA.Any a)
  {
    return read (a.create_input_stream ());
  }

  private static org.omg.CORBA.TypeCode __typeCode = null;
  private static boolean __active = false;
  synchronized public static org.omg.CORBA.TypeCode type ()
  {
    if (__typeCode == null)
    {
      synchronized (org.omg.CORBA.TypeCode.class)
      {
        if (__typeCode == null)
        {
          if (__active)
          {
            return org.omg.CORBA.ORB.init().create_recursive_tc ( _id );
          }
          __active = true;
          org.omg.CORBA.StructMember[] _members0 = new org.omg.CORBA.StructMember [10];
          org.omg.CORBA.TypeCode _tcOf_members0 = null;
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (AddressesHelper.id (), "Addresses", _tcOf_members0);
          _members0[0] = new org.omg.CORBA.StructMember (
            "recipients_to",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (AddressesHelper.id (), "Addresses", _tcOf_members0);
          _members0[1] = new org.omg.CORBA.StructMember (
            "recipients_cc",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (AddressesHelper.id (), "Addresses", _tcOf_members0);
          _members0[2] = new org.omg.CORBA.StructMember (
            "recipients_bcc",
            _tcOf_members0,
            null);
          _tcOf_members0 = CNotificationHelper.type ();
          _members0[3] = new org.omg.CORBA.StructMember (
            "notification",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[4] = new org.omg.CORBA.StructMember (
            "subject",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[5] = new org.omg.CORBA.StructMember (
            "body",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[6] = new org.omg.CORBA.StructMember (
            "uuid",
            _tcOf_members0,
            null);
          _tcOf_members0 = CSecurityHelper.type ();
          _members0[7] = new org.omg.CORBA.StructMember (
            "security",
            _tcOf_members0,
            null);
          _tcOf_members0 = CHeaderHelper.type ();
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (CHeadersHelper.id (), "CHeaders", _tcOf_members0);
          _members0[8] = new org.omg.CORBA.StructMember (
            "p_headers",
            _tcOf_members0,
            null);
          _tcOf_members0 = CAttachmentHelper.type ();
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (CAttachmentsHelper.id (), "CAttachments", _tcOf_members0);
          _members0[9] = new org.omg.CORBA.StructMember (
            "p_attachments",
            _tcOf_members0,
            null);
          __typeCode = org.omg.CORBA.ORB.init ().create_struct_tc (CMessageHelper.id (), "CMessage", _members0);
          __active = false;
        }
      }
    }
    return __typeCode;
  }

  public static String id ()
  {
    return _id;
  }

  public static CMessage read (org.omg.CORBA.portable.InputStream istream)
  {
    CMessage value = new CMessage ();
    value.recipients_to = AddressesHelper.read (istream);
    value.recipients_cc = AddressesHelper.read (istream);
    value.recipients_bcc = AddressesHelper.read (istream);
    value.notification = CNotificationHelper.read (istream);
    value.subject = istream.read_string ();
    value.body = istream.read_string ();
    value.uuid = istream.read_string ();
    value.security = CSecurityHelper.read (istream);
    value.p_headers = CHeadersHelper.read (istream);
    value.p_attachments = CAttachmentsHelper.read (istream);
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CMessage value)
  {
    AddressesHelper.write (ostream, value.recipients_to);
    AddressesHelper.write (ostream, value.recipients_cc);
    AddressesHelper.write (ostream, value.recipients_bcc);
    CNotificationHelper.write (ostream, value.notification);
    ostream.write_string (value.subject);
    ostream.write_string (value.body);
    ostream.write_string (value.uuid);
    CSecurityHelper.write (ostream, value.security);
    CHeadersHelper.write (ostream, value.p_headers);
    CAttachmentsHelper.write (ostream, value.p_attachments);
  }

}
