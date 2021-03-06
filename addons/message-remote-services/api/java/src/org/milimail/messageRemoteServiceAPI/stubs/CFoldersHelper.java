package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CFoldersHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
*/

abstract public class CFoldersHelper
{
  private static String  _id = "IDL:CFolders:1.0";

  public static void insert (org.omg.CORBA.Any a, CFolder[] that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CFolder[] extract (org.omg.CORBA.Any a)
  {
    return read (a.create_input_stream ());
  }

  private static org.omg.CORBA.TypeCode __typeCode = null;
  synchronized public static org.omg.CORBA.TypeCode type ()
  {
    if (__typeCode == null)
    {
      __typeCode = CFolderHelper.type ();
      __typeCode = org.omg.CORBA.ORB.init ().create_sequence_tc (0, __typeCode);
      __typeCode = org.omg.CORBA.ORB.init ().create_alias_tc (CFoldersHelper.id (), "CFolders", __typeCode);
    }
    return __typeCode;
  }

  public static String id ()
  {
    return _id;
  }

  public static CFolder[] read (org.omg.CORBA.portable.InputStream istream)
  {
    CFolder value[] = null;
    int _len0 = istream.read_long ();
    value = new CFolder[_len0];
    for (int _o1 = 0;_o1 < value.length; ++_o1)
      value[_o1] = CFolderHelper.read (istream);
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CFolder[] value)
  {
    ostream.write_long (value.length);
    for (int _i0 = 0;_i0 < value.length; ++_i0)
      CFolderHelper.write (ostream, value[_i0]);
  }

}
