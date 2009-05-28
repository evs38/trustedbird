/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
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
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
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

#include "nsMsgSignedReceiptRequestGenerator.h"
#include "nsCOMPtr.h"
#include "nsIPrompt.h"
#include "nsIStringBundle.h"
#include "nsMsgCompCID.h"
#include "nsMsgBaseCID.h"
#include "nsISmtpService.h"
#include "nsIRequest.h"
#include "nsImapCore.h"
#include "nsIMsgImapMailFolder.h"
#include "nsIMsgCompUtils.h"
#include "nsIMsgAccountManager.h"
#include "nsMsgI18N.h"
#include "nsMailHeaders.h"
#include "nsMimeTypes.h"
#include "nsSpecialSystemDirectory.h"
#include "nsMsgCompFields.h"
#include "nsMsgCompCID.h"
#include "nsMsgSMIMECID.h"
#include "prprf.h"
#include "prmem.h"

// String bundle for SignedReceipt.
#define SIGNEDRECEIPT_STRINGBUNDLE_URL "chrome://messenger-smime/locale/msgsignedreceipt.properties"

#define PUSH_N_FREE_STRING(p) \
  do { if (p) { rv = WriteString(p); PR_smprintf_free(p); p=0; \
           if (NS_FAILED(rv)) return rv; } \
     else { return NS_ERROR_OUT_OF_MEMORY; } } while (0)

#define PUSH_N_FREE_SIGNED_STRING(p) \
  do { if (p) { rv = WriteSignedString(p); PR_smprintf_free(p); p=0; \
           if (NS_FAILED(rv)) return rv; } \
     else { return NS_ERROR_OUT_OF_MEMORY; } } while (0)


NS_IMPL_ISUPPORTS2(nsMsgSignedReceiptRequestGenerator, nsIMsgSignedReceiptRequestGenerator, nsIUrlListener)

nsMsgSignedReceiptRequestGenerator::nsMsgSignedReceiptRequestGenerator()
{
    m_outputStream = nsnull;
}

nsMsgSignedReceiptRequestGenerator::~nsMsgSignedReceiptRequestGenerator()
{
}

NS_IMETHODIMP nsMsgSignedReceiptRequestGenerator::Process(
    nsIMsgWindow *aWindow,
    nsIMsgFolder *aFolder,
    nsMsgKey key,
    nsIMimeHeaders *headers,
    const char *aSignedContentIdentifier,
    const PRInt32 aReceiptsFrom,
    const char *aReceiptsTo)
{
    nsresult rv = NS_OK;

    m_folder = aFolder;
    m_headers = headers;
    m_to = aReceiptsTo;

    StoreMDNSentFlag(aFolder, key);

    rv = Init();
    if (NS_FAILED(rv))
        return rv;

    // If return address is self, don't send
    if (MailAddrMatch(m_from.get(), m_to.get()))
      return NS_OK;
 
    // If no signing certificate is defined, don't send
    nsXPIDLString signingCertName;
    m_identity->GetUnicharAttribute("signing_cert_name", getter_Copies(signingCertName));
    if (signingCertName.IsEmpty()) {
        AlertUnableToSendReceiptMsg(aWindow);
        return NS_OK;
    }

    PRBool shouldSendMessage;
    rv = PromptSendReceiptMsg(aWindow, &shouldSendMessage);
    if (NS_FAILED(rv))
      return rv;

    if (shouldSendMessage) {
      rv = CreateReceiptMsg();
      if (NS_FAILED(rv))
        return rv;
      rv = SendReceiptMsg();
    }
    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::Init()
{
    nsresult rv = NS_OK;

    rv = m_folder->GetServer(getter_AddRefs(m_server));
    nsCOMPtr<nsIMsgAccountManager> accountManager = do_GetService(NS_MSGACCOUNTMANAGER_CONTRACTID, &rv);

    if (accountManager && m_server)
    {
        if (!m_identity)
        {
          // check if this is a message delivered to the global inbox,
          // in which case we find the originating account's identity.
          nsXPIDLCString accountKey;
          rv = m_headers->ExtractHeader(HEADER_X_MOZILLA_ACCOUNT_KEY, PR_FALSE, getter_Copies(accountKey));

          nsCOMPtr <nsIMsgAccount> account;
          if (!accountKey.IsEmpty())
              rv = accountManager->GetAccount(accountKey, getter_AddRefs(account));

          if (account)
              rv = account->GetIncomingServer(getter_AddRefs(m_server));

          if (m_server)
              rv = accountManager->GetFirstIdentityForServer(m_server, getter_AddRefs(m_identity));
        }
    }
    if (NS_FAILED(rv))
        return rv;

    rv = m_folder->GetCharset(getter_Copies(m_charset));
    if (NS_FAILED(rv)) 
        return rv;

    if (m_identity)
    {
        rv = m_identity->GetEmail(getter_Copies(m_from));
    }

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::SendReceiptMsg()
{
    nsresult rv = NS_OK;
    nsCOMPtr<nsISmtpService> smtpService = do_GetService(NS_SMTPSERVICE_CONTRACTID, &rv);

    nsCOMPtr<nsIRequest> aRequest;
    rv = smtpService->SendMailMessage(m_fileSpec, m_to, m_identity, nsnull, this, nsnull, nsnull, PR_FALSE, 0, nsnull, getter_AddRefs(aRequest));

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::CreateReceiptMsg()
{
    nsresult rv = NS_OK;

    // Create Signed Message
    m_secureCompose = do_CreateInstance(NS_MSGCOMPOSESECURE_CONTRACTID, &rv);
    if (NS_FAILED(rv))
        return rv;

    // Create OutputStream
    nsSpecialSystemDirectory tmpFile(nsSpecialSystemDirectory::OS_TemporaryDirectory);
    tmpFile += "signedreceiptmsg";
    tmpFile.MakeUnique();

    rv = NS_NewFileSpecWithSpec(tmpFile, getter_AddRefs(m_fileSpec));
    if (NS_FAILED(rv))
        return NS_OK;

    rv = m_fileSpec->GetOutputStream(getter_AddRefs(m_outputStream));
    if (NS_FAILED(rv))
        return rv;

    // Write Message headers    
    CreateMsgHeader();

    // Begin crypto encapsulation

    // Init Compose fields
    nsCOMPtr<nsIMsgCompFields> mCompFields = do_CreateInstance(NS_MSGCOMPFIELDS_CONTRACTID, &rv);
    if (!mCompFields)
        return NS_ERROR_OUT_OF_MEMORY;

    nsCOMPtr<nsIMsgSMIMECompFields> mSMIMECompFields = do_CreateInstance(NS_MSGSMIMECOMPFIELDS_CONTRACTID, &rv);
    if (!mSMIMECompFields)
        return NS_ERROR_OUT_OF_MEMORY;

    mSMIMECompFields->SetSignMessage(PR_TRUE);   // Sign message
    mCompFields->SetSecurityInfo(mSMIMECompFields);

    // Begin crypto encapsulation
    nsOutputFileStream *aStream = new nsOutputFileStream(m_outputStream);
    rv = m_secureCompose->BeginCryptoEncapsulation(aStream, m_to.get(), mCompFields, m_identity, NULL, PR_FALSE);

    // Create Message content
    rv = CreateMsgContent();

    // End crypto encapsulation
    m_secureCompose->FinishCryptoEncapsulation(PR_FALSE, NULL);

    // Release OutputStream
    if (m_outputStream)
    {
        m_outputStream->Flush();
        m_outputStream->Close();
        delete aStream;
    }
    if (m_fileSpec)
        m_fileSpec->CloseStream();

    if (NS_FAILED(rv))
        m_fileSpec->Delete(PR_FALSE);

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::WriteString(const char *str)
{
  NS_ENSURE_ARG (str);
  PRUint32 len = strlen(str);
  PRUint32 wLen = 0;

  return m_outputStream->Write(str, len, &wLen);
}

nsresult nsMsgSignedReceiptRequestGenerator::WriteSignedString(const char *str)
{
  NS_ENSURE_ARG (str);
  return m_secureCompose->MimeCryptoWriteBlock(str, strlen(str));
}

nsresult nsMsgSignedReceiptRequestGenerator::CreateMsgHeader()
{
    nsresult rv = NS_OK;

    char *convbuf = nsnull, *tmpBuffer = nsnull;
    char *parm = nsnull;
    nsCOMPtr <nsIMsgCompUtils> compUtils;

    compUtils = do_GetService(NS_MSGCOMPUTILS_CONTRACTID, &rv);
    if (NS_FAILED(rv)) 
        return rv;

    tmpBuffer = (char *) PR_CALLOC(256);

    if (!tmpBuffer)
        return NS_ERROR_OUT_OF_MEMORY;

    // Time
    PRExplodedTime now;
    PR_ExplodeTime(PR_Now(), PR_LocalTimeParameters, &now);

    /* Use PR_FormatTimeUSEnglish() to format the date in US English format,
       then figure out what our local GMT offset is, and append it (since
       PR_FormatTimeUSEnglish() can't do that.) Generate four digit years as
       per RFC 1123 (superceding RFC 822.)
    */
    int gmtoffset = (now.tm_params.tp_gmt_offset + now.tm_params.tp_dst_offset) / 60;
    PR_FormatTimeUSEnglish(tmpBuffer, 100, "Date: %a, %d %b %Y %H:%M:%S ", &now);
    PR_snprintf(tmpBuffer + strlen(tmpBuffer), 100,
                "%c%02d%02d" CRLF,
                (gmtoffset >= 0 ? '+' : '-'),
                ((gmtoffset >= 0 ? gmtoffset : -gmtoffset) / 60),
                ((gmtoffset >= 0 ? gmtoffset : -gmtoffset) % 60));
    rv = WriteString(tmpBuffer);
    PR_Free(tmpBuffer);
    if (NS_FAILED(rv)) 
        return rv;

    // conformToStandard
    PRBool conformToStandard = PR_FALSE;
    if (compUtils)
        compUtils->GetMsgMimeConformToStandard(&conformToStandard);

    // From
    convbuf = nsMsgI18NEncodeMimePartIIStr(m_from.get(), PR_TRUE, m_charset.get(), 0, conformToStandard);
    parm = PR_smprintf("From: %s" CRLF, convbuf ? convbuf : m_from.get());
    PUSH_N_FREE_STRING(parm);
    PR_Free(convbuf);

    // Message-ID
    if (compUtils)
    {
        nsXPIDLCString msgId;
        rv = compUtils->MsgGenerateMessageId(m_identity, getter_Copies(msgId));
        tmpBuffer = PR_smprintf("Message-ID: %s" CRLF, msgId.get());
        PUSH_N_FREE_STRING(tmpBuffer);
    }

    // Subject
    nsXPIDLString receipt_string;
    rv = GetStringFromName(NS_LITERAL_STRING("SignedReceiptDisplayedReceipt").get(), getter_Copies(receipt_string));
    if (NS_FAILED(rv)) 
        return rv;
    receipt_string.Append(NS_LITERAL_STRING(" - "));
    char * encodedReceiptString = nsMsgI18NEncodeMimePartIIStr(NS_ConvertUCS2toUTF8(receipt_string).get(), PR_FALSE, "UTF-8", 0, conformToStandard);

    nsXPIDLCString subject;
    m_headers->ExtractHeader(HEADER_SUBJECT, PR_FALSE, getter_Copies(subject));
    convbuf = nsMsgI18NEncodeMimePartIIStr(subject.Length() ? subject.get() : "[no subject]", PR_FALSE, m_charset.get(), 0, conformToStandard);
    tmpBuffer = PR_smprintf("Subject: %s%s" CRLF, encodedReceiptString, (convbuf ? convbuf : (subject.Length() ? subject.get() : "[no subject]")));

    PUSH_N_FREE_STRING(tmpBuffer);
    PR_Free(convbuf);
    PR_Free(encodedReceiptString);

    // To
    convbuf = nsMsgI18NEncodeMimePartIIStr(m_to, PR_TRUE, m_charset.get(), 0, conformToStandard);
    tmpBuffer = PR_smprintf("To: %s" CRLF, convbuf ? convbuf : m_to.get());
    PUSH_N_FREE_STRING(tmpBuffer);
    PR_Free(convbuf);

    // References
    // *** This is not in the spec. I am adding this so we could do threading
    m_headers->ExtractHeader(HEADER_MESSAGE_ID, PR_FALSE, getter_Copies(m_messageId));

    if (!m_messageId.IsEmpty())
    {
      if (*m_messageId.get() == '<')
          tmpBuffer = PR_smprintf("References: %s" CRLF, m_messageId.get());
      else
          tmpBuffer = PR_smprintf("References: <%s>" CRLF, m_messageId.get());
      PUSH_N_FREE_STRING(tmpBuffer);
    }

    // MIME-Version
    tmpBuffer = PR_smprintf("%s" CRLF, "MIME-Version: 1.0");
    PUSH_N_FREE_STRING(tmpBuffer);

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::CreateMsgContent()
{
    nsresult rv = NS_OK;
    char *tmpBuffer = nsnull;

    // Content-Type
    tmpBuffer = PR_smprintf("Content-Type: text/plain; charset=UTF-8" CRLF);
    PUSH_N_FREE_SIGNED_STRING(tmpBuffer);

    // Content-Transfer-Encoding
    tmpBuffer = PR_smprintf("Content-Transfer-Encoding: %s" CRLF CRLF, ENCODING_8BIT);
    PUSH_N_FREE_SIGNED_STRING(tmpBuffer);

    // Body
    nsXPIDLString bodyPart1;
    rv = FormatStringFromName(NS_LITERAL_STRING("MsgSignedReceiptMsgSentTo").get(), NS_ConvertASCIItoUCS2(m_from).get(), getter_Copies(bodyPart1));
    if (NS_FAILED(rv))
        return rv;

    if (!bodyPart1.IsEmpty())
    {
        tmpBuffer = PR_smprintf("%s" CRLF CRLF, NS_ConvertUCS2toUTF8(bodyPart1).get());
        PUSH_N_FREE_SIGNED_STRING(tmpBuffer);
    }

    nsXPIDLString bodyPart2;
    rv = GetStringFromName(NS_LITERAL_STRING("MsgSignedReceiptDisplayed").get(), getter_Copies(bodyPart2));
    if (NS_FAILED(rv))
        return rv;

    if (!bodyPart2.IsEmpty())
    {
        tmpBuffer = PR_smprintf("%s" CRLF CRLF, NS_ConvertUCS2toUTF8(bodyPart2).get());
        PUSH_N_FREE_SIGNED_STRING(tmpBuffer);
    }

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::StoreMDNSentFlag(nsIMsgFolder *folder, nsMsgKey key)
{
    // Store the $MDNSent flag if the folder is an Imap Mail Folder
    // otherwise, do nothing.
    nsCOMPtr<nsIMsgImapMailFolder> imapFolder = do_QueryInterface(folder);
    if (!imapFolder)
      return NS_OK;

    nsMsgKeyArray keyArray;
    keyArray.Add(key);
    return imapFolder->StoreImapFlags(kImapMsgMDNSentFlag, PR_TRUE, keyArray.GetArray(), keyArray.GetSize(), nsnull);
}

void nsMsgSignedReceiptRequestGenerator::AlertUnableToSendReceiptMsg(nsIMsgWindow *aWindow) {
    nsresult rv;
    nsCOMPtr<nsIPrompt> dialog;

    rv = aWindow->GetPromptDialog(getter_AddRefs(dialog));
    if (NS_SUCCEEDED(rv))
    {
        nsXPIDLString unableToSend;
        rv = GetStringFromName(NS_LITERAL_STRING("MsgSignedReceiptUnableToSend").get(), getter_Copies(unableToSend));
        if (NS_SUCCEEDED(rv))
        {
            rv = dialog->Alert(nsnull, unableToSend);
        }
    }
}

nsresult nsMsgSignedReceiptRequestGenerator::PromptSendReceiptMsg(nsIMsgWindow *aWindow, PRBool *shouldSendMessage)
{
  nsresult rv;
  nsCOMPtr<nsIPrompt> dialog;
  rv = aWindow->GetPromptDialog(getter_AddRefs(dialog));

  if (NS_SUCCEEDED(rv)) {
    nsXPIDLString wishToSend;
    rv = GetStringFromName(NS_LITERAL_STRING("MsgSignedReceiptWishToSend").get(), getter_Copies(wishToSend));
    if (NS_SUCCEEDED(rv))
      rv = dialog->Confirm(nsnull, wishToSend, shouldSendMessage);
  }

  return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::GetStringFromName(const PRUnichar *aName, PRUnichar **aResultString)
{
    nsresult rv;

    nsCOMPtr<nsIStringBundleService> bundleService(nsGetServiceByContractIDWithError(NS_STRINGBUNDLE_CONTRACTID, &rv));
    NS_ENSURE_SUCCESS(rv, rv);

    nsCOMPtr <nsIStringBundle> bundle;
    rv = bundleService->CreateBundle(SIGNEDRECEIPT_STRINGBUNDLE_URL, getter_AddRefs(bundle));
    NS_ENSURE_SUCCESS(rv, rv);

    rv = bundle->GetStringFromName(aName, aResultString);
    NS_ENSURE_SUCCESS(rv, rv);

    return rv;
}

nsresult nsMsgSignedReceiptRequestGenerator::FormatStringFromName(const PRUnichar *aName, const PRUnichar *aString, PRUnichar **aResultString)
{
    nsresult rv;

    nsCOMPtr<nsIStringBundleService> bundleService(do_GetService(NS_STRINGBUNDLE_CONTRACTID, &rv));
    NS_ENSURE_SUCCESS(rv,rv);

    nsCOMPtr <nsIStringBundle> bundle;
    rv = bundleService->CreateBundle(SIGNEDRECEIPT_STRINGBUNDLE_URL, getter_AddRefs(bundle));
    NS_ENSURE_SUCCESS(rv,rv);

    const PRUnichar *formatStrings[1] = { aString };
    rv = bundle->FormatStringFromName(aName, formatStrings, 1, aResultString);
    NS_ENSURE_SUCCESS(rv,rv);
    return rv;
}

PRBool nsMsgSignedReceiptRequestGenerator::MailAddrMatch(const char *addr1, const char *addr2)
{
    // Comparing two email addresses returns true if matched; local/account
    // part comparison is case sensitive; domain part comparison is case
    // insensitive 
    PRBool isMatched = PR_TRUE;
    const char *atSign1 = nsnull, *atSign2 = nsnull;
    const char *lt = nsnull, *local1 = nsnull, *local2 = nsnull;
    const char *end1 = nsnull, *end2 = nsnull;

    if (!addr1 || !addr2)
        return PR_FALSE;

    lt = strchr(addr1, '<');
    local1 = !lt ? addr1 : lt+1;
    lt = strchr(addr2, '<');
    local2 = !lt ? addr2 : lt+1;
    end1 = strchr(local1, '>');
    if (!end1)
        end1 = addr1 + strlen(addr1);
    end2 = strchr(local2, '>');
    if (!end2)
        end2 = addr2 + strlen(addr2);
    atSign1 = strchr(local1, '@');
    atSign2 = strchr(local2, '@');
    if (!atSign1 || !atSign2 // ill formed addr spec
        || (atSign1 - local1) != (atSign2 - local2))
        isMatched = PR_FALSE;
    else if (strncmp(local1, local2, (atSign1-local1))) // case sensitive
        // compare for local part
        isMatched = PR_FALSE;
    else if ((end1 - atSign1) != (end2 - atSign2) ||
             PL_strncasecmp(atSign1, atSign2, (end1-atSign1))) // case
        // insensitive compare for domain part
        isMatched = PR_FALSE;
    return isMatched;
}

NS_IMETHODIMP nsMsgSignedReceiptRequestGenerator::OnStartRunningUrl(nsIURI *url)
{
    return NS_OK;
}

NS_IMETHODIMP nsMsgSignedReceiptRequestGenerator::OnStopRunningUrl(nsIURI *url, nsresult aExitCode)
{
    m_fileSpec->Delete(PR_FALSE);
    return NS_OK;
}
