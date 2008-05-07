package org.milimail.messageRemoteServiceAPI.stubs;

/**
* _MessageComposeServiceStub.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../MessageRemoteService/src/corba/Services.idl
* Friday, March 21, 2008 5:03:22 PM CET
*/

public class _MessageComposeServiceStub extends org.omg.CORBA.portable.ObjectImpl implements MessageComposeService
{

  public void SendMessage (Account p_account, CMessage p_message, MessageSendListener p_listener) throws InternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("SendMessage", true);
                AccountHelper.write ($out, p_account);
                CMessageHelper.write ($out, p_message);
                MessageSendListenerHelper.write ($out, p_listener);
                $in = _invoke ($out);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:InternalServerException:1.0"))
                    throw InternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                SendMessage (p_account, p_message, p_listener        );
            } finally {
                _releaseReply ($in);
            }
  } // SendMessage

  // Type-specific CORBA::Object operations
  private static String[] __ids = {
    "IDL:MessageComposeService:1.0"};

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
} // class _MessageComposeServiceStub