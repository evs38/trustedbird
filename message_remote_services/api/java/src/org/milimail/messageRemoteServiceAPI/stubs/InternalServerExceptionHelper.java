package org.milimail.messageRemoteServiceAPI.stubs;

/**
* InternalServerExceptionHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Friday, February 29, 2008 3:08:01 PM CET
*/

abstract public class InternalServerExceptionHelper
{
  private static String  _id = "IDL:InternalServerException:1.0";

  public static void insert (org.omg.CORBA.Any a, InternalServerException that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static InternalServerException extract (org.omg.CORBA.Any a)
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
          __typeCode = org.omg.CORBA.ORB.init ().create_exception_tc (InternalServerExceptionHelper.id (), "InternalServerException", _members0);
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

  public static InternalServerException read (org.omg.CORBA.portable.InputStream istream)
  {
    InternalServerException value = new InternalServerException ();
    // read and discard the repository ID
    istream.read_string ();
    value.cause = istream.read_string ();
    return value;
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, InternalServerException value)
  {
    // write the repository ID
    ostream.write_string (id ());
    ostream.write_string (value.cause);
  }

}
