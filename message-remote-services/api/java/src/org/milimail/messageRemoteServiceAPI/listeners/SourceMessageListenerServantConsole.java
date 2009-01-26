package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.SourceListenerPOA;

public class SourceMessageListenerServantConsole extends SourceListenerPOA {

	public void OnLoad(byte[] source) {
		String sourceString = new String(source);
		System.out.println(sourceString);
		
	}

	

	
}
