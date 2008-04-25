package org.milimail.messageRemoteServiceAPI.account;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;

public class AccountServiceTestDown extends TestCase {
	private AccountServiceProxy accountService;

	protected void setUp() throws Exception {
		ServiceCreator serviceCreator = API.init();
		accountService = serviceCreator.createAccountService();
	}

	public void testGetAllAccounts() {
		
		boolean internalServerExceptionThrow = false;
		boolean communicationExceptionThrow = false;
		
		try {
			accountService.GetAllAccounts();
		} catch (InternalServerException e) {
			internalServerExceptionThrow = false;
		} catch (CommunicationException e) {
			communicationExceptionThrow = true;
		}

		assertFalse(internalServerExceptionThrow);
		assertTrue(communicationExceptionThrow);
	}
}
