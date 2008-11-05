/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is BT Global Services / Etat francais Ministere de la Defense
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Olivier PARNIERE <olivier.parniere_AT_gmail.com> <olivier.parniere_AT_bt.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
package org.milimail.messageRemoteServiceAPI.init;

import java.io.IOException;

import org.milimail.messageRemoteServiceAPI.account.AccountServiceProxy;
import org.milimail.messageRemoteServiceAPI.browse.MessageBrowseServiceProxy;
import org.milimail.messageRemoteServiceAPI.compose.MessageComposeServiceProxy;
import org.milimail.messageRemoteServiceAPI.exceptions.ServiceCreationException;
import org.milimail.messageRemoteServiceAPI.stubs.AccountServiceHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageBrowseServiceHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageComposeServiceHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListener;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListenerHelper;
import org.milimail.messageRemoteServiceAPI.stubs.MessageSendListenerPOA;
import org.omg.CORBA.ORB;
import org.omg.PortableServer.POA;
import org.omg.PortableServer.POAHelper;

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

	public MessageBrowseServiceProxy createBrowseService() throws ServiceCreationException {
		String ior;
		try {
			ior = IORFinder.getIOR("MessageBrowseService");
		} catch (IOException e) {
			throw new ServiceCreationException(
					"Cannot create MessageBrowseService, verify IOR File", e);
		}
		org.omg.CORBA.Object obj = orb.string_to_object(ior);
		return new MessageBrowseServiceProxy(MessageBrowseServiceHelper
				.narrow(obj));
	}
}
