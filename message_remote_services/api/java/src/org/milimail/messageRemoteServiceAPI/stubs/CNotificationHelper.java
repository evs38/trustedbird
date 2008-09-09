package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CNotificationHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Tuesday, September 9, 2008 3:54:32 PM CEST
*/

abstract public class CNotificationHelper
{
  private static String  _id = "IDL:CNotification/CNotification:1.0";

  public static void insert (org.omg.CORBA.Any a, CNotification that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CNotification extract (org.omg.CORBA.Any a)
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
          org.omg.CORBA.StructMember[] _members0 = new org.omg.CORBA.StructMember [3];
          org.omg.CORBA.TypeCode _tcOf_members0 = null;
          _tcOf_members0 = org.omg.CORBA.ORB.init ().get_primitive_tc (org.omg.CORBA.TCKind.tk_boolean);
          _members0[0] = new org.omg.CORBA.StructMember (
            "isDSNRequested",
            _tcOf_members0,
            null);
          _tcOf_members0 = CDSNTypeHelper.type ();
          _members0[1] = new org.omg.CORBA.StructMember (
            "DSNType",
            _tcOf_members0,
            null);
          _tcOf_members0 = org.omg.CORBA.ORB.init ().get_primitive_tc (org.omg.CORBA.TCKind.tk_boolean);
          _members0[2] = new org.omg.CORBA.StructMember (
            "isMDNReadRequested",
            _tcOf_members0,
            null);
          __typeCode = org.omg.CORBA.ORB.init ().create_struct_tc (CNotificationHelper.id (), "CNotification", _members0);
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

  public static CNotification read (org.omg.CORBA.portable.InputStream istream)
  {
    CNotification value = new CNotification ();
    value.isDSNRequested = istream.read_boolean ();
    value.DSNType = CDSNTypeHelper.read (istream);
    value.isMDNReadRequested = istream.read_boolean ();
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CNotification value)
  {
    ostream.write_boolean (value.isDSNRequested);
    CDSNTypeHelper.write (ostream, value.DSNType);
    ostream.write_boolean (value.isMDNReadRequested);
  }

}
