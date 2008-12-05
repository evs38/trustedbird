package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CAttachmentsHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 10:31:26 AM CET
*/

abstract public class CAttachmentsHelper
{
  private static String  _id = "IDL:CAttachments:1.0";

  public static void insert (org.omg.CORBA.Any a, CAttachment[] that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CAttachment[] extract (org.omg.CORBA.Any a)
  {
    return read (a.create_input_stream ());
  }

  private static org.omg.CORBA.TypeCode __typeCode = null;
  synchronized public static org.omg.CORBA.TypeCode type ()
  {
    if (__typeCode == null)
    {
      __typeCode = CAttachmentHelper.type ();
      __typeCode = org.omg.CORBA.ORB.init ().create_sequence_tc (0, __typeCode);
      __typeCode = org.omg.CORBA.ORB.init ().create_alias_tc (CAttachmentsHelper.id (), "CAttachments", __typeCode);
    }
    return __typeCode;
  }

  public static String id ()
  {
    return _id;
  }

  public static CAttachment[] read (org.omg.CORBA.portable.InputStream istream)
  {
    CAttachment value[] = null;
    int _len0 = istream.read_long ();
    value = new CAttachment[_len0];
    for (int _o1 = 0;_o1 < value.length; ++_o1)
      value[_o1] = CAttachmentHelper.read (istream);
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CAttachment[] value)
  {
    ostream.write_long (value.length);
    for (int _i0 = 0;_i0 < value.length; ++_i0)
      CAttachmentHelper.write (ostream, value[_i0]);
  }

}
