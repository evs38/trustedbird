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
import java.util.UUID;

import org.milimail.messageRemoteServiceAPI.stubs.CAttachment;
import org.milimail.messageRemoteServiceAPI.stubs.CHeader;
import org.milimail.messageRemoteServiceAPI.stubs.CMessage;
import org.milimail.messageRemoteServiceAPI.stubs.CNotification;
import org.milimail.messageRemoteServiceAPI.stubs.CSecurity;

public class Message {
	private CMessage message;

	public Message() {
		message = new CMessage();
		message.body = "";
		message.subject = "";
		message.recipients_to = new String[0];
		message.recipients_cc = new String[0];
		message.recipients_bcc = new String[0];
		message.uuid = UUID.randomUUID().toString();
		message.security = new CSecurity();
		message.notification = new CNotification();
		message.security.isCrypted = false;
		message.security.isSigned = false;
		message.p_headers = new CHeader[0];
		message.p_attachments = new CAttachment[0];
	}

	public String[] getTo() {
		return message.recipients_to;
	}

	public void setTo(String[] to) {
		if (to == null)
			return;
		message.recipients_to = to;
	}

	public String[] getCc() {
		return message.recipients_cc;
	}

	public void setCc(String[] cc) {
		if (cc == null)
			return;
		message.recipients_cc = cc;
	}

	public String[] getBcc() {
		return message.recipients_bcc;
	}

	public void setBcc(String[] bcc) {
		if (bcc == null)
			return;
		message.recipients_bcc = bcc;
	}

	public String getSubject() {
		return message.subject;
	}

	public void setSubject(String subject) {
		if (subject == null)
			return;
		message.subject = subject;
	}

	public String getBody() {
		return message.body;
	}

	public void setBody(String body) {
		if (body == null)
			return;
		message.body = body;
	}

	public String getUUID() {
		return message.uuid;
	}

	public CMessage getCorbaObject() {
		return message;
	}

	public void setSecurity(Security security) {
		message.security.isCrypted = security.isCrypted();
		message.security.isSigned = security.isSigned();
	}

	public Security getSecurity() {
		return new Security(message.security.isSigned,
				message.security.isCrypted);
	}

	public void setHeaders(List<Header> headers) {
		if (headers == null)
			return;
		
		CHeader[] cHeaders = new CHeader[headers.size()];
		int i = 0;
		
		for (Header header : headers) {
			CHeader cHeader = header.getCorbaObject();
			cHeaders[i] = cHeader;
			i++;
		}
		
		
		message.p_headers = cHeaders;
	}

	public List<Header> getHeaders() {
		List<Header> headers = new ArrayList<Header>();

		for (int i = 0; i < message.p_headers.length; i++) {
			headers.add(new Header(message.p_headers[i]));
		}

		return headers;
	}

	public void setNotification(Notification notification) {
		message.notification.isMDNReadRequested = notification
				.isMDNReadRequested();
		message.notification.isDSNRequested = notification.isDSNRequested();
	}

	public Notification getNotification() {
		return new Notification(message.notification.isMDNReadRequested,
				message.notification.isMDNReadRequested);
	}

	public void setAttachments(List<Attachment> attachments) {
		if (attachments == null)
			return;
		
		CAttachment[] cAttachments = new CAttachment[attachments.size()];
		int i = 0;
		
		for (Attachment attachment : attachments) {
			CAttachment cAttachment = attachment.getCorbaObject();
			cAttachments[i] = cAttachment;
			i++;
		}
		
		
		message.p_attachments = cAttachments;

	}

	public List<Attachment> getAttachments() {
		List<Attachment> attachments = new ArrayList<Attachment>();

		for (int i = 0; i < message.p_attachments.length; i++) {
			attachments.add(new Attachment(message.p_attachments[i]));
		}

		return attachments;
	}
}
