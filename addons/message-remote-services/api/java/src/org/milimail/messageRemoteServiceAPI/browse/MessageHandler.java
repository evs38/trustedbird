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
 package org.milimail.messageRemoteServiceAPI.browse;

import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdr;
/**
 * This class represents a Mail Handler for a nsIMsgHdr in Thunderbird 
 * @author Olivier PARNIERE BT France
 *
 */
public class MessageHandler {
	private CMessageHdr hdr;

	public MessageHandler() {
		hdr.author = "";
		hdr.ccRecipients = new String[0];
		hdr.charset = "";
		hdr.date = "";
		hdr.id = "";
		hdr.isRead = false;
		hdr.key = -1;
		hdr.recipients = new String[0];
		hdr.size = 0;
		hdr.subject = "";
		hdr.uri = "";
	}
	
	public MessageHandler(CMessageHdr hdr) {
		this.hdr = hdr;
	}
	
	public String getAuthor(){
		return hdr.author;
	}
	
	public String[] getCCRecipients(){
		return hdr.ccRecipients;
	}
	
	public String getCharset(){
		return hdr.charset;
	}
	
	public String getId(){
		return hdr.id;
	}
	
	boolean isRead(){
		return hdr.isRead;
	}
	
	public int getKey(){
		return hdr.key;
	}
	
	public String[] getRecipients(){
		return hdr.recipients;
	}
	
	public int getSize(){
		return hdr.size;
	}
	
	public String getSubject(){
		return hdr.subject;
	}
	
	public String getURI(){
		return hdr.uri;
	}

	public CMessageHdr getCorbaObject() {
		return hdr;
	}

	public String getDate() {	
		return hdr.date;
	}
}
