package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.SourceListenerPOA;

public class SourceMessageListenerServantConsole extends SourceListenerPOA {

	public void OnLoad(String source) {
	
		System.out.println(source);
		
	}

	

	
}
