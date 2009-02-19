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
 * This Class test The Message Compose Service
 * @author Olivier PARNIERE
 *
 */
public class MessageServiceTest extends AbstractMessageServiceTest {
	
	public void testSendMessage() throws Exception{
		Message message = new Message();
		message.setSubject("Subject from API");
		message.setBody("body from API");

		message.setTo(to);
		
		composeService.sendMessage(account, message, messageListener);	
	}
	
	public void testSendMessageWithSpecialCharacters() throws Exception{
		Message message = new Message();
		message.setSubject("Subject from API + é");
		message.setBody("body from API + é");
		
		message.setTo(to);
		
		composeService.sendMessage(account, message, messageListener);	
	}
	
	public void testSendMessageWithSpecialCharactersChinese() throws Exception{
		Message message = new Message();
		message.setSubject("Subject from API Chinese+ 是什么");
		message.setBody("body from API Chinese+ 是什么");
		
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
		
		
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageCrypted() throws Exception{
		Message message = new Message();
		
		Security security = new Security();
		security.setEncrypted(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted");
		message.setBody("body from API Crypted");
		
		
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);
		
	}
	
	public void testSendMessageCryptedAndSigned() throws Exception{
		Message message = new Message();
		
		Security security = new Security();
		security.setEncrypted(true);
		security.setSigned(true);
		message.setSecurity(security);
		
		message.setSubject("Subject from API: Crypted & Signed");
		message.setBody("body from API Crypted & Signed");
		
		
		message.setTo(to);

		composeService.sendMessage(account, message, messageListener);		

	}
	
	public void testSendMessageWithHeaders() throws Exception{
		List<Header> headers = new ArrayList<Header>();
		Header header0 = new Header();
		header0.setKey("X-MRS-TEST-1");
		header0.setValue("X-MRS-VALUE-1");
		Header header1 = new Header();
		header1.setKey("X-MRS-TEST-2");
		header1.setValue("X-MRS-VALUE-2");
		
		headers.add(header0);
		headers.add(header1);
		
		Message message = new Message();
		message.setSubject("Subject from API With Headers");
		message.setBody("body from API");
		message.setHeaders(headers);
		
		
		message.setTo(to);
	
		composeService.sendMessage(account, message, messageListener);

	}
	
	public void testSendMessageWithMDNRequested() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With MDN Requested");
		message.setBody("body from API");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setMDNReadRequested(true);
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	
	public void testSendMessageWithDSNRequestedFullHDROnSuccess() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedFullHDROnSuccess");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(true);
		type.setOnSuccessRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithDSNRequestedHDROnSuccess() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedHDROnSuccess");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setOnSuccessRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithDSNRequestedHDROnDelay() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedHDROnDelay");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setOnDelayRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithDSNRequestedHDROnFailure() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedHDROnFailure");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setOnFailureRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithDSNRequestedHDRNever() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedHDRNever");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setNeverRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	
	
	public void testSendMessageWithDSNRequestedHDROnSuccessDelayFailure() throws Exception {
		Message message = new Message();
		message.setSubject("Subject from API, With DSN Requested");
		message.setBody("testSendMessageWithDSNRequestedHDROnSuccessDelayFailure");	
		
		message.setTo(to);
		
		Notification notification = new Notification();
		notification.setDSNRequested(true);
		
		DSNType type = new DSNType();
		type.setReturnFullHDRRequested(false);
		type.setOnSuccessRequested(true);
		type.setOnFailureRequested(true);
		type.setOnDelayRequested(true);
		
		notification.setDsnType(type);
		
		message.setNotification(notification);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithAttachment() throws InternalServerException  {
		Message message = new Message();
		message.setSubject("From Api With 1 Attachment");
		
		message.setTo(to);
		
		List<Attachment> attachments = new ArrayList<Attachment>();
		Attachment attachment0 = new Attachment();
		attachment0 = new Attachment();
		attachment0.setDirPath(testPath);
		attachment0.setFileName("attachment1.txt");
		attachment0.setMimeType("text/plain");
		
		attachments.add(attachment0);
		
		message.setAttachments(attachments);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWith2Attachments() throws InternalServerException  {
		Message message = new Message();
		message.setSubject("From Api With 2 Attachment");
		
		message.setTo(to);
		
		List<Attachment> attachments = new ArrayList<Attachment>();
		
		Attachment attachment0 = new Attachment();
		attachment0 = new Attachment();
		attachment0.setDirPath(testPath);
		attachment0.setFileName("attachment1.txt");
		attachment0.setMimeType("text/plain");
		
		attachments.add(attachment0);
		
		Attachment attachment1 = new Attachment();
		attachment1 = new Attachment();
		attachment1.setDirPath(testPath);
		attachment1.setFileName("attachment2.txt");
		attachment1.setMimeType("text/plain");
		attachments.add(attachment1);
		message.setAttachments(attachments);
		
		composeService.sendMessage(account, message, messageListener);
	}
	
	public void testSendMessageWithoutSubjectAndBody() throws Exception {
		Message message = new Message();
		
		message.setTo(to);
		composeService.sendMessage(account, message, messageListener);
	}
}
