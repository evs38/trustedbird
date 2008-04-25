package org.milimail.messageRemoteServiceAPI.compose;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.compose.Message;
import org.milimail.messageRemoteServiceAPI.compose.MessageComposeServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.listeners.MessageSendListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.Account;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;

public class MessageServiceTestWithError extends TestCase {
	private MessageComposeServiceProxy composeService;
	private AccountServiceProxy accountService;
	private MessageSendListener messageListener;

	protected void setUp() throws Exception {
		ServiceCreator serviceCreator = API.init();
		composeService = serviceCreator.createMessageComposeService();
		accountService = serviceCreator.createAccountService();
		messageListener = serviceCreator.createMessageSendListener(new MessageSendListenerServantConsole());
	}

	
	
	public void testSendMessageWithoutSubjectAndBody() throws Exception {
		Account[] accounts = accountService.GetAllAccounts();

		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();

		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		composeService.sendMessage(account, message, messageListener);
	}

	//Currently fail, need to control validity server side
	//UI dont know about our listener
	public void testSendMessageWithoutTo() throws Exception {
		Account[] accounts = accountService.GetAllAccounts();

		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");
		composeService.sendMessage(account, message, messageListener);
	}

	public void testSendMessageMalformedTo() throws Exception {
		Account[] accounts = accountService.GetAllAccounts();

		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		message.setSubject("Subject from API");

		message.setBody("body from API");

		String[] to = { "user2test.milimail.org" };
		message.setTo(to);
		composeService.sendMessage(account, message, messageListener);

	}

}
