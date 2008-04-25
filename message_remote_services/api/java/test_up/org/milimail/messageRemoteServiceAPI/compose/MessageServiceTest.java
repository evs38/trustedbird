package org.milimail.messageRemoteServiceAPI.compose;

import junit.framework.TestCase;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.compose.Message;
import org.milimail.messageRemoteServiceAPI.compose.MessageComposeServiceProxy;
import org.milimail.messageRemoteServiceAPI.compose.Security;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.init.API;
import org.milimail.messageRemoteServiceAPI.init.ServiceCreator;
import org.milimail.messageRemoteServiceAPI.listeners.MessageSendListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.Account;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;

public class MessageServiceTest extends TestCase {
	private MessageComposeServiceProxy composeService;
	private AccountServiceProxy accountService;
	private MessageSendListener messageListener;

	protected void setUp() throws Exception {
		ServiceCreator serviceCreator = API.init();
		composeService = serviceCreator.createMessageComposeService();
		accountService = serviceCreator.createAccountService();
		messageListener = serviceCreator.createMessageSendListener(new MessageSendListenerServantConsole());
	}

	public void testSendMessage() throws Exception{
		Account[] accounts = null;
		
		accounts = accountService.GetAllAccounts();
		
		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");

		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		
		composeService.sendMessage(account, message, messageListener);
		

	}
	
	public void testSendMessageSigned() throws Exception{
		Account[] accounts = null;
		
		accounts = accountService.GetAllAccounts();
		
		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		
		Security security = new Security();
		security.setSigned(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API : Signed");
		message.setBody("body from API Signed");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		
		composeService.sendMessage(account, message, messageListener);
		

	}
	
	public void testSendMessageCrypted() throws Exception{
		Account[] accounts = null;
		
		accounts = accountService.GetAllAccounts();
		
		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		
		Security security = new Security();
		security.setCrypted(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted");
		message.setBody("body from API Crypted");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		
		composeService.sendMessage(account, message, messageListener);
		

	}
	
	public void testSendMessageCryptedAndSigned() throws Exception{
		Account[] accounts = null;
		
		accounts = accountService.GetAllAccounts();
		
		Account account = accounts[1];
		assertNotNull(account);

		Message message = new Message();
		
		Security security = new Security();
		security.setCrypted(true);
		security.setSigned(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted & Signed");
		message.setBody("body from API Crypted & Signed");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		
		composeService.sendMessage(account, message, messageListener);
		

	}
	
	
}
