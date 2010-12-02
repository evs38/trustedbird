/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#include "nsMsgSMIMEReceiptGenerator.h"
#include "nsIMsgAccountManager.h"
#include "nsMsgBaseCID.h"
#include "nsMailHeaders.h"
#include "nsISmtpService.h"
#include "nsMsgCompCID.h"
#include "nsDirectoryServiceDefs.h"
#include "nsMsgUtils.h"
#include "nsISmtpServer.h"
#include "nsIPrompt.h"
#include "nsIStringBundle.h"
#include "nsNetUtil.h"
#include "nsComposeStrings.h"
#include "nsMsgI18N.h"
#include "nsIMsgCompUtils.h"
#include "nsIMsgHeaderParser.h"
#include "nsMsgSMIMECID.h"
#include "nsIMsgCompFields.h"
#include "nsIHttpProtocolHandler.h"
#include "nsImapCore.h"
#include "nsIMsgImapMailFolder.h"
#include "prprf.h"
#include "prmem.h"


#define SMIME_RECEIPT_REQUEST_PROCESSED "SMIMEReceiptRequestProcessed"

#define PUSH_N_FREE_STRING(p) \
  do { if (p) { rv = WriteString(p); PR_smprintf_free(p); p = 0; if (NS_FAILED(rv)) return rv; } \
       else { return NS_ERROR_OUT_OF_MEMORY; } \
  } while (0)


NS_IMPL_ISUPPORTS2(nsMsgSMIMEReceiptGenerator, nsIMsgSMIMEReceiptGenerator, nsIUrlListener)

nsMsgSMIMEReceiptGenerator::nsMsgSMIMEReceiptGenerator()
{
  m_signedContentIdentifier = NULL;
  m_originatorSignatureValue = NULL;
  m_originatorContentType = NULL;
  m_msgSigDigest = NULL;
}

nsMsgSMIMEReceiptGenerator::~nsMsgSMIMEReceiptGenerator()
{
  PR_FREEIF(m_signedContentIdentifier);
  PR_FREEIF(m_originatorSignatureValue);
  PR_FREEIF(m_originatorContentType);
  PR_FREEIF(m_msgSigDigest);
}

NS_IMETHODIMP nsMsgSMIMEReceiptGenerator::Process(nsIMsgWindow *aWindow,
                                                  nsIMsgFolder *aFolder,
                                                  nsMsgKey aKey,
                                                  nsIMimeHeaders *aHeaders,
                                                  PRUint8 *aSignedContentIdentifier,
                                                  PRUint32 aSignedContentIdentifierLen,
                                                  PRUint32 aReceiptsFrom,
                                                  const nsAString& aReceiptsTo,
                                                  PRUint8 *aOriginatorSignatureValue,
                                                  PRUint32 aOriginatorSignatureValueLen,
                                                  PRUint8 *aOriginatorContentType,
                                                  PRUint32 aOriginatorContentTypeLen,
                                                  PRUint8 *aMsgSigDigest,
                                                  PRUint32 aMsgSigDigestLen,
                                                  PRBool *_retval)
{
  nsresult rv;
  m_window = aWindow;
  m_folder = aFolder;
  m_key = aKey;
  m_headers = aHeaders;
  CopyUTF16toUTF8(aReceiptsTo, m_recipient);

  m_signedContentIdentifier = (PRUint8*)PR_MALLOC(aSignedContentIdentifierLen);
  memcpy(m_signedContentIdentifier, aSignedContentIdentifier, aSignedContentIdentifierLen);
  m_signedContentIdentifierLen = aSignedContentIdentifierLen;

  m_originatorSignatureValue = (PRUint8*)PR_MALLOC(aOriginatorSignatureValueLen);
  memcpy(m_originatorSignatureValue, aOriginatorSignatureValue, aOriginatorSignatureValueLen);
  m_originatorSignatureValueLen = aOriginatorSignatureValueLen;

  m_originatorContentType = (PRUint8*)PR_MALLOC(aOriginatorContentTypeLen);
  memcpy(m_originatorContentType, aOriginatorContentType, aOriginatorContentTypeLen);
  m_originatorContentTypeLen = aOriginatorContentTypeLen;

  m_msgSigDigest = (PRUint8*)PR_MALLOC(aMsgSigDigestLen);
  memcpy(m_msgSigDigest, aMsgSigDigest, aMsgSigDigestLen);
  m_msgSigDigestLen = aMsgSigDigestLen;

  *_retval = PR_FALSE;

  rv = m_folder->GetMessageHeader(m_key, getter_AddRefs(m_msghdr));
  NS_ENSURE_SUCCESS(rv, rv);

  rv = GetIdentity();
  NS_ENSURE_SUCCESS(rv, rv);

  if (m_identity)
  {
    nsCString identEmail;
    m_identity->GetEmail(identEmail);
    if (identEmail.Equals(m_recipient))
    {
      // If receipt recipient is myself, don't send anything
      UserDeclined();
      return NS_OK;
    }

    /* Get send policy */
    PRInt32 sendPolicy; /* 0: ask  1: never  2: always */
    m_identity->GetIntAttribute("smime_receipt_send_policy", &sendPolicy);

    switch (sendPolicy)
    {
      case 0:
        *_retval = PR_TRUE;
        break;
      case 1:
        UserDeclined();
        break;
      case 2:
        UserAgreed();
        break;
      default:
        UserDeclined();
    }
  }

  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEReceiptGenerator::UserAgreed()
{
  nsresult rv;

  nsString signingCertName;
  m_identity->GetUnicharAttribute("signing_cert_name", signingCertName);
  if (signingCertName.IsEmpty())
  {
    // No signing cert available
    nsCOMPtr<nsIPrompt> dialog;
    rv = m_window->GetPromptDialog(getter_AddRefs(dialog));
    NS_ENSURE_SUCCESS(rv, rv);

    nsCOMPtr<nsIStringBundle> bundle;
    nsCOMPtr<nsIStringBundleService> bundleService(do_GetService("@mozilla.org/intl/stringbundle;1", &rv));
    NS_ENSURE_SUCCESS(rv, rv);

    rv = bundleService->CreateBundle("chrome://messenger-smime/locale/msgSMIMEReceiptGenerator.properties", getter_AddRefs(bundle));
    NS_ENSURE_SUCCESS(rv, rv);

    nsString errorTitle;
    nsString errorMsg;
    rv = bundle->GetStringFromName(NS_LITERAL_STRING("noSigningCertTitle").get(), getter_Copies(errorTitle));
    NS_ENSURE_SUCCESS(rv, rv);
    rv = bundle->GetStringFromName(NS_LITERAL_STRING("noSigningCert").get(), getter_Copies(errorMsg));
    NS_ENSURE_SUCCESS(rv, rv);

    rv = dialog->Alert(errorTitle.get(), errorMsg.get());
    NS_ENSURE_SUCCESS(rv, rv);
  }

  rv = CreateMessage();
  NS_ENSURE_SUCCESS(rv, rv);

  rv = SendMessage();
  NS_ENSURE_SUCCESS(rv, rv);

  return rv;
}

NS_IMETHODIMP nsMsgSMIMEReceiptGenerator::UserDeclined()
{
  nsresult rv;

  rv = StoreSMIMEReceiptSentFlag();
  NS_ENSURE_SUCCESS(rv, rv);

  return NS_OK;
}

nsresult nsMsgSMIMEReceiptGenerator::CreateMessage()
{
  nsresult rv;

  rv = GetSpecialDirectoryWithFileName(NS_OS_TEMP_DIR, "smimeReceiptMsg", getter_AddRefs(m_file));
  NS_ENSURE_SUCCESS(rv, rv);

  rv = m_file->CreateUnique(nsIFile::NORMAL_FILE_TYPE, 00600);
  nsCOMPtr <nsILocalFile> localFile = do_QueryInterface(m_file);
  NS_ENSURE_SUCCESS(rv, rv);
  rv = NS_NewLocalFileOutputStream(getter_AddRefs(m_outputStream),
                                   localFile,
                                   PR_CREATE_FILE | PR_WRONLY | PR_TRUNCATE,
                                   0664);
  NS_ASSERTION(NS_SUCCEEDED(rv), "creating smime receipt message: failed to output stream");
  NS_ENSURE_SUCCESS(rv, rv);

  // Create message headers
  rv = CreateMessageHeaders();
  NS_ENSURE_SUCCESS(rv, rv);

  m_composeSecure = do_CreateInstance(NS_MSGCOMPOSESECURE_CONTRACTID, &rv);
  NS_ENSURE_SUCCESS(rv, rv);

  // Create compose fields
  nsCOMPtr<nsIMsgCompFields> compFields = do_CreateInstance(NS_MSGCOMPFIELDS_CONTRACTID, &rv);
  if (!compFields)
    return NS_ERROR_OUT_OF_MEMORY;

  nsCOMPtr<nsIMsgSMIMECompFields> SMIMECompFields = do_CreateInstance(NS_MSGSMIMECOMPFIELDS_CONTRACTID, &rv);
  if (!SMIMECompFields)
    return NS_ERROR_OUT_OF_MEMORY;

  SMIMECompFields->SetSignMessage(PR_TRUE);
  SMIMECompFields->SetSMIMEReceipt(PR_TRUE);
  SMIMECompFields->SetSMIMEReceiptSignedContentIdentifier(m_signedContentIdentifier);
  SMIMECompFields->SetSMIMEReceiptSignedContentIdentifierLen(m_signedContentIdentifierLen);
  SMIMECompFields->SetSMIMEReceiptOriginatorSignatureValue(m_originatorSignatureValue);
  SMIMECompFields->SetSMIMEReceiptOriginatorSignatureValueLen(m_originatorSignatureValueLen);
  SMIMECompFields->SetSMIMEReceiptOriginatorContentType(m_originatorContentType);
  SMIMECompFields->SetSMIMEReceiptOriginatorContentTypeLen(m_originatorContentTypeLen);
  SMIMECompFields->SetSMIMEReceiptMsgSigDigest(m_msgSigDigest);
  SMIMECompFields->SetSMIMEReceiptMsgSigDigestLen(m_msgSigDigestLen);

  compFields->SetSecurityInfo(SMIMECompFields);

  // Create S/MIME signature
  rv = m_composeSecure->BeginCryptoEncapsulation(m_outputStream, m_recipient.get(), compFields, m_identity, NULL, PR_FALSE);
  NS_ENSURE_SUCCESS(rv, rv);
  rv = m_composeSecure->FinishCryptoEncapsulation(PR_FALSE, NULL);
  NS_ENSURE_SUCCESS(rv, rv);

  if (m_outputStream)
  {
    m_outputStream->Flush();
    m_outputStream->Close();
  }

  if (NS_FAILED(rv))
    m_file->Remove(PR_FALSE);

  return rv;
}

nsresult nsMsgSMIMEReceiptGenerator::CreateMessageHeaders()
{
  char* convbuf = nsnull;
  char* tmpBuffer = nsnull;
  char* parm = nsnull;
  nsresult rv = NS_OK;
  nsCOMPtr<nsIMsgCompUtils> compUtils;

  compUtils = do_GetService(NS_MSGCOMPUTILS_CONTRACTID, &rv);
  NS_ENSURE_SUCCESS(rv, rv);

  tmpBuffer = (char*)PR_CALLOC(256);

  if (!tmpBuffer)
    return NS_ERROR_OUT_OF_MEMORY;

  PRExplodedTime now;
  PR_ExplodeTime(PR_Now(), PR_LocalTimeParameters, &now);

  int gmtoffset = (now.tm_params.tp_gmt_offset + now.tm_params.tp_dst_offset) / 60;
  /* Use PR_FormatTimeUSEnglish() to format the date in US English format,
     then figure out what our local GMT offset is, and append it (since
     PR_FormatTimeUSEnglish() can't do that.) Generate four digit years as
     per RFC 1123 (superceding RFC 822.)
  */
  PR_FormatTimeUSEnglish(tmpBuffer, 100,
                         "Date: %a, %d %b %Y %H:%M:%S ",
                         &now);

  PR_snprintf(tmpBuffer + strlen(tmpBuffer), 100,
              "%c%02d%02d" CRLF,
              (gmtoffset >= 0 ? '+' : '-'),
              ((gmtoffset >= 0 ? gmtoffset : -gmtoffset) / 60),
              ((gmtoffset >= 0 ? gmtoffset : -gmtoffset) % 60));

  rv = WriteString(tmpBuffer);
  PR_Free(tmpBuffer);
  NS_ENSURE_SUCCESS(rv, rv);

  nsCString charset;
  rv = m_folder->GetCharset(charset);
  NS_ENSURE_SUCCESS(rv, rv);

  PRBool conformToStandard = PR_FALSE;
  if (compUtils)
    compUtils->GetMsgMimeConformToStandard(&conformToStandard);

  nsCString email;
  nsString fullName;
  m_identity->GetFullName(fullName);
  m_identity->GetEmail(email);

  nsCString fullAddress;
  nsCOMPtr<nsIMsgHeaderParser> parser(do_GetService(NS_MAILNEWS_MIME_HEADER_PARSER_CONTRACTID));
  if (parser)
    parser->MakeFullAddressString(NS_ConvertUTF16toUTF8(fullName).get(), email.get(), getter_Copies(fullAddress));

  convbuf = nsMsgI18NEncodeMimePartIIStr((!fullAddress.IsEmpty()) ? fullAddress.get(): email.get(), PR_TRUE, charset.get(), 0, conformToStandard);

  parm = PR_smprintf("From: %s" CRLF, convbuf ? convbuf : email.get());
  PUSH_N_FREE_STRING(parm);

  PR_Free(convbuf);

  if (compUtils)
  {
    nsCString msgId;
    rv = compUtils->MsgGenerateMessageId(m_identity, getter_Copies(msgId));
    tmpBuffer = PR_smprintf("Message-ID: %s" CRLF, msgId.get());
    PUSH_N_FREE_STRING(tmpBuffer);
  }

  nsCString subject;
  m_headers->ExtractHeader(HEADER_SUBJECT, PR_FALSE, getter_Copies(subject));
  convbuf = nsMsgI18NEncodeMimePartIIStr(subject.Length() ? subject.get() : "[no subject]", PR_FALSE, charset.get(), 0, conformToStandard);
  tmpBuffer = PR_smprintf("Subject: S/MIME Receipt: %s" CRLF, (convbuf ? convbuf : (subject.Length() ? subject.get() : "[no subject]")));
  PUSH_N_FREE_STRING(tmpBuffer);
  PR_Free(convbuf);

  convbuf = nsMsgI18NEncodeMimePartIIStr(m_recipient.get(), PR_TRUE, charset.get(), 0, conformToStandard);
  tmpBuffer = PR_smprintf("To: %s" CRLF, convbuf ? convbuf : m_recipient.get());
  PUSH_N_FREE_STRING(tmpBuffer);
  PR_Free(convbuf);

  nsCString messageId;
  m_headers->ExtractHeader(HEADER_MESSAGE_ID, PR_FALSE, getter_Copies(messageId));
  if (!messageId.IsEmpty())
  {
    if (*messageId.get() == '<')
      tmpBuffer = PR_smprintf("References: %s" CRLF, messageId.get());
    else
      tmpBuffer = PR_smprintf("References: <%s>" CRLF, messageId.get());
    PUSH_N_FREE_STRING(tmpBuffer);
  }

  tmpBuffer = PR_smprintf("%s" CRLF, "MIME-Version: 1.0");
  PUSH_N_FREE_STRING(tmpBuffer);

  nsCOMPtr<nsIHttpProtocolHandler> pHTTPHandler = do_GetService(NS_NETWORK_PROTOCOL_CONTRACTID_PREFIX "http", &rv);
  if (NS_SUCCEEDED(rv) && pHTTPHandler)
  {
    nsCAutoString userAgentString;
    pHTTPHandler->GetUserAgent(userAgentString);

    if (!userAgentString.IsEmpty())
    {
      tmpBuffer = PR_smprintf("User-Agent: %s" CRLF, userAgentString.get());
      PUSH_N_FREE_STRING(tmpBuffer);
    }
  }

  return rv;
}

nsresult nsMsgSMIMEReceiptGenerator::WriteString(const char *aStr)
{
  NS_ENSURE_ARG(aStr);
  PRUint32 len = strlen(aStr);
  PRUint32 wLen = 0;

  return m_outputStream->Write(aStr, len, &wLen);
}

nsresult nsMsgSMIMEReceiptGenerator::SendMessage()
{
  nsresult rv;
  nsCOMPtr<nsISmtpService> smtpService = do_GetService(NS_SMTPSERVICE_CONTRACTID, &rv);
  NS_ENSURE_SUCCESS(rv,rv);

  nsCOMPtr<nsIRequest> aRequest;
  smtpService->SendMailMessage(m_file, m_recipient.get(), m_identity,
                               nsnull, this, nsnull, nsnull, PR_FALSE, nsnull,
                               getter_AddRefs(aRequest));

  return NS_OK;
}

nsresult nsMsgSMIMEReceiptGenerator::GetIdentity()
{
  nsresult rv = m_folder->GetServer(getter_AddRefs(m_server));
  nsCOMPtr<nsIMsgAccountManager> accountManager = do_GetService(NS_MSGACCOUNTMANAGER_CONTRACTID, &rv);
  if (accountManager && m_server)
  {
    if (!m_identity)
    {
      // check if this is a message delivered to the global inbox,
      // in which case we find the originating account's identity.
      nsCString accountKey;
      m_headers->ExtractHeader(HEADER_X_MOZILLA_ACCOUNT_KEY, PR_FALSE, getter_Copies(accountKey));
      nsCOMPtr <nsIMsgAccount> account;
      if (!accountKey.IsEmpty())
        accountManager->GetAccount(accountKey, getter_AddRefs(account));
      if (account)
        account->GetIncomingServer(getter_AddRefs(m_server));

      if (m_server)
      {
        // Find the correct identity based on the "To:" and "Cc:" header
        nsCString mailTo;
        nsCString mailCC;
        m_headers->ExtractHeader(HEADER_TO, PR_TRUE, getter_Copies(mailTo));
        m_headers->ExtractHeader(HEADER_CC, PR_TRUE, getter_Copies(mailCC));
        nsCOMPtr<nsISupportsArray> servIdentities;
        accountManager->GetIdentitiesForServer(m_server, getter_AddRefs(servIdentities));
        if (servIdentities)
        {
          nsCOMPtr<nsIMsgIdentity> ident;
          nsCString identEmail;
          PRUint32 count = 0;
          servIdentities->Count(&count);
          // First check in the "To:" header
          for (PRUint32 i = 0; i < count; i++)
          {
            rv = servIdentities->QueryElementAt(i, NS_GET_IID(nsIMsgIdentity),getter_AddRefs(ident));
            if (NS_FAILED(rv))
              continue;
            ident->GetEmail(identEmail);
            if (!mailTo.IsEmpty() && !identEmail.IsEmpty() && mailTo.Find(identEmail, PR_TRUE) != -1)
            {
              m_identity = ident;
              break;
            }
          }
          // If no match, check the "Cc:" header
          if (!m_identity)
          {
            for (PRUint32 i = 0; i < count; i++)
            {
              rv = servIdentities->QueryElementAt(i, NS_GET_IID(nsIMsgIdentity),getter_AddRefs(ident));
              if (NS_FAILED(rv))
                continue;
              ident->GetEmail(identEmail);
              if (!mailCC.IsEmpty() && !identEmail.IsEmpty() && mailCC.Find(identEmail, PR_TRUE) != -1)
              {
                m_identity = ident;
                break;
              }
            }
          }
        }

        // If no match again, use the first identity
        if (!m_identity)
          rv = accountManager->GetFirstIdentityForServer(m_server, getter_AddRefs(m_identity));
      }
    }
    NS_ENSURE_SUCCESS(rv, rv);
  }

  return NS_OK;
}

nsresult nsMsgSMIMEReceiptGenerator::StoreSMIMEReceiptSentFlag()
{
  nsresult rv;

  // Set a flag in local message database
  rv = m_msghdr->SetStringProperty(SMIME_RECEIPT_REQUEST_PROCESSED, "true");
  NS_ENSURE_SUCCESS(rv, rv);

  nsCOMPtr<nsIMsgImapMailFolder> imapFolder = do_QueryInterface(m_folder);
  if (!imapFolder)
    return NS_OK;

  // Set an IMAP flag if possible
  rv = imapFolder->StoreCustomKeywords(m_window, NS_LITERAL_CSTRING(SMIME_RECEIPT_REQUEST_PROCESSED), EmptyCString(), &m_key, 1, nsnull);

  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEReceiptGenerator::OnStartRunningUrl(nsIURI *aUrl)
{
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEReceiptGenerator::OnStopRunningUrl(nsIURI *aUrl, nsresult aExitCode)
{
  nsresult rv;

  if (m_file)
    m_file->Remove(PR_FALSE);

  if (NS_SUCCEEDED(aExitCode))
  {
    rv = StoreSMIMEReceiptSentFlag();
    NS_ENSURE_SUCCESS(rv, rv);

    return NS_OK;
  }

  switch (aExitCode)
  {
    case NS_ERROR_UNKNOWN_HOST:
    case NS_ERROR_UNKNOWN_PROXY_HOST:
      aExitCode = NS_ERROR_SMTP_SEND_FAILED_UNKNOWN_SERVER;
      break;
    case NS_ERROR_CONNECTION_REFUSED:
    case NS_ERROR_PROXY_CONNECTION_REFUSED:
      aExitCode = NS_ERROR_SMTP_SEND_FAILED_REFUSED;
      break;
    case NS_ERROR_NET_INTERRUPT:
      aExitCode = NS_ERROR_SMTP_SEND_FAILED_INTERRUPTED;
      break;
    case NS_ERROR_NET_TIMEOUT:
    case NS_ERROR_NET_RESET:
      aExitCode = NS_ERROR_SMTP_SEND_FAILED_TIMEOUT;
      break;
    case NS_ERROR_SMTP_PASSWORD_UNDEFINED:
      // nothing to do, just keep the code
      break;
    default:
      if (aExitCode != NS_ERROR_ABORT && !NS_IS_MSG_ERROR(aExitCode))
        aExitCode = NS_ERROR_SMTP_SEND_FAILED_UNKNOWN_REASON;
    break;
  }

  nsCOMPtr<nsISmtpService> smtpService(do_GetService(NS_SMTPSERVICE_CONTRACTID, &rv));
  NS_ENSURE_SUCCESS(rv,rv);

  // Get the smtp hostname and format the string.
  nsCString smtpHostName;
  nsCOMPtr<nsISmtpServer> smtpServer;
  rv = smtpService->GetSmtpServerByIdentity(m_identity, getter_AddRefs(smtpServer));
  if (NS_SUCCEEDED(rv))
    smtpServer->GetHostname(smtpHostName);

  nsAutoString hostStr;
  CopyASCIItoUTF16(smtpHostName, hostStr);
  const PRUnichar *params[] = { hostStr.get() };

  nsCOMPtr<nsIStringBundle> bundle;
  nsCOMPtr<nsIStringBundleService> bundleService(do_GetService("@mozilla.org/intl/stringbundle;1", &rv));
  NS_ENSURE_SUCCESS(rv, rv);

  rv = bundleService->CreateBundle("chrome://messenger/locale/messengercompose/composeMsgs.properties", getter_AddRefs(bundle));
  NS_ENSURE_SUCCESS(rv, rv);

  nsString failed_msg, dialogTitle;

  bundle->FormatStringFromID(NS_ERROR_GET_CODE(aExitCode), params, 1, getter_Copies(failed_msg));
  bundle->GetStringFromID(NS_MSG_SEND_ERROR_TITLE, getter_Copies(dialogTitle));

  nsCOMPtr<nsIPrompt> dialog;
  rv = m_window->GetPromptDialog(getter_AddRefs(dialog));
  if (NS_SUCCEEDED(rv))
    dialog->Alert(dialogTitle.get(),failed_msg.get());

  return NS_OK;
}
