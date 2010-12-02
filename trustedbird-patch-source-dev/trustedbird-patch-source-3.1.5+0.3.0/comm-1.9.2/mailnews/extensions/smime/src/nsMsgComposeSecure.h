/* -*- Mode: idl; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Copyright (c) 2010 CASSIDIAN - All rights reserved
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
#ifndef _nsMsgComposeSecure_H_
#define _nsMsgComposeSecure_H_

#include "nsIMsgComposeSecure.h"
#include "nsIMsgSMIMECompFields.h"
#include "nsCOMPtr.h"
#include "nsICMSEncoder.h"
#include "nsIX509Cert.h"
#include "nsIMimeConverter.h"
#include "nsIStringBundle.h"
#include "nsICryptoHash.h"
#include "nsICMSMessage.h"
#include "nsIMutableArray.h"
#include "nsString.h"
#include "nsIOutputStream.h"

#include "nsIMsgSMIMESecureHeader.h"

class nsIMsgCompFields;

class nsMsgSMIMEComposeFields : public nsIMsgSMIMECompFields
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMSGSMIMECOMPFIELDS

  nsMsgSMIMEComposeFields();
  virtual ~nsMsgSMIMEComposeFields();

private:
  PRBool mSignMessage;
  PRBool mAlwaysEncryptMessage;
  PRBool mSMIMEReceiptRequest;
  PRBool mSMIMEReceipt;
  PRUint8 *mSMIMEReceiptSignedContentIdentifier;
  PRUint32 mSMIMEReceiptSignedContentIdentifierLen;
  PRUint8 *mSMIMEReceiptOriginatorSignatureValue;
  PRUint32 mSMIMEReceiptOriginatorSignatureValueLen;
  PRUint8 *mSMIMEReceiptOriginatorContentType;
  PRUint32 mSMIMEReceiptOriginatorContentTypeLen;
  PRUint8 *mSMIMEReceiptMsgSigDigest;
  PRUint32 mSMIMEReceiptMsgSigDigestLen;
  nsCOMPtr<nsIMutableArray> m_secureHeaders;
  PRInt32 mCanonAlgorithme;
  nsString mSecurityPolicyIdentifier;
  PRInt32 mSecurityClassification;
  nsString mPrivacyMark;
  nsString mSecurityCategories;
};

class nsMsgSMIMESecureHeader : public nsIMsgSMIMESecureHeader
{

public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMSGSMIMESECUREHEADER

  nsMsgSMIMESecureHeader();
  virtual ~nsMsgSMIMESecureHeader();

private:
  nsString mHeaderName;
  nsString mHeaderValue;
  PRInt32 mHeaderStatus;
  PRInt32 mHeaderEncrypted;

};
typedef enum {
  mime_crypto_none,				/* normal unencapsulated MIME message */
  mime_crypto_clear_signed,		/* multipart/signed encapsulation */
  mime_crypto_opaque_signed,	/* application/x-pkcs7-mime (signedData) */
  mime_crypto_encrypted,		/* application/x-pkcs7-mime */
  mime_crypto_signed_encrypted,	/* application/x-pkcs7-mime */
  mime_crypto_signed_receipt /* application/x-pkcs7-mime with smime-type=signed-receipt */
} mimeDeliveryCryptoState;

class nsMsgComposeSecure : public nsIMsgComposeSecure
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMSGCOMPOSESECURE

  nsMsgComposeSecure();
  virtual ~nsMsgComposeSecure();
  /* additional members */
  void GetOutputStream(nsIOutputStream **stream) { NS_IF_ADDREF(*stream = mStream);}
private:
  nsresult MimeInitMultipartSigned(PRBool aOuter, nsIMsgSendReport *sendReport);
  nsresult MimeInitEncryption(PRBool aSign, nsIMsgSendReport *sendReport);
  nsresult MimeFinishMultipartSigned (PRBool aOuter, nsIMsgSendReport *sendReport);
  nsresult MimeFinishSignedReceipt(nsIMsgSendReport *sendReport);
  nsresult MimeFinishEncryption (PRBool aSign, nsIMsgSendReport *sendReport);
  nsresult MimeCryptoHackCerts(const char *aRecipients, nsIMsgSendReport *sendReport, PRBool aEncrypt, PRBool aSign);
  PRBool InitializeSMIMEBundle();
  nsresult GetSMIMEBundleString(const PRUnichar *name,
				PRUnichar **outString);
  nsresult SMIMEBundleFormatStringFromName(const PRUnichar *name,
					   const PRUnichar **params,
					   PRUint32 numParams,
					   PRUnichar **outString);
  nsresult ExtractEncryptionState(nsIMsgIdentity * aIdentity, nsIMsgCompFields * aComposeFields, PRBool * aSignMessage, PRBool * aEncrypt);
  nsresult ExtractSMIMEReceiptState(nsIMsgIdentity *aIdentity,
                                    nsIMsgCompFields *aComposeFields,
                                    PRBool *aSMIMEReceiptRequest,
                                    PRBool *aSMIMEReceipt,
                                    PRUint8 **aSMIMEReceiptSignedContentIdentifier,
                                    PRUint32 *aSMIMEReceiptSignedContentIdentifierLen,
                                    PRUint8 **aSMIMEReceiptOriginatorSignatureValue,
                                    PRUint32 *aSMIMEReceiptOriginatorSignatureValueLen,
                                    PRUint8 **aSMIMEReceiptOriginatorContentType,
                                    PRUint32 *aSMIMEReceiptOriginatorContentTypeLen,
                                    PRUint8 **aSMIMEReceiptMsgSigDigest,
                                    PRUint32 *aSMIMEReceiptMsgSigDigestLen);

  nsresult ExtractSecurityLabelState(nsIMsgCompFields *aComposeFields, PRBool *aHasSecuritylabel, nsAString& aSecurityPolicyIdentifier, PRInt32 *aSecurityClassification, nsAString& aPrivacyMark, nsAString& aSecurityCategories);

  nsresult ReadHeadersToSecure(nsIMsgIdentity * aIdentity,nsIMsgCompFields * aComposeFields);

  mimeDeliveryCryptoState mCryptoState;
  nsCOMPtr<nsIOutputStream> mStream;
  PRInt16 mHashType;
  nsCOMPtr<nsICryptoHash> mDataHash;
  MimeEncoderData *mSigEncoderData;
  char *mMultipartSignedBoundary;
  nsString mSigningCertName;
  nsCOMPtr<nsIX509Cert> mSelfSigningCert;
  nsString mEncryptionCertName;
  nsCOMPtr<nsIX509Cert> mSelfEncryptionCert;
  nsCOMPtr<nsIMutableArray> mCerts;
  nsCOMPtr<nsICMSMessage> mEncryptionCinfo;
  nsCOMPtr<nsICMSEncoder> mEncryptionContext;
  nsCOMPtr<nsIStringBundle> mSMIMEBundle;

  MimeEncoderData *mCryptoEncoderData;
  PRBool mIsDraft;

  enum {eBufferSize = 8192};
  char *mBuffer;
  PRUint32 mBufferedBytes;

  PRBool mErrorAlreadyReported;
  void SetError(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string);
  void SetErrorWithParam(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string, const char *param);

  PRBool mSMIMEReceiptRequest;
  nsCString mSMIMEReceiptRequestSignedContentIdentifier;
  nsCString mSMIMEReceiptRequestReceiptsTo;

  PRBool mSMIMEReceipt;
  PRUint8 *mSMIMEReceiptSignedContentIdentifier;
  PRUint32 mSMIMEReceiptSignedContentIdentifierLen;
  PRUint8 *mSMIMEReceiptOriginatorSignatureValue;
  PRUint32 mSMIMEReceiptOriginatorSignatureValueLen;
  PRUint8 *mSMIMEReceiptOriginatorContentType;
  PRUint32 mSMIMEReceiptOriginatorContentTypeLen;
  PRUint8 *mSMIMEReceiptMsgSigDigest;
  PRUint32 mSMIMEReceiptMsgSigDigestLen;
  nsCOMPtr<nsIMutableArray> mSecureHeaders;
  PRInt32 mCanonAlgorithme;

  PRBool mHasSecuritylabel;
  nsString mSecurityPolicyIdentifier;
  PRInt32 mSecurityClassification;
  nsString mPrivacyMark;
  nsString mSecurityCategories;
};

#endif
