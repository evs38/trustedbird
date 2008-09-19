package org.milimail.messageRemoteServiceAPI.browse;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.stubs.CFolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFolderHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFoldersHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdrsHolder;
import org.milimail.messageRemoteServiceAPI.stubs.MessageBrowseService;

public class MessageBrowseServiceProxy {
	
	private MessageBrowseService service;

	public MessageBrowseServiceProxy(MessageBrowseService service) {
		this.service = service;
	}

	public void GetMessageHdrs(CFolder folder, CMessageHdrsHolder key) {
		service.GetMessageHdrs(folder, key);
	}

	public void GetAllFolders(CFolder rootFolder, CFoldersHolder folders) {
		service.GetAllFolders(rootFolder, folders);
	}

	public void GetRootFolder(Account account, CFolderHolder folder) {
		service.GetRootFolder(account.getCorbaObject(), folder);
	}
	
	

}
