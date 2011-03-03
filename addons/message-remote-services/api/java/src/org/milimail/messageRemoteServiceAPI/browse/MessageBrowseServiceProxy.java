/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is BT Global Services / Etat francais Ministere de la Defense
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Olivier PARNIERE <olivier.parniere_AT_gmail.com> <olivier.parniere_AT_bt.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
package org.milimail.messageRemoteServiceAPI.browse;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.CInternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.MessageBrowseService;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;
/**
 * This Class is a proxy to access the Browse Service of Thunderbird MRS XPI
 * It is used to browse mail of a running thunderbird
 * @author Olivier PARNIERE BT France
 *
 */
public class MessageBrowseServiceProxy {

	private MessageBrowseService service;

	public MessageBrowseServiceProxy(MessageBrowseService service) {
		this.service = service;
	}

	public void getMessageHandlers(Folder folder, MessageHandlersHolder messagesHolder)
			throws InternalServerException {
		try {
			service.GetMessageHdrs(folder.getCorbaObject(), messagesHolder.getCorbaObject());
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getAllFolders(Folder rootFolder, FoldersHolder folders)
			throws InternalServerException {
		try {
			service.GetAllFolders(rootFolder.getCorbaObject(), folders.getCorbaObject());
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getRootFolder(Account account, FolderHolder folder)
			throws InternalServerException {
		try {
			service.GetRootFolder(account.getCorbaObject(), folder.getCorbaObject());
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	public void getLocalFolder(FolderHolder folder)
			throws InternalServerException {
		try {
			service.GetLocalFolder(folder.getCorbaObject());
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}
	}

	
	public void getSource(MessageHandler handler, SourceListener sourceListener)
			throws InternalServerException {
		try {
			service.GetSource(handler.getCorbaObject(), sourceListener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}

	public void getDecryptedSource(MessageHandler handler, SourceListener listener)
			throws InternalServerException {
		try {
			service.GetDecryptedSource(handler.getCorbaObject(), listener);
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

	}
	
	public void getNewMessages(Folder folder)
			throws InternalServerException {
		try {
			service.GetNewMessages(folder.getCorbaObject());
		} catch (CInternalServerException e) {
			throw new InternalServerException(e);
		}

}
}
