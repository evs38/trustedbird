package org.milimail.messageRemoteServiceAPI.init;

import java.io.IOException;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.compose.MessageComposeServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.ServiceCreationException;
import org.milimail.messageRemoteServiceAPI.listeners.MessageSendListenerServantConsole;
import org.milimail.messageRemoteServiceAPI.stubs.AccountServiceHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageComposeServiceHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListenerHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListenerPOA;
import org.omg.CORBA.ORB;
import org.omg.CORBA.ORBPackage.InvalidName;
import org.omg.PortableServer.POA;
import org.omg.PortableServer.POAHelper;
import org.omg.PortableServer.POAManagerPackage.AdapterInactive;
import org.omg.PortableServer.POAPackage.ServantNotActive;
import org.omg.PortableServer.POAPackage.WrongPolicy;

public class ServiceCreator {

	private ORB orb;

	public ServiceCreator(ORB orb) {
		this.orb = orb;

		

	}

	public MessageSendListener createMessageSendListener(MessageSendListenerPOA sendListenerPOA) {

		POA rootpoa = null;
		org.omg.CORBA.Object ref = null;
		
		try {
			rootpoa = POAHelper.narrow(orb
					.resolve_initial_references("RootPOA"));

			rootpoa.the_POAManager().activate();

			ref = rootpoa.servant_to_reference(sendListenerPOA);
		} catch (Exception e) {
			new ServiceCreationException(e);
		}

		MessageSendListener sendListener = MessageSendListenerHelper
				.narrow(ref);
		
		return sendListener;
	}

	public AccountServiceProxy createAccountService()
			throws ServiceCreationException {
		String ior;
		try {
			ior = IORFinder.getIOR("AccountService");
		} catch (IOException e) {
			throw new ServiceCreationException(
					"Cannot create AccountService, verify IOR File", e);
		}
		org.omg.CORBA.Object obj = orb.string_to_object(ior);
		return new AccountServiceProxy(AccountServiceHelper.narrow(obj));

	}

	public MessageComposeServiceProxy createMessageComposeService()
			throws ServiceCreationException {
		String ior;
		try {
			ior = IORFinder.getIOR("MessageComposeService");
		} catch (IOException e) {
			throw new ServiceCreationException(
					"Cannot create MessageComposeService, verify IOR File", e);
		}
		org.omg.CORBA.Object obj = orb.string_to_object(ior);
		return new MessageComposeServiceProxy(MessageComposeServiceHelper
				.narrow(obj));

	}
}
