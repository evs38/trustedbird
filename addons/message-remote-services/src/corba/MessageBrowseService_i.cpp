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
#include "MessageBrowseService_i.h"
#include "nsIMsgAccountManager.h"
#include "Utils.h"
#include "nsIMsgFolder.h"
#include "nsIMsgDatabase.h"
#include "nsIMsgHdr.h"
#include "nsAdapterEnumerator.h"
#include "nsIRDFService.h"
#include "nsStringAPI.h"
#include "nsIMsgHeaderParser.h"
#include "nsIScriptableInputStream.h"
#include "nsNetUtil.h"
#include "nsIMsgMessageService.h"
#include "nsMsgUtils.h"
#include "nsIMessenger.h"
#include "nsILineInputStream.h"
#include "nsISeekableStream.h"
#include "nsIProxyObjectManager.h"
#include "nsIStreamConverter.h"
#include "nsIMimeStreamConverter.h"
#include "nsMsgMimeCID.h"
#include "SourceStreamListener.h"
#include <iostream>

using namespace std;

MessageBrowseService_i::MessageBrowseService_i() {
}

MessageBrowseService_i::~MessageBrowseService_i() {
}

void MessageBrowseService_i::GetMessageHdrs(const CFolder& p_folder,
		CMessageHdrs_out p_messageHdrs)
{
	nsresult rv;
	nsCOMPtr<nsIRDFService> rdf = do_GetService(
				"@mozilla.org/rdf/rdf-service;1", &rv);

	nsCOMPtr<nsIMsgFolder> pFolder;

	nsCOMPtr<nsIRDFResource> resource;
	rv = rdf->GetResource(nsCAutoString(p_folder.uri), getter_AddRefs(
			resource));
	ENSURE_SUCCESS(rv, "Cannot GetResource on nsIRDFResource");

	pFolder = do_QueryInterface(resource, &rv);
	ENSURE_SUCCESS(rv, "Cannot do_QueryInterface on nsIRDFResource to nsIMsgFolder");

	nsCOMPtr<nsIMsgDatabase> pMsgDatabase;
	rv = pFolder->GetMsgDatabase(nsnull, getter_AddRefs(pMsgDatabase));
	ENSURE_SUCCESS(rv, "Cannot GetMsgDatabase");

	nsCOMPtr<nsISimpleEnumerator> pSimpleEnumerator;
	rv = pMsgDatabase->EnumerateMessages(getter_AddRefs(pSimpleEnumerator));
	ENSURE_SUCCESS(rv, "Cannot EnumerateMessages");

	PRBool moreElements = PR_FALSE;

	unsigned int i = 0;

	CMessageHdrs * cMessageHdrs = new CMessageHdrs();

	while (NS_SUCCEEDED(pSimpleEnumerator->HasMoreElements(&moreElements))	&& moreElements) {

		nsCOMPtr<nsISupports> pEntry;
		rv = pSimpleEnumerator->GetNext(getter_AddRefs(pEntry));
		ENSURE_SUCCESS(rv, "Cannot GetNext on nsISimpleEnumerator");
		nsCOMPtr<nsIMsgDBHdr> pMsgDBHdr(do_QueryInterface(pEntry, &rv));
		ENSURE_SUCCESS(rv, "Cannot cast to nsIMsgDBHdr");

		CMessageHdr cMessageHdr;

		//ID Message
		char * id;
		rv = pMsgDBHdr->GetMessageId(&id);
		ENSURE_SUCCESS(rv, "Cannot GetMessageId on nsIMsgDBHdr");
		cMessageHdr.id = id;

		//Subject
		char * subject;
		rv = pMsgDBHdr->GetSubject(&subject);
		cMessageHdr.subject = subject;

		//Recipients
		char * r;
		rv = pMsgDBHdr->GetRecipients(&r);
		ENSURE_SUCCESS(rv, "Cannot GetRecipients on nsIMsgDBHdr");

		Addresses recipients;
		Adapt(r, recipients);
		cMessageHdr.recipients = recipients;

		//CC
		char * cc;
		rv = pMsgDBHdr->GetCcList(&cc);
		ENSURE_SUCCESS(rv, "Cannot GetCcList on nsIMsgDBHdr");
		Addresses ccRecipients;
		Adapt(cc, ccRecipients);
		cMessageHdr.ccRecipients = ccRecipients;

		//Author
		char * author;
		rv = pMsgDBHdr->GetAuthor(&author);
		Addresses authors;
		Adapt(author, authors);
		ENSURE_SUCCESS(rv, "Cannot GetAuthor on nsIMsgDBHdr");
		if (authors.length() == 1)
			cMessageHdr.author = authors[0];
		else
			cMessageHdr.author = "";

		//Date
		PRTime date;
		char dateString[100];
		rv = pMsgDBHdr->GetDate(&date);
		ENSURE_SUCCESS(rv, "Cannot GetDate on nsIMsgDBHdr");
		PRExplodedTime exploded;
		PR_ExplodeTime(date, PR_LocalTimeParameters, &exploded);
		PR_FormatTimeUSEnglish(dateString,  sizeof(dateString), "%m/%d/%Y %I:%M %p", &exploded);
		nsCAutoString s;
		s+=dateString;
		cMessageHdr.date = s.get();

		//Charset
		char * charset;
		rv = pMsgDBHdr->GetCharset(&charset);
		ENSURE_SUCCESS(rv, "Cannot GetCharset on nsIMsgDBHdr");
		cMessageHdr.charset = charset;

		//IsRead
		PRBool isRead;
		rv = pMsgDBHdr->GetIsRead(&isRead);
		ENSURE_SUCCESS(rv, "Cannot GetIsRead on nsIMsgDBHdr");
		cMessageHdr.isRead = isRead;

		//Size
		PRUint32 size;
		rv = pMsgDBHdr->GetMessageSize(&size);
		ENSURE_SUCCESS(rv, "Cannot GetMessageSize on nsIMsgDBHdr");
		cMessageHdr.size = size;

		//Key
		PRUint32 key;
		rv = pMsgDBHdr->GetMessageKey(&key);
		ENSURE_SUCCESS(rv, "Cannot GetMessageKey on nsIMsgDBHdr");
		cMessageHdr.key = key;

		//URI
		char * uri;
		rv = pFolder->GenerateMessageURI(key, &uri);
		ENSURE_SUCCESS(rv, "Cannot GenerateMessageURI on nsIMsgDBHdr");
		cMessageHdr.uri = uri;

		cMessageHdrs->length(i+1);
		(*cMessageHdrs)[i++] = cMessageHdr;
	}

	p_messageHdrs = cMessageHdrs;
}

 void MessageBrowseService_i::Adapt(const char * recipients, Addresses& addresses)
 {
	 nsresult rv;
	 nsCOMPtr<nsIMsgHeaderParser> parser = do_GetService(NS_MAILNEWS_MIME_HEADER_PARSER_CONTRACTID, &rv);

	 PRUnichar ** emailAddresses;
	 PRUnichar ** names;
	 PRUnichar ** fullNames;
	 PRUint32 numAddresses;

	 parser->ParseHeadersWithArray(NS_ConvertUTF8toUTF16(recipients).get(), &emailAddresses, &names, &fullNames, &numAddresses);

	 for(unsigned int i = 0; i < numAddresses; i++) {
		 nsAutoString address;
		 address.Adopt(emailAddresses[i]);
		 addresses.length(i+1);
		 addresses[i] = NS_ConvertUTF16toUTF8(address).get();
		 //It is possible to add name and fullname
	 }
 }



 void MessageBrowseService_i::GetAllFolders(const CFolder& p_rootFolder, CFolders_out p_folders)
 {
	nsresult rv;
	nsCOMPtr<nsIRDFService> rdf = do_GetService(
			"@mozilla.org/rdf/rdf-service;1", &rv);

	nsCOMPtr<nsIMsgFolder> pFolder;

	nsCOMPtr<nsIRDFResource> resource;
	rv = rdf->GetResource(nsCAutoString(p_rootFolder.uri), getter_AddRefs(
			resource));
	ENSURE_SUCCESS(rv, "Cannot GetResource on nsIMsgFolder rootFolder");

	pFolder = do_QueryInterface(resource, &rv);
	ENSURE_SUCCESS(rv,
			"Cannot do_QueryInterface on nsIRDFResource to nsIMsgFolder");

	if (pFolder == nsnull)
		throw CInternalServerException("root Folder not found, bad uri");

	nsCOMPtr<nsIEnumerator> subFolders;
	rv = pFolder->GetSubFolders(getter_AddRefs(subFolders));
	ENSURE_SUCCESS(rv, "Cannot get nsIEnumerator on GetSubFolders");

	//no child
	if (NS_FAILED(rv))
		return;

	PRBool moreFolders;
	nsAdapterEnumerator *simpleEnumerator = new nsAdapterEnumerator(subFolders);

	CFolders * cFolders = new CFolders();

	unsigned int i = 0;
	while (NS_SUCCEEDED(simpleEnumerator->HasMoreElements(&moreFolders))
			&& moreFolders) {
		nsCOMPtr<nsISupports> child;
		rv = simpleEnumerator->GetNext(getter_AddRefs(child));
		ENSURE_SUCCESS(rv, "Cannot GetNext on simpleEnumerator subFolders");
		nsCOMPtr<nsIMsgFolder> childFolder = do_QueryInterface(child, &rv);
		ENSURE_SUCCESS(rv, "Cannot cast simpleEnumerator to nsIMsgFolder");

		PRUnichar * n;
		childFolder->GetName(&n);
		nsAutoString folderString;
		folderString.Adopt(n);

		CFolder cFolder;
		cFolder.name = NS_ConvertUTF16toUTF8(folderString).get();
		cFolders->length(i + 1);

		char * uri;
		childFolder->GetURI(&uri);
		cFolder.uri = uri;

		(*cFolders)[i++] = cFolder;
	}

	p_folders = cFolders;
}

 void MessageBrowseService_i::GetRootFolder(const CAccount& p_account, CFolder_out p_rootFolder)
 {
	nsCOMPtr<nsIServiceManager> svcMgr;
	nsresult rv = NS_GetServiceManager(getter_AddRefs(svcMgr));
	ENSURE_SUCCESS(rv, "Cannot create NS_GetServiceManager");

	nsCOMPtr<nsIMsgAccountManager> pMsgAccountManager;
	rv = svcMgr->GetServiceByContractID(
			"@mozilla.org/messenger/account-manager;1", NS_GET_IID(
					nsIMsgAccountManager), getter_AddRefs(pMsgAccountManager));
	ENSURE_SUCCESS(rv, "Cannot get nsIMsgAccountManager");

	nsCOMPtr<nsIMsgAccount> pMsgAccount;
	rv = pMsgAccountManager->GetAccount(p_account.key, getter_AddRefs(
			pMsgAccount));
	ENSURE_SUCCESS(rv, "Cannot get nsIMsgAccount by key");

	nsCOMPtr<nsIMsgIncomingServer> pIncomingServer;
	rv = pMsgAccount->GetIncomingServer(getter_AddRefs(pIncomingServer));
	ENSURE_SUCCESS(rv, "Cannot GetIncomingServer");

	nsCOMPtr<nsIMsgFolder> pRootFolder;
	rv = pIncomingServer->GetRootFolder(getter_AddRefs(pRootFolder));
	ENSURE_SUCCESS(rv, "Cannot GetRootFolder");

	CFolder * cFolder = new CFolder();

	PRUnichar * n;
	pRootFolder->GetName(&n);
	nsAutoString folderString;
	folderString.Adopt(n);

	cFolder->name = NS_ConvertUTF16toUTF8(folderString).get();
	char * uri;
	pRootFolder->GetURI(&uri);
	cFolder->uri = uri;
	p_rootFolder = cFolder;

}

 void MessageBrowseService_i::GetSource(const CMessageHdr& p_messageHdr, SourceListener_ptr p_sourceMessageListener)
 {
	nsCOMPtr<nsIMsgMessageService> msgService;

	nsresult rv;
	nsCOMPtr<nsIMessenger> messenger = do_CreateInstance(
			"@mozilla.org/messenger;1", &rv);
	rv = messenger->MessageServiceFromURI(p_messageHdr.uri, getter_AddRefs(
			msgService));
	ENSURE_SUCCESS(rv, "Cannot create nsIMsgMessageService");

	nsCOMPtr<nsIInputStream> messageStream = do_CreateInstance(
			"@mozilla.org/network/sync-stream-listener;1", &rv);
	ENSURE_SUCCESS(rv, "Cannot create nsIInputStream");

	nsCOMPtr<nsIProxyObjectManager> proxyObjMgr = do_GetService(
			"@mozilla.org/xpcomproxy;1", &rv);
	ENSURE_SUCCESS(rv, "Cannot get nsIProxyObjectManager");

	nsCOMPtr<nsIMsgMessageService> pMsgServiceProxy;
	ENSURE_SUCCESS(rv, "Cannot get GetProxyForObject nsIMsgMessageService");

	rv = proxyObjMgr->GetProxyForObject(NS_UI_THREAD_EVENTQ, NS_GET_IID(
			nsIMsgMessageService), msgService, PROXY_SYNC | PROXY_ALWAYS,
			getter_AddRefs(pMsgServiceProxy));

	nsCOMPtr<SourceStreamListener> sourceStreamListener = new SourceStreamListener(p_sourceMessageListener);

	rv = pMsgServiceProxy->DisplayMessage(p_messageHdr.uri, sourceStreamListener,
			nsnull, nsnull, nsnull, nsnull);
	ENSURE_SUCCESS(rv, "Cannot get DisplayMessage nsIMsgMessageService");

	nsCOMPtr<nsIEventQueueService> pEventQService = do_GetService(
	      NS_EVENTQUEUESERVICE_CONTRACTID, &rv);
	ENSURE_SUCCESS(rv, "Cannot get service nsIEventQueueService");

	nsCOMPtr<nsIEventQueue> eventQueue;
	rv = pEventQService->GetThreadEventQueue(NS_UI_THREAD,
	      getter_AddRefs(eventQueue));
	ENSURE_SUCCESS(rv,"Cannot get GetThreadEventQueue nsIEventQueueService");

	//loop until loading is not complete
	while (!sourceStreamListener->IsDone()) {
	    eventQueue->ProcessPendingEvents();
	}
}

 void MessageBrowseService_i::GetDecryptedSource(const CMessageHdr& p_messageHdr, SourceListener_ptr p_sourceListener)
  {
 	nsCOMPtr<nsIMsgMessageService> msgService;

 	nsresult rv;
 	nsCOMPtr<nsIMessenger> messenger = do_CreateInstance(
 			"@mozilla.org/messenger;1", &rv);
 	rv = messenger->MessageServiceFromURI(p_messageHdr.uri, getter_AddRefs(
 			msgService));
 	ENSURE_SUCCESS(rv, "Cannot create nsIMsgMessageService");

 	nsCOMPtr<nsIInputStream> messageStream = do_CreateInstance(
 			"@mozilla.org/network/sync-stream-listener;1", &rv);
 	ENSURE_SUCCESS(rv, "Cannot create nsIInputStream");

 	nsCOMPtr<nsIProxyObjectManager> proxyObjMgr = do_GetService(
 			"@mozilla.org/xpcomproxy;1", &rv);
 	ENSURE_SUCCESS(rv, "Cannot get nsIProxyObjectManager");

 	nsCOMPtr<nsIMsgMessageService> pMsgServiceProxy;
 	ENSURE_SUCCESS(rv, "Cannot get GetProxyForObject nsIMsgMessageService");

 	rv = proxyObjMgr->GetProxyForObject(NS_UI_THREAD_EVENTQ, NS_GET_IID(
 			nsIMsgMessageService), msgService, PROXY_SYNC | PROXY_ALWAYS,
 			getter_AddRefs(pMsgServiceProxy));

 	nsCOMPtr<nsIURI> url;

 	rv = msgService->GetUrlForUri(p_messageHdr.uri, getter_AddRefs(url),
 					nsnull);
 	ENSURE_SUCCESS(rv, "Cannot get GetUrlForUri nsIMsgMessageService");

 	nsCOMPtr<nsIStreamConverter> m_mime_parser = do_CreateInstance(
 			NS_MAILNEWS_MIME_STREAM_CONVERTER_CONTRACTID, &rv);
 	ENSURE_SUCCESS(rv, "Cannot create nsIMimeStreamConverter");

 	//libmime converter
 	nsCOMPtr<nsIMimeStreamConverter> mimeConverter = do_QueryInterface(
 			m_mime_parser, &rv);
 	ENSURE_SUCCESS(rv, "Cannot cast nsIMimeStreamConverter on nsIStreamConverter");

 	if (mimeConverter) {
 		mimeConverter->SetMimeOutputType(nsMimeOutput::nsMimeMessageDecrypt);
 		mimeConverter->SetForwardInline(PR_FALSE);
 		mimeConverter->SetIdentity(nsnull);
 		mimeConverter->SetOriginalMsgURI(nsnull);
 	}

 	nsCOMPtr<SourceStreamListener> sourceStreamListener = new SourceStreamListener(p_sourceListener);

 	nsCOMPtr<nsIChannel> dummyChannel;
 	rv = NS_NewInputStreamChannel(getter_AddRefs(dummyChannel), url, nsnull);
 	ENSURE_SUCCESS(rv, "Cannot create NS_NewInputStreamChannel for nsIChannel");

 	m_mime_parser->AsyncConvertData(
 		    "message/rfc822",
 		    "message/rfc822",
 		   sourceStreamListener, dummyChannel);

 	nsCOMPtr<nsIStreamListener> inputConvertedListener = do_QueryInterface(m_mime_parser, &rv);
 	ENSURE_SUCCESS(rv, "Cannot cast nsIStreamListener on nsIStreamConverter");

 	rv = pMsgServiceProxy->DisplayMessage(p_messageHdr.uri, inputConvertedListener,
 			nsnull, nsnull, nsnull, nsnull);
 	ENSURE_SUCCESS(rv, "Cannot get DisplayMessage nsIMsgMessageService");

 	nsCOMPtr<nsIEventQueueService> pEventQService = do_GetService(
 	      NS_EVENTQUEUESERVICE_CONTRACTID, &rv);
 	ENSURE_SUCCESS(rv, "Cannot get service nsIEventQueueService");

 	nsCOMPtr<nsIEventQueue> eventQueue;
 	rv = pEventQService->GetThreadEventQueue(NS_UI_THREAD,
 	      getter_AddRefs(eventQueue));
 	ENSURE_SUCCESS(rv,"Cannot get GetThreadEventQueue nsIEventQueueService");

 	//loop until loading is not complete
 	while (!sourceStreamListener->IsDone()) {
 	    eventQueue->ProcessPendingEvents();
 	}
 }

 void MessageBrowseService_i::GetNewMessages(const CFolder& p_Folder)
 {
	nsresult rv;
	nsCOMPtr<nsIRDFService> rdf = do_GetService(
			"@mozilla.org/rdf/rdf-service;1", &rv);
	ENSURE_SUCCESS(rv, "Cannot GetService for nsIRDFService");

	nsCOMPtr<nsIMsgFolder> pFolder;

	nsCOMPtr<nsIRDFResource> resource;
	rv = rdf->GetResource(nsCAutoString(p_Folder.uri), getter_AddRefs(
					resource));
	ENSURE_SUCCESS(rv, "Cannot GetResource on nsIRDFResource");

	pFolder = do_QueryInterface(resource, &rv);
	ENSURE_SUCCESS(rv, "Cannot do_QueryInterface on nsIRDFResource to nsIMsgFolder");

	rv = pFolder->GetNewMessages(nsnull, nsnull);
	ENSURE_SUCCESS(rv, "Cannot GetNewMessages on nsIMsgFolder");
}

 void MessageBrowseService_i::GetLocalFolder(CFolder_out p_localFolder)
 {
	nsresult rv;
	nsCOMPtr<nsIRDFService> rdf = do_GetService(
			"@mozilla.org/rdf/rdf-service;1", &rv);
	ENSURE_SUCCESS(rv, "Cannot GetService for nsIRDFService");

	nsCOMPtr<nsIRDFResource> resource;
	rv = rdf->GetResource(nsCAutoString("mailbox://nobody@Local%20Folders"), getter_AddRefs(
						resource));
	ENSURE_SUCCESS(rv, "Cannot GetResource on nsIRDFResource");

	nsCOMPtr<nsIMsgFolder> pFolder;
	pFolder = do_QueryInterface(resource, &rv);
	ENSURE_SUCCESS(rv, "Cannot do_QueryInterface on nsIRDFResource to nsIMsgFolder");

	CFolder * cFolder = new CFolder();

	PRUnichar * n;
	rv = pFolder->GetName(&n);
	ENSURE_SUCCESS(rv, "Cannot GetName on nsIMsgFolder");
	nsAutoString folderString;
	folderString.Adopt(n);

	cFolder->name = NS_ConvertUTF16toUTF8(folderString).get();
	char * uri;

	rv = pFolder->GetURI(&uri);
	ENSURE_SUCCESS(rv, "Cannot GetURI on nsIMsgFolder");

	cFolder->uri = uri;
	p_localFolder = cFolder;

}
