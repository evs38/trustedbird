package org.milimail.messageRemoteServiceAPI.stubs;

/**
* SourceListenerHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/ClientServices.idl
* Monday, January 26, 2009 3:56:38 PM CET
*/

abstract public class SourceListenerHelper
{
  private static String  _id = "IDL:SourceListener:1.0";

  public static void insert (org.omg.CORBA.Any a, SourceListener that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static SourceListener extract (org.omg.CORBA.Any a)
  {
    return read (a.create_input_stream ());
  }

  private static org.omg.CORBA.TypeCode __typeCode = null;
  synchronized public static org.omg.CORBA.TypeCode type ()
  {
    if (__typeCode == null)
    {
      __typeCode = org.omg.CORBA.ORB.init ().create_interface_tc (SourceListenerHelper.id (), "SourceListener");
    }
    return __typeCode;
  }

  public static String id ()
  {
    return _id;
  }

  public static SourceListener read (org.omg.CORBA.portable.InputStream istream)
  {
    return narrow (istream.read_Object (_SourceListenerStub.class));
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, SourceListener value)
  {
    ostream.write_Object ((org.omg.CORBA.Object) value);
  }

  public static SourceListener narrow (org.omg.CORBA.Object obj)
  {
    if (obj == null)
      return null;
    else if (obj instanceof SourceListener)
      return (SourceListener)obj;
    else if (!obj._is_a (id ()))
      throw new org.omg.CORBA.BAD_PARAM ();
    else
    {
      org.omg.CORBA.portable.Delegate delegate = ((org.omg.CORBA.portable.ObjectImpl)obj)._get_delegate ();
      _SourceListenerStub stub = new _SourceListenerStub ();
      stub._set_delegate(delegate);
      return stub;
    }
  }

  public static SourceListener unchecked_narrow (org.omg.CORBA.Object obj)
  {
    if (obj == null)
      return null;
    else if (obj instanceof SourceListener)
      return (SourceListener)obj;
    else
    {
      org.omg.CORBA.portable.Delegate delegate = ((org.omg.CORBA.portable.ObjectImpl)obj)._get_delegate ();
      _SourceListenerStub stub = new _SourceListenerStub ();
      stub._set_delegate(delegate);
      return stub;
    }
  }

}
