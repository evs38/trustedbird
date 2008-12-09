package org.milimail.messageRemoteServiceAPI.stubs;

/**
* _SourceMessageListenerStub.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/ClientServices.idl
* Tuesday, December 9, 2008 4:34:42 PM CET
*/

public class _SourceMessageListenerStub extends org.omg.CORBA.portable.ObjectImpl implements SourceMessageListener
{

  public void OnLoad (String source, CHeader[] p_headers)
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("OnLoad", true);
                $out.write_string (source);
                CHeadersHelper.write ($out, p_headers);
                $in = _invoke ($out);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                OnLoad (source, p_headers        );
            } finally {
                _releaseReply ($in);
            }
  } // OnLoad

  // Type-specific CORBA::Object operations
  private static String[] __ids = {
    "IDL:SourceMessageListener:1.0"};

  public String[] _ids ()
  {
    return (String[])__ids.clone ();
  }

  private void readObject (java.io.ObjectInputStream s) throws java.io.IOException
  {
     String str = s.readUTF ();
     String[] args = null;
     java.util.Properties props = null;
     org.omg.CORBA.Object obj = org.omg.CORBA.ORB.init (args, props).string_to_object (str);
     org.omg.CORBA.portable.Delegate delegate = ((org.omg.CORBA.portable.ObjectImpl) obj)._get_delegate ();
     _set_delegate (delegate);
  }

  private void writeObject (java.io.ObjectOutputStream s) throws java.io.IOException
  {
     String[] args = null;
     java.util.Properties props = null;
     String str = org.omg.CORBA.ORB.init (args, props).object_to_string (this);
     s.writeUTF (str);
  }
} // class _SourceMessageListenerStub
