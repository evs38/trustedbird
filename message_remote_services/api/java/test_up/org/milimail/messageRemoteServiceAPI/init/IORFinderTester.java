package org.milimail.messageRemoteServiceAPI.init;

import org.milimail.messageRemoteServiceAPI.init.IORFinder;

import junit.framework.TestCase;

public class IORFinderTester extends TestCase {

	public void GetIOR(String service) throws Exception {
		
		IORFinder finder = new IORFinder();
		
		String s = finder.getIOR(service);
	
		assertNotNull(s);
		assertTrue(s.contains("IOR"));
	}
	
	public void testGetIORAccountService() throws Exception {
		GetIOR("AccountService");
		
	}
	
	public void testGetIORMessageComposeService() throws Exception {
		GetIOR("MessageComposeService");
	}

}
