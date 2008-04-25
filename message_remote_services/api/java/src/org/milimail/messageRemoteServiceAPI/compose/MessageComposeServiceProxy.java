package org.milimail.messageRemoteServiceAPI.compose;

import org.milimail.messageRemoteServiceAPI.stubs.Account;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;
import org.milimail.messageRemoteServiceAPI.stubs.MessageComposeService;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;

public class MessageComposeServiceProxy {

	private MessageComposeService service;

	public MessageComposeServiceProxy(MessageComposeService service) {
		super();
		this.service = service;
	}

	public void sendMessage(Account p_account, Message p_message, MessageSendListener p_listener) throws InternalServerException {
		
		service.SendMessage(p_account, p_message.getCorbaMessage(), p_listener);
	}
	
	
}
