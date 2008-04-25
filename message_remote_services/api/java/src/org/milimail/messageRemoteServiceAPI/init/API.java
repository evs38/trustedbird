package org.milimail.messageRemoteServiceAPI.init;

import org.omg.CORBA.ORB;


public class API {

	public static ServiceCreator init() {
		String[] args = null;
		ORB orb = ORB.init(args, null);
		
		return new ServiceCreator(orb);
	}
}
