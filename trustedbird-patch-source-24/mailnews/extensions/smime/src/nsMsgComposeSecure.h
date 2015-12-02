/* -*- Mode: idl; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Contributor(s):
 *   Copyright (c) 2011 CASSIDIAN - All rights reserved */  
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
#include "nsStringGlue.h"
#include "nsIOutputStream.h"
#include "nsAutoPtr.h"
#include "nsIMsgSMIMESecureHeader.h"

class nsIMsgCompFields;
namespace mozilla {
namespace mailnews {
class MimeEncoder;
}
}

class nsMsgSMIMEComposeFields : public nsIMsgSMIMECompFields
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMSGSMIMECOMPFIELDS

  nsMsgSMIMEComposeFields();
  virtual ~nsMsgSMIMEComposeFields();

private:
  bool mSignMessage;
  bool mAlwaysEncryptMessage;
  bool mSMIMEReceiptRequest;
  bool mSMIMEReceipt;
  unsigned char *mSMIMEReceiptSignedContentIdentifier;
  unsigned long mSMIMEReceiptSignedContentIdentifierLen;
  unsigned char *mSMIMEReceiptOriginatorSignatureValue;
  unsigned long mSMIMEReceiptOriginatorSignatureValueLen;
  unsigned char *mSMIMEReceiptOriginatorContentType;
  unsigned long mSMIMEReceiptOriginatorContentTypeLen;
  unsigned char *mSMIMEReceiptMsgSigDigest;
  unsigned long mSMIMEReceiptMsgSigDigestLen;
  nsCOMPtr<nsIMutableArray> m_secureHeaders;
  long mCanonAlgorithme;
  nsString mSecurityPolicyIdentifier;
  long mSecurityClassification;
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
  int mHeaderStatus;
  int mHeaderEncrypted;

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
  typedef mozilla::mailnews::MimeEncoder MimeEncoder;
  nsresult MimeInitMultipartSigned(bool aOuter, nsIMsgSendReport *sendReport);
  nsresult MimeInitEncryption(bool aSign, nsIMsgSendReport *sendReport);
  nsresult MimeFinishMultipartSigned (bool aOuter, nsIMsgSendReport *sendReport);
  nsresult MimeFinishSignedReceipt(nsIMsgSendReport *sendReport);
  nsresult MimeFinishEncryption (bool aSign, nsIMsgSendReport *sendReport);
  nsresult MimeCryptoHackCerts(const char *aRecipients, nsIMsgSendReport *sendReport, bool aEncrypt, bool aSign);
  bool InitializeSMIMEBundle();
  nsresult GetSMIMEBundleString(const PRUnichar *name,
				PRUnichar **outString);
  nsresult SMIMEBundleFormatStringFromName(const PRUnichar *name,
					   const PRUnichar **params,
					   uint32_t numParams,
					   PRUnichar **outString);
  nsresult ExtractEncryptionState(nsIMsgIdentity * aIdentity, nsIMsgCompFields * aComposeFields, bool * aSignMessage, bool * aEncrypt);
  nsresult ExtractSMIMEReceiptState(nsIMsgIdentity *aIdentity,
                                    nsIMsgCompFields *aComposeFields,
                                    bool *aSMIMEReceiptRequest,
                                    bool *aSMIMEReceipt,
                                    unsigned char **aSMIMEReceiptSignedContentIdentifier,
                                    uint32_t *aSMIMEReceiptSignedContentIdentifierLen,
                                    unsigned char **aSMIMEReceiptOriginatorSignatureValue,
                                    uint32_t *aSMIMEReceiptOriginatorSignatureValueLen,
                                    unsigned char **aSMIMEReceiptOriginatorContentType,
                                    uint32_t *aSMIMEReceiptOriginatorContentTypeLen,
                                    unsigned char **aSMIMEReceiptMsgSigDigest,
                                    uint32_t *aSMIMEReceiptMsgSigDigestLen);

  nsresult ExtractSecurityLabelState(nsIMsgCompFields *aComposeFields, bool *aHasSecuritylabel, nsAString& aSecurityPolicyIdentifier, int32_t *aSecurityClassification, nsAString& aPrivacyMark, nsAString& aSecurityCategories);

  nsresult ReadHeadersToSecure(nsIMsgIdentity * aIdentity,nsIMsgCompFields * aComposeFields);

  mimeDeliveryCryptoState mCryptoState;
  nsCOMPtr<nsIOutputStream> mStream;
  int16_t mHashType;
  nsCOMPtr<nsICryptoHash> mDataHash;
  nsAutoPtr<MimeEncoder> mSigEncoder;
  char *mMultipartSignedBoundary;
  nsString mSigningCertName;
  nsCOMPtr<nsIX509Cert> mSelfSigningCert;
  nsString mEncryptionCertName;
  nsCOMPtr<nsIX509Cert> mSelfEncryptionCert;
  nsCOMPtr<nsIMutableArray> mCerts;
  nsCOMPtr<nsICMSMessage> mEncryptionCinfo;
  nsCOMPtr<nsICMSEncoder> mEncryptionContext;
  nsCOMPtr<nsIStringBundle> mSMIMEBundle;

  nsAutoPtr<MimeEncoder> mCryptoEncoder;
  bool mIsDraft;

  enum {eBufferSize = 8192};
  char *mBuffer;
  uint32_t mBufferedBytes;

  bool mErrorAlreadyReported;
  void SetError(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string);
  void SetErrorWithParam(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string, const char *param);

  bool mSMIMEReceiptRequest;
  nsCString mSMIMEReceiptRequestSignedContentIdentifier;
  nsCString mSMIMEReceiptRequestReceiptsTo;

  bool mSMIMEReceipt;
  unsigned char *mSMIMEReceiptSignedContentIdentifier;
  uint32_t mSMIMEReceiptSignedContentIdentifierLen;
  unsigned char *mSMIMEReceiptOriginatorSignatureValue;
  uint32_t mSMIMEReceiptOriginatorSignatureValueLen;
  unsigned char *mSMIMEReceiptOriginatorContentType;
  uint32_t mSMIMEReceiptOriginatorContentTypeLen;
  unsigned char *mSMIMEReceiptMsgSigDigest;
  uint32_t mSMIMEReceiptMsgSigDigestLen;
  nsCOMPtr<nsIMutableArray> mSecureHeaders;
  int32_t mCanonAlgorithme;

  bool mHasSecuritylabel;
  nsString mSecurityPolicyIdentifier;
  int32_t mSecurityClassification;
  nsString mPrivacyMark;
  nsString mSecurityCategories;
};

#endif
