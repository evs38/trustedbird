package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListenerPOA;

public class MessageSendListenerServantConsole extends MessageSendListenerPOA {

	public void OnStop(String id, boolean success) {
		System.out.println("Mail Sending Status : ID <"+id+"> Success <"+success+">");
		
	}

}
