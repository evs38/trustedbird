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
#include "MessageComposeService_i.h"
#include "nsXPCOM.h"
#include "nsCOMPtr.h"
#include "nsStringAPI.h"
#include "nsIMsgComposeService.h"
#include "nsMsgCompCID.h"
#include "nsString.h"
#include "nsIMsgAccountManager.h"
#include "nsIAppShellService.h"
#include "nsIDOMWindowInternal.h"
#include "nsIProxyObjectManager.h"
#include "Utils.h"
#include "MessageRemoteSendListener.h"
#include "nsIMsgSMIMECompFields.h"
#include "nsMsgSMIMECID.h"
#include "nsIMsgAttachment.h"
#include <iostream>

#define CHAR_NOT_FOUND -1
using namespace std;

MessageComposeService_i::MessageComposeService_i() {
 
    NS_GetServiceManager(getter_AddRefs(svcMgr));
}

MessageComposeService_i::~MessageComposeService_i() {
}

void MessageComposeService_i::FillMsgComposeParams(
                                                   const CMessage& p_message,
                                                   nsIMsgComposeParams * pMsgComposeParams) {
  nsresult rv;
  nsCOMPtr<nsIMsgCompFields> pMsgCompFields(do_CreateInstance(
      NS_MSGCOMPFIELDS_CONTRACTID, &rv));   
  ENSURE_SUCCESS(rv, "Cannot create nsIMsgCompFields");

  rv = pMsgComposeParams->SetFormat(nsIMsgCompFormat::PlainText);
  ENSURE_SUCCESS(rv,"Cannot SetFormat");

  rv = pMsgComposeParams->SetType(nsIMsgCompType::New);
  ENSURE_SUCCESS(rv,"Cannot SetType");

  rv = pMsgCompFields->SetSubject(NS_ConvertUTF8toUTF16(p_message.subject));
  ENSURE_SUCCESS(rv,"Cannot SetSubject");

  cout << "INFO : MessageComposeService_i::SendMessage Addresses To" << endl;
  Addresses recipients = p_message.recipients_to;
  nsAutoString toRecipients;

  for (int i = 0; i < recipients.length(); ++i) {
    cout << "Recipient : " << recipients[i] << endl;

    if (i>0)
      toRecipients += NS_LITERAL_STRING(",");

    toRecipients += NS_ConvertUTF8toUTF16(recipients[i]);
  }

  rv = pMsgCompFields->SetTo(toRecipients);
  ENSURE_SUCCESS(rv, "Cannot SetTo");

  nsAutoString body = NS_ConvertUTF8toUTF16(p_message.body)
      + NS_ConvertUTF8toUTF16("\r\n");
  pMsgCompFields->SetBody(body);
  ENSURE_SUCCESS(rv,"Cannot SetBody");

  //Add headers
  this->AddCustomHeaders(pMsgCompFields, p_message.p_headers);
  
  nsCOMPtr<nsIMsgSMIMECompFields> mSMIMECompFields = do_CreateInstance(
      NS_MSGSMIMECOMPFIELDS_CONTRACTID, &rv);

  //Sign message
  if (p_message.security.isSigned)
    mSMIMECompFields->SetSignMessage(PR_TRUE);

  //Sign message
  if (p_message.security.isCrypted)
    mSMIMECompFields->SetRequireEncryptMessage(PR_TRUE);

  pMsgCompFields->SetSecurityInfo(mSMIMECompFields);

  //MDN
  if (p_message.notification.isMDNReadRequested)
    pMsgCompFields->SetReturnReceipt(PR_TRUE);
  
#ifdef DSN
  //DSN
  if (p_message.notification.isDSNRequested)
    pMsgCompFields->SetDSN(PR_TRUE);
#endif
   
  this->AddAttachment(pMsgCompFields, p_message.p_attachments);
  
  rv = pMsgComposeParams->SetComposeFields(pMsgCompFields);
  ENSURE_SUCCESS(rv,"Cannot SetComposeFields");

}

void MessageComposeService_i::GetMsgAccount(nsIMsgIdentity * * pMsgIdentity, const Account& p_account) {
  
  nsCOMPtr<nsIMsgAccountManager> pMsgAccountManager;
  nsresult rv = svcMgr->GetServiceByContractID(
      "@mozilla.org/messenger/account-manager;1",
      NS_GET_IID(nsIMsgAccountManager), getter_AddRefs(pMsgAccountManager));
  ENSURE_SUCCESS(rv, "Cannot get nsIMsgAccountManager");

  cout << "INFO : MessageComposeService_i::SendMessage GetAccount" << endl;
  nsCOMPtr<nsIMsgAccount> pMsgAccount;
  rv = pMsgAccountManager->GetAccount(p_account.key,
      getter_AddRefs(pMsgAccount));
  ENSURE_SUCCESS(rv, "Cannot get nsIMsgAccount by key");

  cout << "INFO : MessageComposeService_i::SendMessage GetDefaultIdentity"
      << endl;
 
  rv = pMsgAccount->GetDefaultIdentity(pMsgIdentity);
  ENSURE_SUCCESS(rv, "Cannot get nsIMsgIdentity");
  cout << "INFO : MessageComposeService_i::GetMsgAccount GetDefaultIdentity "
      << rv << endl;
}

void MessageComposeService_i::SendMessage(const Account& p_account,
                                          const CMessage& p_message,
                                          MessageSendListener_ptr p_listener,
                                          ::CORBA::Boolean openComposeWindowOnBadFormat) {
  cout << "INFO : MessageComposeService_i::SendMessage ENTER" << endl;

  nsresult rv;
  
  //Fill MsgComposeParams From CMessage
  nsCOMPtr<nsIMsgComposeParams> pMsgComposeParams(do_CreateInstance(
      NS_MSGCOMPOSEPARAMS_CONTRACTID, &rv));
  ENSURE_SUCCESS(rv, "Cannot create nsIMsgComposeParams");
  
  this->FillMsgComposeParams(p_message,pMsgComposeParams);

  //Control Format
  if (!this->ControlFormat(p_message.recipients_to)) {
    if (openComposeWindowOnBadFormat == true)
      ShowMessageCompositionWindow(pMsgComposeParams);
    throw InternalServerException("Bad Format in 'to' field");
  }
  
  //Get account
  nsCOMPtr<nsIMsgIdentity> pDefaultIdentity;
  this->GetMsgAccount(getter_AddRefs(pDefaultIdentity), p_account);
  
  //create Listener to inform client of the process (Observer Pattern)
  nsCOMPtr <nsIMsgSendListener> sendListener = new MessageRemoteSendListener(p_listener, p_message);
  pMsgComposeParams->SetSendListener(sendListener);

  //create Message Service Compose Service
  nsCOMPtr<nsIMsgComposeService> pMsgComposeService;
  rv = svcMgr->GetServiceByContractID("@mozilla.org/messengercompose;1",
      NS_GET_IID(nsIMsgComposeService), getter_AddRefs(pMsgComposeService));
  ENSURE_SUCCESS(rv, "Cannot get nsIMsgComposeService");

  cout << "INFO : MessageComposeService_i::SendMessage InitCompose" << endl;
  nsCOMPtr<nsIAppShellService> appService = do_GetService(
      "@mozilla.org/appshell/appShellService;1", &rv);
  ENSURE_SUCCESS(rv,"Cannot create nsIAppShellService");

  nsCOMPtr<nsIDOMWindowInternal> hiddenWindow;
  rv = appService->GetHiddenDOMWindow(getter_AddRefs(hiddenWindow));
  ENSURE_SUCCESS(rv,"Cannot GetHiddenDOMWindow");

  nsCOMPtr<nsIProxyObjectManager> proxyObjMgr = do_GetService(
      "@mozilla.org/xpcomproxy;1", &rv);
  ENSURE_SUCCESS(rv,"Cannot get nsIProxyObjectManager");

  nsCOMPtr<nsIMsgCompose> pMsgCompose;
  rv = pMsgComposeService->InitCompose((nsIDOMWindowInternal *)hiddenWindow,
      (nsIMsgComposeParams *)pMsgComposeParams, getter_AddRefs(pMsgCompose));
  ENSURE_SUCCESS(rv,"Cannot InitCompose");
  
  //Proxy to call method inside the UI Thread, async call
  nsCOMPtr<nsIMsgCompose> pMsgComposeProxy;
  ENSURE_SUCCESS(rv,"Cannot get GetProxyForObject nsIProxyObjectManager");
  rv = proxyObjMgr->GetProxyForObject(NS_UI_THREAD_EVENTQ,
      NS_GET_IID(nsIMsgCompose), pMsgCompose, PROXY_ASYNC|PROXY_ALWAYS,
      getter_AddRefs(pMsgComposeProxy));

  //Send message
  cout << "INFO : MessageComposeService_i::SendMessage SendMsg : " << rv
      << endl;
  rv = pMsgComposeProxy->SendMsg(nsIMsgCompDeliverMode::Now, pDefaultIdentity,
      nsnull, nsnull, nsnull) ;
  ENSURE_SUCCESS(rv,"Cannot SendMsg nsIMsgCompose Proxy");
  
  //Loop until the message has been delivered to MTA
  nsCOMPtr<nsIEventQueueService> pEventQService = do_GetService(
      NS_EVENTQUEUESERVICE_CONTRACTID, &rv);

  nsCOMPtr<nsIEventQueue> eventQueue;
  rv = pEventQService->GetThreadEventQueue(NS_UI_THREAD,
      getter_AddRefs(eventQueue));
  ENSURE_SUCCESS(rv,"Cannot get GetThreadEventQueue nsIEventQueueService");

  nsIMsgSendListener * pSendListener = sendListener;

  if (!pSendListener)
    cout << "nsIMsgSendListener NULL" << endl;

  cout << "INFO : nsIEventQueueService Looping Start : " << rv << endl;

  while ( !((MessageRemoteSendListener *) pSendListener)->IsDone() ) {
    eventQueue->ProcessPendingEvents();
  }

  cout << "INFO : MessageComposeService_i::SendMessage EXIT" << endl;

}

bool MessageComposeService_i::ControlFormat(const Addresses& recipients){
  //Check if there is at least one recepient
  if (recipients.length() == 0)
    return false;
  
  nsAutoString recipient;
  for (int i = 0; i < recipients.length(); ++i) {
    recipient = NS_ConvertUTF8toUTF16(recipients[i]);
    if (recipient.FindChar('@') == CHAR_NOT_FOUND)
      return false;
  }
}

void MessageComposeService_i::ShowMessageCompositionWindow(nsIMsgComposeParams * pMsgComposeParams) {
  nsresult rv;
  nsCOMPtr<nsIProxyObjectManager> proxyObjMgr = do_GetService(
      "@mozilla.org/xpcomproxy;1", &rv);
  ENSURE_SUCCESS(rv,"Cannot get nsIProxyObjectManager");

  nsCOMPtr<nsIMsgComposeService> pMsgComposeService;
  rv = svcMgr->GetServiceByContractID("@mozilla.org/messengercompose;1",
      NS_GET_IID(nsIMsgComposeService), getter_AddRefs(pMsgComposeService));
  ENSURE_SUCCESS(rv, "Cannot get nsIMsgComposeService");

  nsCOMPtr<nsIMsgComposeService> pMsgComposeServiceProxy;
  rv = proxyObjMgr->GetProxyForObject(NS_UI_THREAD_EVENTQ,
      NS_GET_IID(nsIMsgComposeService), pMsgComposeService, PROXY_ASYNC
          |PROXY_ALWAYS, getter_AddRefs(pMsgComposeServiceProxy));

  pMsgComposeServiceProxy->OpenComposeWindowWithParams(nsnull,
      pMsgComposeParams) ;

}

void MessageComposeService_i::AddCustomHeaders(nsIMsgCompFields * pMsgCompFields, const Headers& headers){
  nsresult rv;
  if (headers.length() == 0)
    return;

  nsAutoString headers_inline;
  cout << "Custom Headers NB : " << headers.length() << endl;

  for (int i = 0; i < headers.length(); ++i) {
    cout << "Custom Headers  " << i << " : " << headers[i].key << " , "
        << headers[i].value << endl;
    headers_inline.Append(NS_ConvertUTF8toUTF16(headers[i].key));
    headers_inline.Append(NS_ConvertUTF8toUTF16(": "));
    headers_inline.Append(NS_ConvertUTF8toUTF16(headers[i].value));
    headers_inline.Append(NS_ConvertUTF8toUTF16("\r\n"));
  }

  rv = pMsgCompFields->SetOtherRandomHeaders(headers_inline);
  cout << "Custom Headers : " << NS_LossyConvertUTF16toASCII(headers_inline).get() << endl;
  ENSURE_SUCCESS(rv, "Cannot set nsIMsgCompFields Other Random Headers");
  
}

void MessageComposeService_i::AddAttachment(nsIMsgCompFields * pMsgCompFields, const Attachments& attachments){
  nsresult rv;
  
  for (int i = 0; i < attachments.length(); ++i) {
    
    if (IsFile(attachments[i]) == PR_FALSE)
      throw InternalServerException("Path error in attachment, maybe file does not exist");
      
    nsCOMPtr<nsIMsgAttachment> pMsgAttachment = do_CreateInstance(NS_MSGATTACHMENT_CONTRACTID, &rv);
    ENSURE_SUCCESS(rv, "Cannot create pMsgAttachment");
    
    rv = pMsgAttachment->SetName(NS_ConvertUTF8toUTF16(attachments[i].fileName));
    ENSURE_SUCCESS(rv, "Cannot create pMsgAttachment name");
    
    rv = pMsgAttachment->SetContentType(attachments[i].mimeType);
    ENSURE_SUCCESS(rv, "Cannot create pMsgAttachment ContentType");
    
    nsAutoString path = NS_ConvertUTF8toUTF16("file://");
    path += NS_ConvertUTF8toUTF16(attachments[i].dirPath);
    path += NS_ConvertUTF8toUTF16("/");
    path += NS_ConvertUTF8toUTF16(attachments[i].fileName);
    
    
    rv = pMsgAttachment->SetUrl(NS_LossyConvertUTF16toASCII(path).get());
    ENSURE_SUCCESS(rv, "Cannot create pMsgAttachment path");
    
    rv = pMsgCompFields->AddAttachment(pMsgAttachment);
    ENSURE_SUCCESS(rv, "Cannot add pMsgAttachment");
  }
}

PRBool MessageComposeService_i::IsFile(const Attachment& attachment){
    PRBool exists =  PR_FALSE;
    nsresult rv;
    nsCOMPtr<nsILocalFile> pLocalFile = do_CreateInstance(NS_LOCAL_FILE_CONTRACTID, &rv);
    ENSURE_SUCCESS(rv, "Cannot create nsILocalFile");
    
    rv = pLocalFile->InitWithNativePath(nsDependentCString("/tmp/"));
    ENSURE_SUCCESS(rv, "Cannot call InitWithNativePath");
    
    rv = pLocalFile->AppendRelativeNativePath(nsDependentCString("attachment.txt"));
    ENSURE_SUCCESS(rv, "Cannot call AppendRelativeNativePath");
    
    rv = pLocalFile->Exists(&exists);
    ENSURE_SUCCESS(rv, "Cannot call Exists");
    return exists;
}
