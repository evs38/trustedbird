package org.milimail.messageRemoteServiceAPI.scenari;

import java.util.ArrayList;
import java.util.List;

import javax.mail.BodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeMessage.RecipientType;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.browse.Folder;
import org.milimail.messageRemoteServiceAPI.browse.FolderHolder;
import org.milimail.messageRemoteServiceAPI.browse.FoldersHolder;
import org.milimail.messageRemoteServiceAPI.browse.MessageHandler;
import org.milimail.messageRemoteServiceAPI.browse.MessageHandlersHolder;
import org.milimail.messageRemoteServiceAPI.compose.AbstractMessageServiceTest;
import org.milimail.messageRemoteServiceAPI.compose.Attachment;
import org.milimail.messageRemoteServiceAPI.compose.Message;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.listeners.AbstractMimeMessageListener;
import org.milimail.messageRemoteServiceAPI.stubs.SourceListener;
/**
 * Simple Scenario which send a mail and try to get it from Thunderbird
 * The Destination Inbox Folder must be empty
 * @author Olivier PARNIERE
 *
 */
public class SimpleSendReceive extends AbstractMessageServiceTest {

	private SourceListener sourceMessageListener;

	
	
	public void testSimple() throws Exception {
		Message message = new Message();
		final String subject = "SR 1";
		final String body = "body";
	
		message.setSubject(subject);
		message.setBody(body);
		message.setTo(to);
		
		MessageHandler hdr = sendAndReceiveHandler(message);
		
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

	private MessageHandler sendAndReceiveHandler(Message message)
			throws InternalServerException, InterruptedException,
			CommunicationException {
		composeService.sendMessage(account, message, messageListener);

		
		FoldersHolder foldersHolder = new FoldersHolder();
		FolderHolder folderHolder = new FolderHolder();
		
		List<Account> accountsDest = accountService.GetAllAccounts();
		
		Account accountDest = accountsDest.get(2);
		
		browseService.getRootFolder(accountDest, folderHolder);

		browseService.getAllFolders(folderHolder.getValue(), foldersHolder);
		
		Folder folder = foldersHolder.getValue()[0];
		
		Thread.sleep(2000);
		browseService.getNewMessages(folder);
		Thread.sleep(2000);
		MessageHandlersHolder hdrHolder = new MessageHandlersHolder();
		browseService.getMessageHandlers(folder, hdrHolder);
		
		MessageHandler[] handlers = hdrHolder.getValue();
		
		MessageHandler handler = handlers[handlers.length -1];
		return handler;
	}
	
	public void testAttachement() throws Exception {

		Message message = new Message();
		final String subject = "SR 2 + ATTACH";
		final String body = "body";
	
		message.setSubject(subject);
		message.setBody(body);
		message.setTo(to);
		
		Attachment attachment = new Attachment();
		attachment.setDirPath(testPath);
		attachment.setFileName("attachment1.txt");
		attachment.setMimeType("text/plain");
		List<Attachment> attachments = new ArrayList<Attachment>();
		attachments.add(attachment);
		message.setAttachments(attachments);
		
		MessageHandler hdr = sendAndReceiveHandler(message);
		
		sourceMessageListener = serviceCreator
				.createSourceMessageListener(new AbstractMimeMessageListener() {

					@Override
					public void onLoad(MimeMessage mimeMessage) {
						assertNotNull(mimeMessage);
						try {
							System.out.println("SUBJECT FIELD = <"+mimeMessage.getSubject()+">");
							System.out.println("SUBJECT TO = <"+ mimeMessage.getRecipients(RecipientType.TO)[0]+">");
						
							assertEquals(to[0], mimeMessage.getRecipients(RecipientType.TO)[0].toString());
							assertEquals(subject, mimeMessage.getSubject());
							MimeMultipart mimeMultipart = (MimeMultipart) mimeMessage.getContent();
							int count = mimeMultipart.getCount();
							assertTrue(count == 2);
							
							BodyPart part1 = mimeMultipart.getBodyPart(0);
							
							assertEquals(body + "\n", part1.getContent());		
							System.out.println("BODY = <"+ part1.getContent()+">");
							BodyPart part2 = mimeMultipart.getBodyPart(1);
							
							assertEquals("Text file attachment 1" ,part2.getContent());
							System.out.println("Attachment :<"+part2.getContent()+">");
						} catch (Exception e) {
							fail();
						}
						
					}
				});
		
		browseService.getDecryptedSource(hdr, sourceMessageListener);
	}
}
