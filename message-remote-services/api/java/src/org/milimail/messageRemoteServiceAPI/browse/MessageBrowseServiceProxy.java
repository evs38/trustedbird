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
import org.milimail.messageRemoteServiceAPI.stubs.SourceMessageListener;
import org.omg.CORBA.StringHolder;

public class MessageBrowseServiceProxy {
	
	private MessageBrowseService service;

	public MessageBrowseServiceProxy(MessageBrowseService service) {
		this.service = service;
	}

	public void GetMessageHdrs(CFolder folder, CMessageHdrsHolder key) throws InternalServerException {
		try {
			service.GetMessageHdrs(folder, key);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void GetAllFolders(CFolder rootFolder, CFoldersHolder folders) throws InternalServerException {
		try {
			service.GetAllFolders(rootFolder, folders);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void GetRootFolder(Account account, CFolderHolder folder) throws InternalServerException {
		try {
			service.GetRootFolder(account.getCorbaObject(), folder);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}
	
	public void GetBody(CMessageHdr hdr, SourceMessageListener sourceMessageListener)
			throws InternalServerException {
		try {
			service.GetBody(hdr, sourceMessageListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}

	public void GetSourceMessage(String uri, StringHolder source)
			throws InternalServerException {
		try {
			service.GetSourceMessage(uri, source);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}


}
