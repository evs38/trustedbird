package org.milimail.messageRemoteServiceAPI.browse;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.CFolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFolderHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFoldersHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CInternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdr;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdrsHolder;
import org.milimail.messageRemoteServiceAPI.stubs.MessageBrowseService;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;

public class MessageBrowseServiceProxy {

	private MessageBrowseService service;

	public MessageBrowseServiceProxy(MessageBrowseService service) {
		this.service = service;
	}

	public void getMessageHdrs(CFolder folder, CMessageHdrsHolder key)
			throws InternalServerException {
		try {
			service.GetMessageHdrs(folder, key);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getAllFolders(CFolder rootFolder, CFoldersHolder folders)
			throws InternalServerException {
		try {
			service.GetAllFolders(rootFolder, folders);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getRootFolder(Account account, CFolderHolder folder)
			throws InternalServerException {
		try {
			service.GetRootFolder(account.getCorbaObject(), folder);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getLocalFolder(CFolderHolder folder)
			throws InternalServerException {
		try {
			service.GetLocalFolder(folder);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	
	public void getSource(CMessageHdr hdr, SourceListener sourceListener)
			throws InternalServerException {
		try {
			service.GetSource(hdr, sourceListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}

	public void getDecryptedSource(CMessageHdr hdr, SourceListener listener)
			throws InternalServerException {
		try {
			service.GetDecryptedSource(hdr, listener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}
	
	public void getNewMessages(CFolder folder)
			throws InternalServerException {
		try {
			service.GetNewMessages(folder);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

}
}
