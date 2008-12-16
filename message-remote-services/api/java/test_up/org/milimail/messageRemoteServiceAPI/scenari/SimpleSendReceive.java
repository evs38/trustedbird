package org.milimail.messageRemoteServiceAPI.scenari;

import java.util.List;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.compose.AbstractMessageServiceTest;
import org.milimail.messageRemoteServiceAPI.compose.Message;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.listeners.AbstractMimeMessageListener;
import org.milimail.messageRemoteServiceAPI.stubs.CFolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFolderHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CFoldersHolder;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdr;
import org.milimail.messageRemoteServiceAPI.stubs.CMessageHdrsHolder;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;

public class SimpleSendReceive extends AbstractMessageServiceTest {

	private SourceListener sourceMessageListener;

	public void testSimple() throws Exception {
		Message message = new Message();
		final String subject = "SR 1";
		final String body = "body";
	
		message.setSubject(subject);
		message.setBody(body);
		message.setTo(to);
		
		
		CMessageHdr hdr = sendAndReceiveHandler(message);
		
		sourceMessageListener = serviceCreator
				.createSourceMessageListener(new AbstractMimeMessageListener() {

					@Override
					public void onLoad(MimeMessage mimeMessage) {
						assertNotNull(mimeMessage);
						try {
							System.out.println("SUBJECT FIELD = <"+mimeMessage.getSubject()+">");
							System.out.println("SUBJECT TO = <"+ mimeMessage.getRecipients(RecipientType.TO)[0]+">");
							System.out.println("BODY = <"+ mimeMessage.getContent()+">");
							assertEquals(to[0], mimeMessage.getRecipients(RecipientType.TO)[0].toString());
							assertEquals(subject, mimeMessage.getSubject());
							assertEquals(body + "\n", mimeMessage.getContent());
						} catch (Exception e) {
							fail();
						}
						
					}
				});
		
		browseService.getDecryptedSource(hdr, sourceMessageListener);
		
	}

	private CMessageHdr sendAndReceiveHandler(Message message)
			throws InternalServerException, InterruptedException,
			CommunicationException {
		composeService.sendMessage(account, message, messageListener);

		
		CFoldersHolder foldersHolder = new CFoldersHolder();
		CFolderHolder folderHolder = new CFolderHolder();
		
		List<Account> accountsDest = accountService.GetAllAccounts();
		Account accountDest = accountsDest.get(1);
		
		browseService.getRootFolder(accountDest, folderHolder);

		browseService.getAllFolders(folderHolder.value, foldersHolder);
		
		CFolder folder = foldersHolder.value[0];
		
		Thread.sleep(1000);
		browseService.getNewMessages(folder);
		Thread.sleep(1000);
		CMessageHdrsHolder hdrHolder = new CMessageHdrsHolder();
		browseService.getMessageHdrs(folder, hdrHolder);
		
		CMessageHdr[] hdrs = hdrHolder.value;
		
		assertTrue(hdrs.length == 1);
		
		CMessageHdr hdr = hdrs[0];
		return hdr;
	}
}
