package org.milimail.messageRemoteServiceAPI.compose;

import java.util.UUID;

import org.milimail.messageRemoteServiceAPI.stubs.CMessage;
import org.milimail.messageRemoteServiceAPI.stubs.CSecurity;

public class Message {
	private CMessage message;

	public Message() {
		message = new CMessage();
		message.body = "";
		message.subject="";
		message.recipients_to = new String[0];
		message.recipients_cc = new String[0];
		message.recipients_bcc = new String[0];
		message.uuid = UUID.randomUUID().toString();
		message.security = new CSecurity();
		message.security.isCrypted = false;
		message.security.isSigned = false;
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
	
	public String getUUID(){
		return message.uuid;
	}

	public CMessage getCorbaMessage() {
		return message;
	}
	
	public void setSecurity(Security security){
		message.security.isCrypted = security.isCrypted;
		message.security.isSigned = security.isSigned;
	}
}
