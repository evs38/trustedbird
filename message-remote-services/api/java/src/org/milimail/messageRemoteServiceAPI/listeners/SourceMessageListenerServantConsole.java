package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.SourceMessageListenerPOA;

public class SourceMessageListenerServantConsole extends SourceMessageListenerPOA {

	public void OnLoad(String source) {
		System.out.println(source);
	}

	
}
