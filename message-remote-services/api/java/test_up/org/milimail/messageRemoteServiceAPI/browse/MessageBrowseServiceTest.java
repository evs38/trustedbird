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

import java.util.List;

import javax.mail.internet.MimeMessage;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.listeners.AbstractMimeMessageListener;
import org.milimail.messageRemoteServiceAPI.listeners.SourceMessageListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;

public class MessageBrowseServiceTest extends TestCase {

	private AccountServiceProxy accountService;
	private Account account;
	private MessageBrowseServiceProxy browseService;
	private SourceListener sourceMessageListener;
	private ServiceCreator serviceCreator;
	
	protected void setUp() throws Exception {
		serviceCreator = API.init();
		accountService = serviceCreator.createAccountService();
		browseService = serviceCreator.createBrowseService();
		account = setUpAccount();
		
	}

	private Account setUpAccount() throws CommunicationException,
			InternalServerException {
		List<Account> accounts = accountService.GetAllAccounts();

		Account account = accounts.get(1);
		assertNotNull(account);
		return account;
	}
	
	public void testGetMessageHdr() throws Exception {
		
		FoldersHolder foldersHolder = new FoldersHolder();
		FolderHolder folderHolder = new FolderHolder();
		browseService.getRootFolder(account, folderHolder);
		
		browseService.getAllFolders(folderHolder.getValue(), foldersHolder);
		assertNotNull(foldersHolder);
		
		Folder[] folders = foldersHolder.getValue();
		Folder folder = folders[0];
		
		MessageHandlersHolder messageHandlersHolder = new MessageHandlersHolder();
		browseService.getMessageHandlers(folder, messageHandlersHolder);
		
		MessageHandler[] handlers = messageHandlersHolder.getValue();
		for (int i = 0; i < handlers.length; i++) {
			assertNotNull(handlers[i]);
			String recipients = "";
			for (int j = 0; j < handlers[i].getRecipients().length; j++) {
				recipients += handlers[i].getRecipients()[j] + ",";
			}
			
			String cc = "";
			for (int j = 0; j < handlers[i].getCCRecipients().length; j++) {
				cc +=handlers[i].getCCRecipients()[j] + ",";
			}
			
			System.out.println(i+1 + " <ID : " + handlers[i].getId() + "> " +
					"<SUBJECT : "+ handlers[i].getSubject() +"> " +
					"<RECIPIENTS : " + recipients + "> " +
					"<CC : " + cc + "> " +
					"<AUTHOR : "+handlers[i].getAuthor() + "> " +
					"<DATE : "+handlers[i].getDate() + "> " +
					"<CHARSET :" + handlers[i].getCharset() + "> " +
					"<ISREAD :" + handlers[i].isRead() + "> " +
					"<SIZE : " + handlers[i].getSize() + ">");
		}
		
	}
	
	public void testGetRootFolder() throws Exception {
		FolderHolder folderHolder = new FolderHolder();
		browseService.getRootFolder(account, folderHolder);
		
		Folder folder = folderHolder.getValue();
		assertFolder(folder);
		
		System.out.println("rootFolder name : " + folder.getName());
		System.out.println("rootFolder uri : " + folder.getUri());
	}
	
	public void testGetLocalFolder() throws Exception {
		FolderHolder folderHolder = new FolderHolder();
		browseService.getLocalFolder(folderHolder);
		
		Folder folder = folderHolder.getValue();
		assertFolder(folder);
		
		System.out.println("local name : " + folder.getName());
		System.out.println("local uri : " + folder.getUri());
	}

	private void assertFolder(Folder folder) {
		assertNotNull(folder);
		assertTrue(folder.getName().length() > 0);
		assertTrue(folder.getUri().length() > 0);
	}
	
public void testGetAllImapFolders() throws Exception {
		
		FolderHolder folderHolder = new FolderHolder();
		browseService.getRootFolder(account, folderHolder);
		printFolders(folderHolder.getValue());
	}
	
	public void testGetAllLocalFolders() throws Exception {
		
		FolderHolder folderHolder = new FolderHolder();
		browseService.getLocalFolder(folderHolder);
		printFolders(folderHolder.getValue());
	}

	private void printFolders(Folder folder)
			throws InternalServerException {
		
		FoldersHolder foldersHolder = new FoldersHolder();
		browseService.getAllFolders(folder, foldersHolder);
		Folder[] folders = foldersHolder.getValue();
		
		for (int i = 0; i < folders.length; i++) {
			assertFolder(folders[i]);
			System.out.println("Folder " + i + " : " + folders[i].getName() + " " + folders[i].getUri());
			printFolders(folders[i]);
		}
	}
	
	public void testGetSourceMessage() throws Exception {
		FoldersHolder foldersHolder = new FoldersHolder();
		FolderHolder folderHolder = new FolderHolder();
		browseService.getRootFolder(account, folderHolder);

		browseService.getAllFolders(folderHolder.getValue(), foldersHolder);
		
		Folder folder = foldersHolder.getValue()[0];
		
		MessageHandlersHolder handlersHolder = new MessageHandlersHolder();
		browseService.getMessageHandlers(folder, handlersHolder);
		
		MessageHandler[] handlers = handlersHolder.getValue();

		for (int i = 0; i < handlers.length; i++) {
			MessageHandler handler = handlers[i];
			assertMessageHanlder(handler);
			System.out.println(handler.getURI() + " " + handler.getSubject());
			sourceMessageListener = serviceCreator.createSourceMessageListener(new SourceMessageListenerServantConsole());
			browseService.getSource(handler, sourceMessageListener);
		}
		
	}
	
	
	public void testGetMimeMessage() throws Exception {
		FoldersHolder foldersHolder = new FoldersHolder();
		FolderHolder folderHolder = new FolderHolder();
		browseService.getRootFolder(account, folderHolder);

		browseService.getAllFolders(folderHolder.getValue(), foldersHolder);
		
		Folder folder = foldersHolder.getValue()[0];
		
		MessageHandlersHolder handlersHolder = new MessageHandlersHolder();
		browseService.getMessageHandlers(folder, handlersHolder);
		
		MessageHandler[] handlers = handlersHolder.getValue();
		
		for (int i = 0; i < handlers.length; i++) {
			MessageHandler handler = handlers[i];
			assertMessageHanlder(handlers[i]);
			System.out.println(handler.getURI() + " " + handler.getSubject());
			sourceMessageListener = serviceCreator.createSourceMessageListener(new AbstractMimeMessageListener() {
			
				@Override
				public void onLoad(MimeMessage mimeMessage) {
					assertNotNull(mimeMessage);
					try {
						assertTrue(mimeMessage.getContent().toString().length() > 0);
					} catch (Exception e){
						fail();
					}
				}
			});
			
			browseService.getDecryptedSource(handler, sourceMessageListener);
		
		}
		
		
	}

	private void assertMessageHanlder(MessageHandler messageHandler) {
		assertNotNull(messageHandler);
		assertTrue(messageHandler.getURI().length() > 0);
		
	}	
}
