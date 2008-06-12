package org.milimail.messageRemoteServiceAPI.compose;

import java.io.File;
import java.util.List;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.listeners.MessageSendListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;

public abstract class AbstractMessageServiceTest extends TestCase {
	protected MessageComposeServiceProxy composeService;
	protected AccountServiceProxy accountService;
	protected MessageSendListener messageListener;
	protected Account account;
	protected String testPath;

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
