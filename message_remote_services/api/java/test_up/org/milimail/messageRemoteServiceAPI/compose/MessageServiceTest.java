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

import org.milimail.messageRemoteServiceAPI.stubs.Attachment;
import org.milimail.messageRemoteServiceAPI.stubs.Header;
import org.milimail.messageRemoteServiceAPI.stubs.InternalServerException;

public class MessageServiceTest extends AbstractMessageServiceTest {
	
	public void testSendMessage() throws Exception{
		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");

		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		
		composeService.sendMessage(account, message, messageListener);	
	}
	
	public void testSendMessageWithSpecialCharacters() throws Exception{
		Message message = new Message();
		message.setSubject("Subject from API + é");
		message.setBody("body from API + é");

		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		
		composeService.sendMessage(account, message, messageListener);	

	}
	
	public void testSendMessageSigned() throws Exception{
		Message message = new Message();
		
		Security security = new Security();
		security.setSigned(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API : Signed");
		message.setBody("body from API Signed");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageCrypted() throws Exception{
		Message message = new Message();
		
		Security security = new Security();
		security.setCrypted(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted");
		message.setBody("body from API Crypted");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);
		
	}
	
	public void testSendMessageCryptedAndSigned() throws Exception{
		Message message = new Message();
		
		Security security = new Security();
		security.setCrypted(true);
		security.setSigned(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted & Signed");
		message.setBody("body from API Crypted & Signed");
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);		

	}
	
	public void testSendMessageWithHeaders() throws Exception{
		Header[] headers = new Header[2];
		headers[0] = new Header();
		headers[0].key = "X-MRS-TEST-1";
		headers[0].value = "X-MRS-VALUE-1";
		headers[1] = new Header();
		headers[1].key = "X-MRS-TEST-2";
		headers[1].value = "X-MRS-VALUE-2";
		
		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");
		message.setHeaders(headers);
		
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
	
		composeService.sendMessage(account, message, messageListener);

	}
	
	public void testSendMessageWithMDNRequested() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With MDN Requested");
		message.setBody("body from API");	
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setMDNReadRequested(true);
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithDSNRequested() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With MDN Requested");
		message.setBody("body from API");	
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithAttachment() throws InternalServerException  {
		Message message = new Message();
		message.setSubject("From Api With 1 Attachment");
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		Attachment[] attachments = new Attachment[1];
		attachments[0] = new Attachment();
		attachments[0].dirPath = testPath;
		attachments[0].fileName = "attachment1.txt";
		attachments[0].mimeType = "text/plain";
		message.setAttachments(attachments);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWith2Attachments() throws InternalServerException  {
		Message message = new Message();
		message.setSubject("From Api With 2 Attachment");
		String[] to = { "user2@test.milimail.org" };
		message.setTo(to);
		Attachment[] attachments = new Attachment[2];
		attachments[0] = new Attachment();
		attachments[0].dirPath = testPath;
		attachments[0].fileName = "attachment1.txt";
		attachments[0].mimeType = "text/plain";
		attachments[1] = new Attachment();
		attachments[1].dirPath = testPath;
		attachments[1].fileName = "attachment2.txt";
		attachments[1].mimeType = "text/plain";
		message.setAttachments(attachments);
		
		composeService.sendMessage(account, message, messageListener);
	}
}
