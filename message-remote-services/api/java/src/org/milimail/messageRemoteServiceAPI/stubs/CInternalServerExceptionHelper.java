package org.milimail.messageRemoteServiceAPI.stubs;

/**
* CInternalServerExceptionHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Friday, December 5, 2008 3:26:53 PM CET
*/

abstract public class CInternalServerExceptionHelper
{
  private static String  _id = "IDL:CInternalServerException:1.0";

  public static void insert (org.omg.CORBA.Any a, CInternalServerException that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static CInternalServerException extract (org.omg.CORBA.Any a)
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
          org.omg.CORBA.StructMember[] _members0 = new org.omg.CORBA.StructMember [1];
          org.omg.CORBA.TypeCode _tcOf_members0 = null;
          _tcOf_members0 = org.omg.CORBA.ORB.init ().create_string_tc (0);
          _members0[0] = new org.omg.CORBA.StructMember (
            "cause",
            _tcOf_members0,
            null);
          __typeCode = org.omg.CORBA.ORB.init ().create_exception_tc (CInternalServerExceptionHelper.id (), "CInternalServerException", _members0);
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

  public static CInternalServerException read (org.omg.CORBA.portable.InputStream istream)
  {
    CInternalServerException value = new CInternalServerException ();
    // read and discard the repository ID
    istream.read_string ();
    value.cause = istream.read_string ();
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, CInternalServerException value)
  {
    // write the repository ID
    ostream.write_string (id ());
    ostream.write_string (value.cause);
  }

}
