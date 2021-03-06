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
package org.milimail.messageRemoteServiceAPI.account;

import java.util.ArrayList;
import java.util.List;

import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.AccountService;
import org.milimail.messageRemoteServiceAPI.stubs.CAccount;
import org.milimail.messageRemoteServiceAPI.stubs.CInternalServerException;

import org.omg.CORBA.COMM_FAILURE;
/**
 * This Class is a proxy to access the Account Service of Thunderbird MRS XPI
 * @author Olivier PARNIERE BT France
 *
 */
public class AccountServiceProxy {
	private AccountService accountService;

	public AccountServiceProxy(AccountService accountService) {
		super();
		this.accountService = accountService;
	}

	public List<Account> GetAllAccounts() throws CommunicationException,
			InternalServerException {
		CAccount[] caccounts = null;
		try {
			caccounts = accountService.GetAllAccounts();
		} catch (COMM_FAILURE e) {
			throw new CommunicationException(
					"Communication Failure with Server", e);
		} catch (CInternalServerException internalServerException) {
			throw new InternalServerException(internalServerException);
		}
		
		List<Account> accounts = new ArrayList<Account>();
		
		for (int i = 0; i < caccounts.length; i++) {
			accounts.add(new Account(caccounts[i]));
		}
		
		return accounts;
	}

}
