package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.SourceMessageListenerPOA;

public class SourceMessageListenerServantConsole extends SourceMessageListenerPOA {

	@Override
	public void OnLoad(String source) {
		System.out.println("OnLoad");
		System.out.println(source);
		
	}

	
}
