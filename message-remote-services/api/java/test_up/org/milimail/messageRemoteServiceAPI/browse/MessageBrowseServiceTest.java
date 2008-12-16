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
import org.milimail.messageRemoteServiceAPI.stubs.CFolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFolderHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFoldersHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdr;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdrsHolder;
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
		CMessageHdrsHolder hdrsHolder = new CMessageHdrsHolder();
		CFoldersHolder foldersHolder = new CFoldersHolder();
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getRootFolder(account, folderHolder);
		
		browseService.getAllFolders(folderHolder.value, foldersHolder);
		assertNotNull(foldersHolder);
		
		CFolder[] folders = foldersHolder.value;
		CFolder folder = folders[0];
		
		browseService.getMessageHdrs(folder, hdrsHolder);
		
		CMessageHdr[] hdrs = hdrsHolder.value;
		for (int i = 0; i < hdrs.length; i++) {
			assertNotNull(hdrs[i]);
			String recipients = "";
			for (int j = 0; j < hdrs[i].recipients.length; j++) {
				recipients +=hdrs[i].recipients[j] + ",";
			}
			
			String cc = "";
			for (int j = 0; j < hdrs[i].ccRecipients.length; j++) {
				cc +=hdrs[i].ccRecipients[j] + ",";
			}
			
			System.out.println(i+1 + " <ID : " + hdrs[i].id + "> " +
					"<SUBJECT : "+hdrs[i].subject +"> " +
					"<RECIPIENTS : " + recipients + "> " +
					"<CC : " + cc + "> " +
					"<AUTHOR : "+hdrs[i].author + "> " +
					"<DATE : "+hdrs[i].date + "> " +
					"<CHARSET :" + hdrs[i].charset + "> " +
					"<ISREAD :" + hdrs[i].isRead + "> " +
					"<SIZE : " + hdrs[i].size + ">");
		}
		
	}
	
	public void testGetRootFolder() throws Exception {
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getRootFolder(account, folderHolder);
		
		CFolder folder = folderHolder.value;
		assertNotNull(folder);
		System.out.println("rootFolder name : " + folder.name);
		System.out.println("rootFolder uri : " + folder.uri);
	}
	
	public void testGetLocalFolder() throws Exception {
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getLocalFolder(folderHolder);
		
		CFolder folder = folderHolder.value;
		assertNotNull(folder);
		System.out.println("local name : " + folder.name);
		System.out.println("local uri : " + folder.uri);
	}
	
public void testGetAllImapFolders() throws Exception {
		
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getRootFolder(account, folderHolder);
		
		printFolders(folderHolder.value);
	}
	
	public void testGetAllLocalFolders() throws Exception {
		
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getLocalFolder(folderHolder);
		
		printFolders(folderHolder.value);
	}

	private void printFolders(CFolder folder)
			throws InternalServerException {
		
		CFoldersHolder folders = new CFoldersHolder();
		browseService.getAllFolders(folder, folders);
		CFolder[] afolders = folders.value;
		
		for (int i = 0; i < afolders.length; i++) {
			assertNotNull(afolders[i].name);
			assertNotNull(afolders[i].uri);
			assertTrue(afolders[i].uri.length() > 0);
			assertTrue(afolders[i].name.length() > 0);
			System.out.println("Folder " + i + " : " + afolders[i].name + " " + afolders[i].uri);
			printFolders(afolders[i]);
		}
	}
	
	public void testGetSourceMessage() throws Exception {
		CFoldersHolder foldersHolder = new CFoldersHolder();
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getRootFolder(account, folderHolder);

		browseService.getAllFolders(folderHolder.value, foldersHolder);
		
		CFolder folder = foldersHolder.value[0];
		
		CMessageHdrsHolder hdrHolder = new CMessageHdrsHolder();
		browseService.getMessageHdrs(folder, hdrHolder);
		
		CMessageHdr[] hdrs = hdrHolder.value;

		for (int i = 0; i < hdrs.length; i++) {
			CMessageHdr hdr = hdrs[i];
			System.out.println(hdr.uri + " " + hdr.subject);
			sourceMessageListener = serviceCreator.createSourceMessageListener(new SourceMessageListenerServantConsole());
			browseService.getSource(hdr, sourceMessageListener);
		}
		
	}
	
	
	public void testGetMimeMessage() throws Exception {
		CFoldersHolder foldersHolder = new CFoldersHolder();
		CFolderHolder folderHolder = new CFolderHolder();
		browseService.getRootFolder(account, folderHolder);

		browseService.getAllFolders(folderHolder.value, foldersHolder);
		
		CFolder folder = foldersHolder.value[0];
		System.out.println(folder.name);
		CMessageHdrsHolder hdrHolder = new CMessageHdrsHolder();
		browseService.getMessageHdrs(folder, hdrHolder);
		
		CMessageHdr[] hdrs = hdrHolder.value;
		
		for (int i = 0; i < hdrs.length; i++) {
			CMessageHdr hdr = hdrs[i];
			System.out.println(hdr.uri + " " + hdr.subject);
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
			
			browseService.getDecryptedSource(hdr, sourceMessageListener);
		
		}
		
		
	}	
}
