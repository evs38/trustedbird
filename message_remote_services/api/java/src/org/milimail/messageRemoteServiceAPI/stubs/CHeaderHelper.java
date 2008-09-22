package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CHeaderHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Monday, September 22, 2008 6:24:12 PM CEST
*/

abstract public class CHeaderHelper
{
  private static String  _id = "IDL:CHeader/CHeader:1.0";

  public static void insert (org.omg.CORBA.Any a, CHeader that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CHeader extract (org.omg.CORBA.Any a)
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
          org.omg.CORBA.StructMember[] _members0 = new org.omg.CORBA.StructMember [2];
          org.omg.CORBA.TypeCode _tcOf_members0 = null;
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[0] = new org.omg.CORBA.StructMember (
            "key",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[1] = new org.omg.CORBA.StructMember (
            "value",
            _tcOf_members0,
            null);
          __typeCode = org.omg.CORBA.ORB.init ().create_struct_tc (CHeaderHelper.id (), "CHeader", _members0);
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

  public static CHeader read (org.omg.CORBA.portable.InputStream istream)
  {
    CHeader value = new CHeader ();
    value.key = istream.read_string ();
    value.value = istream.read_string ();
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CHeader value)
  {
    ostream.write_string (value.key);
    ostream.write_string (value.value);
  }

}
