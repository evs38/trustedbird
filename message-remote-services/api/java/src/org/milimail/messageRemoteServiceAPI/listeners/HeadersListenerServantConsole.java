package org.milimail.messageRemoteServiceAPI.listeners;

import org.milimail.messageRemoteServiceAPI.stubs.CHeader;
import org.milimail.messageRemoteServiceAPI.stubs.HeadersListenerPOA;

public class HeadersListenerServantConsole extends HeadersListenerPOA{

	public void OnLoad(CHeader[] p_headers) {
		for (int i = 0; i < p_headers.length; i++) {
			CHeader h = p_headers[i];
			System.out.println("KEY=" + h.key + " VALUE=" + h.value);
		}
		
	}

}
