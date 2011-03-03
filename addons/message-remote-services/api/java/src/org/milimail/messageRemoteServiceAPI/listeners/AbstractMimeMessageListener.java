package org.milimail.messageRemoteServiceAPI.listeners;

import java.io.ByteArrayInputStream;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.milimail.messageRemoteServiceAPI.stubs.SourceListenerPOA;

public abstract class AbstractMimeMessageListener extends SourceListenerPOA {

	public abstract void onLoad(MimeMessage mimeMessage);

	
	public void OnLoad(byte[] source) {
		ByteArrayInputStream in = new ByteArrayInputStream(source);
	
		try {
			MimeMessage mimeMessage = new MimeMessage(null, in);
			onLoad(mimeMessage);
		} catch (MessagingException e) {
			onLoad(null);
		}
		
	}
	
}