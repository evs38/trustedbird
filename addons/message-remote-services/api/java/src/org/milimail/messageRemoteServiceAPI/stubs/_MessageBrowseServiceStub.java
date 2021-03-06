package org.milimail.messageRemoteServiceAPI.stubs;

/**
* _MessageBrowseServiceStub.java .
* Generated by the IDL-to-Java compiler (portable), version "3.2"
* from ../message-remote-services/src/corba/Services.idl
* Monday, January 26, 2009 3:56:37 PM CET
*/

public class _MessageBrowseServiceStub extends org.omg.CORBA.portable.ObjectImpl implements MessageBrowseService
{

  public void GetRootFolder (CAccount p_account, CFolderHolder p_rootFolder) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetRootFolder", true);
                CAccountHelper.write ($out, p_account);
                $in = _invoke ($out);
                p_rootFolder.value = CFolderHelper.read ($in);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetRootFolder (p_account, p_rootFolder        );
            } finally {
                _releaseReply ($in);
            }
  } // GetRootFolder

  public void GetLocalFolder (CFolderHolder p_localFolder) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetLocalFolder", true);
                $in = _invoke ($out);
                p_localFolder.value = CFolderHelper.read ($in);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetLocalFolder (p_localFolder        );
            } finally {
                _releaseReply ($in);
            }
  } // GetLocalFolder

  public void GetAllFolders (CFolder p_rootFolder, CFoldersHolder p_folders) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetAllFolders", true);
                CFolderHelper.write ($out, p_rootFolder);
                $in = _invoke ($out);
                p_folders.value = CFoldersHelper.read ($in);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetAllFolders (p_rootFolder, p_folders        );
            } finally {
                _releaseReply ($in);
            }
  } // GetAllFolders

  public void GetMessageHdrs (CFolder p_folder, CMessageHdrsHolder p_messageHdrs) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetMessageHdrs", true);
                CFolderHelper.write ($out, p_folder);
                $in = _invoke ($out);
                p_messageHdrs.value = CMessageHdrsHelper.read ($in);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetMessageHdrs (p_folder, p_messageHdrs        );
            } finally {
                _releaseReply ($in);
            }
  } // GetMessageHdrs

  public void GetSource (CMessageHdr p_messageHdr, SourceListener p_sourceListener) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetSource", true);
                CMessageHdrHelper.write ($out, p_messageHdr);
                SourceListenerHelper.write ($out, p_sourceListener);
                $in = _invoke ($out);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetSource (p_messageHdr, p_sourceListener        );
            } finally {
                _releaseReply ($in);
            }
  } // GetSource

  public void GetDecryptedSource (CMessageHdr p_messageHdr, SourceListener p_sourceListener) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetDecryptedSource", true);
                CMessageHdrHelper.write ($out, p_messageHdr);
                SourceListenerHelper.write ($out, p_sourceListener);
                $in = _invoke ($out);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetDecryptedSource (p_messageHdr, p_sourceListener        );
            } finally {
                _releaseReply ($in);
            }
  } // GetDecryptedSource

  public void GetNewMessages (CFolder p_Folder) throws CInternalServerException
  {
            org.omg.CORBA.portable.InputStream $in = null;
            try {
                org.omg.CORBA.portable.OutputStream $out = _request ("GetNewMessages", true);
                CFolderHelper.write ($out, p_Folder);
                $in = _invoke ($out);
                return;
            } catch (org.omg.CORBA.portable.ApplicationException $ex) {
                $in = $ex.getInputStream ();
                String _id = $ex.getId ();
                if (_id.equals ("IDL:CInternalServerException:1.0"))
                    throw CInternalServerExceptionHelper.read ($in);
                else
                    throw new org.omg.CORBA.MARSHAL (_id);
            } catch (org.omg.CORBA.portable.RemarshalException $rm) {
                GetNewMessages (p_Folder        );
            } finally {
                _releaseReply ($in);
            }
  } // GetNewMessages

  // Type-specific CORBA::Object operations
  private static String[] __ids = {
    "IDL:MessageBrowseService:1.0"};

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
} // class _MessageBrowseServiceStub
