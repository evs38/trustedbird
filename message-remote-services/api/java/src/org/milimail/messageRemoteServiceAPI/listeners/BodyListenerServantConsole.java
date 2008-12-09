package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.BodyListenerPOA;

public class BodyListenerServantConsole extends BodyListenerPOA{

	public void OnLoad(String source) {

		System.out.println(source);
		
	}

}
