package org.milimail.messageRemoteServiceAPI.account;

import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.stubs.Account;
import org.milimail.messageRemoteServiceAPI.stubs.AccountService;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;
import org.omg.CORBA.COMM_FAILURE;

public class AccountServiceProxy {
	private AccountService accountService;

	public AccountServiceProxy(AccountService accountService) {
		super();
		this.accountService = accountService;
	}

	public Account[] GetAllAccounts() throws CommunicationException,
			InternalServerException {
		Account[] accounts = null;
		try {
			accounts = accountService.GetAllAccounts();
		} catch (COMM_FAILURE e) {
			throw new CommunicationException(
					"Communication Failure with Server", e);
		}
		
		return accounts;
	}

}
