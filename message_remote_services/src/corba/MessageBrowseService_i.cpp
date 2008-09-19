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
#include "nsMsgUtils.h"
#include "nsIRDFService.h"
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
	pFolder = do_QueryInterface(resource, &rv);

	nsCOMPtr<nsIMsgDatabase> pMsgDatabase;
	rv = pFolder->GetMsgDatabase(nsnull, getter_AddRefs(pMsgDatabase));
	ENSURE_SUCCESS(rv, "Cannot GetMsgDatabase");

	nsCOMPtr<nsISimpleEnumerator> pSimpleEnumerator;
	pMsgDatabase->EnumerateMessages(getter_AddRefs(pSimpleEnumerator));
	ENSURE_SUCCESS(rv, "Cannot EnumerateMessages");

	PRBool moreElements = PR_FALSE;

	unsigned int i = 0;

	CMessageHdrs * cMessageHdrs = new CMessageHdrs();

	while (NS_SUCCEEDED(pSimpleEnumerator->HasMoreElements(&moreElements))	&& moreElements) {

		nsCOMPtr<nsISupports> pEntry;
		rv = pSimpleEnumerator->GetNext(getter_AddRefs(pEntry));
		ENSURE_SUCCESS(rv, "Cannot GetNext");
		cout << "DEBUG " << i << endl;

		nsCOMPtr<nsIMsgDBHdr> pMsgDBHdr(do_QueryInterface(pEntry));
		CMessageHdr cMessageHdr;
		char * id;
		pMsgDBHdr->GetMessageId(&id);
		cMessageHdr.id = id;
		cMessageHdrs->length(i+1);
		(*cMessageHdrs)[i++] = cMessageHdr;
	}

	p_messageHdrs = cMessageHdrs;
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


	pFolder = do_QueryInterface(resource, &rv);

	if (pFolder == nsnull)
		cout << "2" << endl;

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
	 while (NS_SUCCEEDED(simpleEnumerator->HasMoreElements(&moreFolders)) && moreFolders) {
		 nsCOMPtr<nsISupports> child;
		 rv = simpleEnumerator->GetNext(getter_AddRefs(child));
		 ENSURE_SUCCESS(rv, "Cannot GetNext on simpleEnumerator subFolders");
		 nsCOMPtr <nsIMsgFolder> childFolder = do_QueryInterface(child, &rv);
		 ENSURE_SUCCESS(rv, "Cannot cast simpleEnumerator to nsIMsgFolder");

		 PRUnichar * n;
		 childFolder->GetName(&n);
		 nsAutoString folderString;
		 folderString.Adopt(n);

		 CFolder cFolder;
		 cFolder.name = NS_ConvertUTF16toUTF8(
				 folderString).get();
		 cFolders->length(i+1);

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

	cFolder->name = NS_LossyConvertUTF16toASCII(folderString).get();
	char * uri;
	pRootFolder->GetURI(&uri);
	cFolder->uri = uri;
	p_rootFolder = cFolder;

}
