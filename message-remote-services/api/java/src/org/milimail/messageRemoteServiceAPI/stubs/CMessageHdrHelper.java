package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CMessageHdrHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Tuesday, December 16, 2008 12:19:23 PM CET
*/

abstract public class CMessageHdrHelper
{
  private static String  _id = "IDL:CMessageHdr:1.0";

  public static void insert (org.omg.CORBA.Any a, CMessageHdr that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CMessageHdr extract (org.omg.CORBA.Any a)
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
          org.omg.CORBA.StructMember[] _members0 = new org.omg.CORBA.StructMember [11];
          org.omg.CORBA.TypeCode _tcOf_members0 = null;
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[0] = new org.omg.CORBA.StructMember (
            "id",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().get_primitive_tc (org.omg.CORBA.TCKind.tk_ulong);
          _members0[1] = new org.omg.CORBA.StructMember (
            "key",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[2] = new org.omg.CORBA.StructMember (
            "uri",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[3] = new org.omg.CORBA.StructMember (
            "author",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[4] = new org.omg.CORBA.StructMember (
            "subject",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (AddressesHelper.id (), "Addresses", _tcOf_members0);
          _members0[5] = new org.omg.CORBA.StructMember (
            "recipients",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_sequence_tc (0, _tcOf_members0);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_alias_tc (AddressesHelper.id (), "Addresses", _tcOf_members0);
          _members0[6] = new org.omg.CORBA.StructMember (
            "ccRecipients",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[7] = new org.omg.CORBA.StructMember (
            "date",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[8] = new org.omg.CORBA.StructMember (
            "charset",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().get_primitive_tc (org.omg.CORBA.TCKind.tk_boolean);
          _members0[9] = new org.omg.CORBA.StructMember (
            "isRead",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().get_primitive_tc (org.omg.CORBA.TCKind.tk_ulong);
          _members0[10] = new org.omg.CORBA.StructMember (
            "size",
            _tcOf_members0,
            null);
          __typeCode = org.omg.CORBA.ORB.init ().create_struct_tc (CMessageHdrHelper.id (), "CMessageHdr", _members0);
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

  public static CMessageHdr read (org.omg.CORBA.portable.InputStream istream)
  {
    CMessageHdr value = new CMessageHdr ();
    value.id = istream.read_string ();
    value.key = istream.read_ulong ();
    value.uri = istream.read_string ();
    value.author = istream.read_string ();
    value.subject = istream.read_string ();
    value.recipients = AddressesHelper.read (istream);
    value.ccRecipients = AddressesHelper.read (istream);
    value.date = istream.read_string ();
    value.charset = istream.read_string ();
    value.isRead = istream.read_boolean ();
    value.size = istream.read_ulong ();
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CMessageHdr value)
  {
    ostream.write_string (value.id);
    ostream.write_ulong (value.key);
    ostream.write_string (value.uri);
    ostream.write_string (value.author);
    ostream.write_string (value.subject);
    AddressesHelper.write (ostream, value.recipients);
    AddressesHelper.write (ostream, value.ccRecipients);
    ostream.write_string (value.date);
    ostream.write_string (value.charset);
    ostream.write_boolean (value.isRead);
    ostream.write_ulong (value.size);
  }

}
