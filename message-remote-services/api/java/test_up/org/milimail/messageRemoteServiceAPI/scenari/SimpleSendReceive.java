package org.milimail.messageRemoteServiceAPI.scenari;

import java.util.List;

import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;

import org.milimail.messageRemoteServiceAPI.account.Account;
import org.milimail.messageRemoteServiceAPI.browse.Folder;
import org.milimail.messageRemoteServiceAPI.browse.FolderHolder;
import org.milimail.messageRemoteServiceAPI.browse.FoldersHolder;
import org.milimail.messageRemoteServiceAPI.browse.MessageHandler;
import org.milimail.messageRemoteServiceAPI.browse.MessageHandlersHolder;
import org.milimail.messageRemoteServiceAPI.compose.AbstractMessageServiceTest;
import org.milimail.messageRemoteServiceAPI.compose.Message;
import org.milimail.messageRemoteServiceAPI.exceptions.CommunicationException;
import org.milimail.messageRemoteServiceAPI.exceptions.InternalServerException;
import org.milimail.messageRemoteServiceAPI.listeners.AbstractMimeMessageListener;
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
		Account accountDest = accountsDest.get(1);
		
		browseService.getRootFolder(accountDest, folderHolder);

		browseService.getAllFolders(folderHolder.getValue(), foldersHolder);
		
		Folder folder = foldersHolder.getValue()[0];
		
		Thread.sleep(1000);
		browseService.getNewMessages(folder);
		Thread.sleep(1000);
		MessageHandlersHolder hdrHolder = new MessageHandlersHolder();
		browseService.getMessageHandlers(folder, hdrHolder);
		
		MessageHandler[] handlers = hdrHolder.getValue();
		
		MessageHandler handler = handlers[0];
		return handler;
	}
}
