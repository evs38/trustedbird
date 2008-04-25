package org.milimail.messageRemoteServiceAPI.account;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.stubs.Account;

public class AccountServiceTest extends TestCase {
	private AccountServiceProxy accountService;

	protected void setUp() throws Exception {
		ServiceCreator serviceCreator = API.init();
		accountService = serviceCreator.createAccountService();
	}

	public void testGetAllAccounts() throws Exception{

		Account[] accounts = null;

		accounts = accountService.GetAllAccounts();

		assertNotNull(accounts);

		for (int i = 0; i < accounts.length; i++) {
			Account account = accounts[i];
			assertNotNull(account);
			String serverName = account.serverHostName;
			String key = account.key;

			assertNotNull(serverName);
			assertNotNull(key);
			assertTrue(serverName.length() > 0);
			assertTrue(key.length() > 0);

			System.out.println("testGetAllAccounts  account.serverHostName "
					+ i + " : " + serverName);
			System.out.println("testGetAllAccounts  account.key " + i + " : "
					+ key);
		}

	}


}
