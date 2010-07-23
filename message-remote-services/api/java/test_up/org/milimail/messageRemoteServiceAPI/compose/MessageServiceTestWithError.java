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
package org.milimail.messageRemoteServiceAPI.compose;

import java.util.ArrayList;
import java.util.List;

import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;

/**
 * This Class checks the error returned by Message Compose Service 
 * @author oparnier
 *
 */
public class MessageServiceTestWithError extends AbstractMessageServiceTest {

	public void testSendMessageWithoutTo() {
		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");
		boolean exceptionThrown = false;

		try {
			composeService.sendMessage(account, message, messageListener);
		} catch (InternalServerException e) {
			System.out.println(e);
			exceptionThrown = true;
		}

		assertTrue(exceptionThrown);
	}

	public void testSendMessageMalformedTo() {
		boolean openComposeWindowOnError = false;
		sendMessageOnError(openComposeWindowOnError);
	}

	public void testSendMessageMalformedToAndOpenComposeWindow() {
		boolean openComposeWindowOnError = true;
		sendMessageOnError(openComposeWindowOnError);
	}

	/**
	 * @param openComposeWindowOnError
	 */
	private void sendMessageOnError(boolean openComposeWindowOnError) {
		Message message = new Message();
		message.setSubject("Subject from API");

		message.setBody("body from API");

		List<Attachment> attachments = new ArrayList<Attachment>();

		Attachment attachment0 = new Attachment();
		attachment0 = new Attachment();
		attachment0.setDirPath(testPath);
		attachment0.setFileName("attachment1.txt");
		attachment0.setMimeType("text/plain");

		attachments.add(attachment0);
		message.setAttachments(attachments);
		
		String[] to = { "user1@test.trustedbird.org", "user2test.trustedbird.org" };
		message.setTo(to);
		boolean exceptionThrown = false;
		try {
			composeService.sendMessage(account, message, messageListener,
					openComposeWindowOnError);
		} catch (InternalServerException e) {
			exceptionThrown = true;
			System.out.println(e);
		}

		assertTrue(exceptionThrown);
	}

	public void testSendMessageWithAttachmentWithWrongPath() {
		Message message = new Message();
		message.setSubject("From Api With 1 Attachment");
		String[] to = { "user2@test.trustedbird.org" };
		message.setTo(to);
		List<Attachment> attachments = new ArrayList<Attachment>();

		Attachment attachment0 = new Attachment();
		attachment0 = new Attachment();
		attachment0.setDirPath("/wrongdirectory");
		attachment0.setFileName("wrongfilename.txt");
		attachment0.setMimeType("text/plain");

		attachments.add(attachment0);
		
		message.setAttachments(attachments);
		boolean exceptionThrowed = false;

		try {
			composeService.sendMessage(account, message, messageListener);
		} catch (InternalServerException e) {
			System.out.println(e);
			exceptionThrowed = true;
		}

		assertTrue(exceptionThrowed);
	}
	
	public void testSendMessageWithDSNRequestedWithNoType()  {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedFullHDROnSuccess");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		message.setNotification(notification);
		
		boolean exceptionThrowed = false;

		try {
			composeService.sendMessage(account, message, messageListener);
		} catch (InternalServerException e) {
			System.out.println(e);
			exceptionThrowed = true;
		}

		assertTrue(exceptionThrowed);
	}
	
	public void testSendMessageWithDSNRequestedWithNeverAndSuccess()  {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedFullHDROnSuccess");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setNeverRequested(true);
		type.setOnSuccessRequested(true);
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		boolean exceptionThrowed = false;

		try {
			composeService.sendMessage(account, message, messageListener);
		} catch (InternalServerException e) {
			System.out.println(e);
			exceptionThrowed = true;
		}

		assertTrue(exceptionThrowed);
	}
}
