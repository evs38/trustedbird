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
package org.milimail.messageRemoteServiceAPI.compose;

import java.io.File;
import java.util.List;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.listeners.MessageSendListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;

public abstract class AbstractMessageServiceTest extends TestCase {
	protected MessageComposeServiceProxy composeService;
	protected AccountServiceProxy accountService;
	protected MessageSendListener messageListener;
	protected Account account;
	protected String testPath;
    protected String[] to = { "user2@test.milimail.org" };
	protected void setUp() throws Exception {
		ServiceCreator serviceCreator = API.init();
		composeService = serviceCreator.createMessageComposeService();
		accountService = serviceCreator.createAccountService();
		messageListener = serviceCreator
				.createMessageSendListener(new MessageSendListenerServantConsole());
		account = setUpAccount();
		testPath = new File("./res/test").getCanonicalPath();
	}

	private Account setUpAccount() throws CommunicationException,
			InternalServerException {
		List<Account> accounts = accountService.GetAllAccounts();

		Account account = accounts.get(1);
		assertNotNull(account);
		return account;
	}
}
