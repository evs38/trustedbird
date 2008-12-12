package org.milimail.messageRemoteServiceAPI.listeners;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Enumeration;

import javax.mail.BodyPart;
import javax.mail.Header;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.milimail.messageRemoteServiceAPI.stubs.SourceListenerPOA;

public class SourceMessageListenerServantConsoleMimeConverter extends
		SourceListenerPOA {
	
	
	public void OnLoad(String source) {
		try {
			ByteArrayInputStream in = new ByteArrayInputStream(source
					.getBytes());

			MimeMessage mimeMessage = new MimeMessage(null, in);
			
		
			for (Enumeration<Header> hs = mimeMessage.getAllHeaders(); hs
					.hasMoreElements();) {
				Header h = hs.nextElement();
			//	System.out.println(h.getName() + "=" + h.getValue());
			}
		
			Object content = mimeMessage.getContent();
			
			if (!(content instanceof MimeMultipart))
				return;

			MimeMultipart multipart = (MimeMultipart) content;
			int partsNumber = multipart.getCount();
			
			for (int j = 0; j < partsNumber; j++) {
			BodyPart bodyPart = multipart.getBodyPart(j);
			System.out.println(bodyPart.getContent());
			}
		
				
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
