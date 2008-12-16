package org.milimail.messageRemoteServiceAPI.stubs;

/**
* SourceListenerPOA.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/ClientServices.idl
* Tuesday, December 16, 2008 12:19:23 PM CET
*/

public abstract class SourceListenerPOA extends org.omg.PortableServer.Servant
 implements SourceListenerOperations, org.omg.CORBA.portable.InvokeHandler
{

  // Constructors

  private static java.util.Hashtable _methods = new java.util.Hashtable ();
  static
  {
    _methods.put ("OnLoad", new java.lang.Integer (0));
  }

  public org.omg.CORBA.portable.OutputStream _invoke (String $method,
                                org.omg.CORBA.portable.InputStream in,
                                org.omg.CORBA.portable.ResponseHandler $rh)
  {
    org.omg.CORBA.portable.OutputStream out = null;
    java.lang.Integer __method = (java.lang.Integer)_methods.get ($method);
    if (__method == null)
      throw new org.omg.CORBA.BAD_OPERATION (0, org.omg.CORBA.CompletionStatus.COMPLETED_MAYBE);

    switch (__method.intValue ())
    {
       case 0:  // SourceListener/OnLoad
       {
         String source = in.read_string ();
         this.OnLoad (source);
         out = $rh.createReply();
         break;
       }

       default:
         throw new org.omg.CORBA.BAD_OPERATION (0, org.omg.CORBA.CompletionStatus.COMPLETED_MAYBE);
    }

    return out;
  } // _invoke

  // Type-specific CORBA::Object operations
  private static String[] __ids = {
    "IDL:SourceListener:1.0"};

  public String[] _all_interfaces (org.omg.PortableServer.POA poa, byte[] objectId)
  {
    return (String[])__ids.clone ();
  }

  public SourceListener _this() 
  {
    return SourceListenerHelper.narrow(
    super._this_object());
  }

  public SourceListener _this(org.omg.CORBA.ORB orb) 
  {
    return SourceListenerHelper.narrow(
    super._this_object(orb));
  }


} // class SourceListenerPOA
