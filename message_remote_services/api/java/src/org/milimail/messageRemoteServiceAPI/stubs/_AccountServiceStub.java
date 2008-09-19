package org.milimail.messageRemoteServiceAPI.stubs;

/**
* _AccountServiceStub.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message_remote_services/src/corba/Services.idl
* Friday, September 19, 2008 6:32:29 PM CEST
*/

public class _AccountServiceStub extends org.omg.CORBA.portable.ObjectImpl implements AccountService
{

  public CAccount[] GetAllAccounts () throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetAllAccounts", true);
                $in = _invoke ($out);
                CAccount $result[] = CAccountsHelper.read ($in);
                return $result;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                return GetAllAccounts (        );
            } finally {
                _releaseReply ($in);
            }
  } // GetAllAccounts

  // Type-specific CORBA::Object operations
  private static String[] __ids = {
    "IDL:AccountService:1.0"};

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
} // class _AccountServiceStub
