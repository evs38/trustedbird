package org.milimail.messageRemoteServiceAPI.listeners;

import java.io.ByteArrayInputStream;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListenerPOA;

public abstract class AbstractMimeMessageListener extends SourceListenerPOA {

	public abstract void onLoad(MimeMessage mimeMessage);

	@Override
	public void OnLoad(String source) {
		ByteArrayInputStream in = new ByteArrayInputStream(source
				.getBytes());
	
		try {
			MimeMessage mimeMessage = new MimeMessage(null, in);
			onLoad(mimeMessage);
		} catch (MessagingException e) {
			onLoad(null);
		}
		
	}
	
}