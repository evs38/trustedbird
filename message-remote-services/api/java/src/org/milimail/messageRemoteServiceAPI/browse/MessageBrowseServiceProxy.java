package org.milimail.messageRemoteServiceAPI.browse;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.BodyListener;
import org.milimail.messageRemoteServiceAPI.stubs.BrowseMessageListener;
import org.milimail.messageRemoteServiceAPI.stubs.CFolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFolderHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFoldersHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CInternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdr;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdrsHolder;
import org.milimail.messageRemoteServiceAPI.stubs.HeadersListener;
import org.milimail.messageRemoteServiceAPI.stubs.MessageBrowseService;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;
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
	
	public void GetSourceMessage(CMessageHdr hdr, SourceListener sourceListener)
			throws InternalServerException {
		try {
			service.GetSourceMessage(hdr, sourceListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}

	public void GetBody(CMessageHdr hdr,
			BodyListener bodyListener)
			throws InternalServerException {
		try {
			service.GetBody(hdr, bodyListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}
	
	public void GetHeaders(CMessageHdr hdr,
			HeadersListener headersListener)
			throws InternalServerException {
		try {
			service.GetHeaders(hdr, headersListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}

}
