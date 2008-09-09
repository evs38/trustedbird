package org.milimail.messageRemoteServiceAPI.stubs;

/**
* AccountServiceHelper.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Tuesday, September 9, 2008 3:54:32 PM CEST
*/

abstract public class AccountServiceHelper
{
  private static String  _id = "IDL:AccountService:1.0";

  public static void insert (org.omg.CORBA.Any a, AccountService that)
  {
    org.omg.CORBA.portable.OutputStream out = a.create_output_stream ();
    a.type (type ());
    write (out, that);
    a.read_value (out.create_input_stream (), type ());
  }

  public static AccountService extract (org.omg.CORBA.Any a)
  {
    return read (a.create_input_stream ());
  }

  private static org.omg.CORBA.TypeCode __typeCode = null;
  synchronized public static org.omg.CORBA.TypeCode type ()
  {
    if (__typeCode == null)
    {
      __typeCode = org.omg.CORBA.ORB.init ().create_interface_tc (AccountServiceHelper.id (), "AccountService");
    }
    return __typeCode;
  }

  public static String id ()
  {
    return _id;
  }

  public static AccountService read (org.omg.CORBA.portable.InputStream istream)
  {
    return narrow (istream.read_Object (_AccountServiceStub.class));
  }

  public static void write (org.omg.CORBA.portable.OutputStream ostream, AccountService value)
  {
    ostream.write_Object ((org.omg.CORBA.Object) value);
  }

  public static AccountService narrow (org.omg.CORBA.Object obj)
  {
    if (obj == null)
      return null;
    else if (obj instanceof AccountService)
      return (AccountService)obj;
    else if (!obj._is_a (id ()))
      throw new org.omg.CORBA.BAD_PARAM ();
    else
    {
      org.omg.CORBA.portable.Delegate delegate = ((org.omg.CORBA.portable.ObjectImpl)obj)._get_delegate ();
      _AccountServiceStub stub = new _AccountServiceStub ();
      stub._set_delegate(delegate);
      return stub;
    }
  }

  public static AccountService unchecked_narrow (org.omg.CORBA.Object obj)
  {
    if (obj == null)
      return null;
    else if (obj instanceof AccountService)
      return (AccountService)obj;
    else
    {
      org.omg.CORBA.portable.Delegate delegate = ((org.omg.CORBA.portable.ObjectImpl)obj)._get_delegate ();
      _AccountServiceStub stub = new _AccountServiceStub ();
      stub._set_delegate(delegate);
      return stub;
    }
  }

}
