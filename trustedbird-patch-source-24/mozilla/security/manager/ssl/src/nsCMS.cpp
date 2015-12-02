/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Contributor(s):
 *   David Drinan <ddrinan@netscape.com>
 *   Kai Engert <kengert@redhat.com>
 *   ESS Signed Receipts: Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *   Secure headers : Copyright (c) 2011 CASSIDIAN - All rights reserved */

#include "nsISupports.h"
#include "nsCMS.h"
#include "CertVerifier.h"
#include "nsNSSHelper.h"
#include "nsNSSCertificate.h"
#include "smime.h"
#include "cms.h"
#include "nsICMSMessageErrors.h"
#include "nsIArray.h"
#include "nsIMutableArray.h"
#include "nsArrayUtils.h"
#include "nsCertVerificationThread.h"
#include "ScopedNSSTypes.h"
#include "nsIMsgSMIMESecureHeader.h"
#include "prlog.h"
#include "nsIServiceManager.h"

using namespace mozilla;
using namespace mozilla::psm;

#ifdef PR_LOGGING
extern PRLogModuleInfo* gPIPNSSLog;
#endif

using namespace mozilla;

static NS_DEFINE_CID(kNSSComponentCID, NS_NSSCOMPONENT_CID);

#define NS_SMIMESECUREHEADER_CONTRACTID "@mozilla.org/messenger-smime/smime-secure-header;1"

NS_IMPL_THREADSAFE_ISUPPORTS2(nsCMSMessage, nsICMSMessage, 
                                            nsICMSMessage2)

nsCMSMessage::nsCMSMessage()
{
  m_cmsMsg = nullptr;
  mHasReceiptRequest = PR_FALSE;
  mHasReceipt = PR_FALSE;
  mHasSecurityLabel = PR_FALSE;
}
nsCMSMessage::nsCMSMessage(NSSCMSMessage *aCMSMsg)
{
  m_cmsMsg = aCMSMsg;
  mHasReceiptRequest = PR_FALSE;
  mHasReceipt = PR_FALSE;
}

nsCMSMessage::~nsCMSMessage()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return;

  destructorSafeDestroyNSSReference();
  shutdown(calledFromObject);
}

void nsCMSMessage::virtualDestroyNSSReference()
{
  destructorSafeDestroyNSSReference();
}

void nsCMSMessage::destructorSafeDestroyNSSReference()
{
  if (isAlreadyShutDown())
    return;

  if (m_cmsMsg) {
    NSS_CMSMessage_Destroy(m_cmsMsg);
  }
}

NS_IMETHODIMP nsCMSMessage::VerifySignature()
{
  return CommonVerifySignature(nullptr, 0);
}

NSSCMSSignerInfo* nsCMSMessage::GetTopLevelSignerInfo()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return nullptr;

  if (!m_cmsMsg)
    return nullptr;

  if (!NSS_CMSMessage_IsSigned(m_cmsMsg))
    return nullptr;

  NSSCMSContentInfo *cinfo = NSS_CMSMessage_ContentLevel(m_cmsMsg, 0);
  if (!cinfo)
    return nullptr;

  NSSCMSSignedData *sigd = (NSSCMSSignedData*)NSS_CMSContentInfo_GetContent(cinfo);
  if (!sigd)
    return nullptr;

  PR_ASSERT(NSS_CMSSignedData_SignerInfoCount(sigd) > 0);
  return NSS_CMSSignedData_GetSignerInfo(sigd, 0);
}

NS_IMETHODIMP nsCMSMessage::GetSignerEmailAddress(char * * aEmail)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignerEmailAddress\n"));
  NS_ENSURE_ARG(aEmail);

  NSSCMSSignerInfo *si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;

  *aEmail = NSS_CMSSignerInfo_GetSignerEmailAddress(si);
  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetSignerCommonName(char ** aName)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignerCommonName\n"));
  NS_ENSURE_ARG(aName);

  NSSCMSSignerInfo *si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;

  *aName = NSS_CMSSignerInfo_GetSignerCommonName(si);
  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::ContentIsEncrypted(bool *isEncrypted)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::ContentIsEncrypted\n"));
  NS_ENSURE_ARG(isEncrypted);

  if (!m_cmsMsg)
    return NS_ERROR_FAILURE;

  *isEncrypted = NSS_CMSMessage_IsEncrypted(m_cmsMsg);

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::ContentIsSigned(bool *isSigned)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::ContentIsSigned\n"));
  NS_ENSURE_ARG(isSigned);

  if (!m_cmsMsg)
    return NS_ERROR_FAILURE;

  *isSigned = NSS_CMSMessage_IsSigned(m_cmsMsg);

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetSignerCert(nsIX509Cert **scert)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  NSSCMSSignerInfo *si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;

  if (si->cert) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignerCert got signer cert\n"));

    *scert = nsNSSCertificate::Create(si->cert);
    if (*scert) {
      (*scert)->AddRef();
    }
  }
  else {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignerCert no signer cert, do we have a cert list? %s\n",
      (si->certList ? "yes" : "no") ));

    *scert = nullptr;
  }
  
  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetEncryptionCert(nsIX509Cert **ecert)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

    return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP nsCMSMessage::SetReceiptRequest(const nsACString& aSignedContentIdentifier, const nsACString& aReceiptsTo)
{
  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::SetReceiptRequest\n"));

  mHasReceiptRequest = PR_TRUE;
  mReceiptRequestSignedContentIdentifier = aSignedContentIdentifier;
  mReceiptRequestReceiptsTo = aReceiptsTo;

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetReceiptRequest(bool *aHasReceiptRequest,
                                              const uint8_t **aSignedContentIdentifier,
                                              uint32_t *aSignedContentIdentifierLen,
                                              uint32_t *aReceiptsFrom,
                                              nsACString& aReceiptsTo,
                                              const uint8_t **aOriginatorSignatureValue,
                                              uint32_t *aOriginatorSignatureValueLen,
                                              const uint8_t **aOriginatorContentType,
                                              uint32_t *aOriginatorContentTypeLen,
                                              const uint8_t **aMsgSigDigest,
                                              uint32_t *aMsgSigDigestLen)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetReceiptRequest\n"));
  NS_ENSURE_ARG_POINTER(aHasReceiptRequest);
  NS_ENSURE_ARG_POINTER(aSignedContentIdentifier);
  NS_ENSURE_ARG_POINTER(aSignedContentIdentifierLen);
  NS_ENSURE_ARG_POINTER(aReceiptsFrom);
  NS_ENSURE_ARG_POINTER(aOriginatorSignatureValue);
  NS_ENSURE_ARG_POINTER(aOriginatorSignatureValueLen);
  NS_ENSURE_ARG_POINTER(aOriginatorContentType);
  NS_ENSURE_ARG_POINTER(aOriginatorContentTypeLen);
  NS_ENSURE_ARG_POINTER(aMsgSigDigest);
  NS_ENSURE_ARG_POINTER(aMsgSigDigestLen);

  NSSCMSSignerInfo *si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;


	PRBool hasRecReq = aHasReceiptRequest ? PR_TRUE : PR_FALSE;
  NSS_CMSSignerInfo_GetReceiptRequest(si,
                                      &hasRecReq,
                                      (unsigned char **) aSignedContentIdentifier,
                                      aSignedContentIdentifierLen,
                                      aReceiptsFrom,
                                      getter_Copies(aReceiptsTo),
                                      (unsigned char **) aOriginatorSignatureValue,
                                      aOriginatorSignatureValueLen,
                                      (unsigned char **) aOriginatorContentType,
                                      aOriginatorContentTypeLen,
                                      (unsigned char **) aMsgSigDigest,
                                      aMsgSigDigestLen);
  *aHasReceiptRequest = hasRecReq == PR_TRUE ? true:false;
  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::SetReceipt(uint8_t *aSignedContentIdentifier,
                                       uint32_t aSignedContentIdentifierLen,
                                       uint8_t *aOriginatorSignatureValue,
                                       uint32_t aOriginatorSignatureValueLen,
                                       uint8_t *aOriginatorContentType,
                                       uint32_t aOriginatorContentTypeLen,
                                       uint8_t *aMsgSigDigest,
                                       uint32_t aMsgSigDigestLen)
{
  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::SetReceipt\n"));

  mHasReceipt = PR_TRUE;
  mReceiptSignedContentIdentifier = aSignedContentIdentifier;
  mReceiptSignedContentIdentifierLen = aSignedContentIdentifierLen;
  mReceiptOriginatorSignatureValue = aOriginatorSignatureValue;
  mReceiptOriginatorSignatureValueLen = aOriginatorSignatureValueLen;
  mReceiptOriginatorContentType = aOriginatorContentType;
  mReceiptOriginatorContentTypeLen = aOriginatorContentTypeLen;
  mReceiptMsgSigDigest = aMsgSigDigest;
  mReceiptMsgSigDigestLen = aMsgSigDigestLen;

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::CreateReceipt(const uint8_t **encodedReceipt, uint32_t *encodedReceiptLen)
{
  SECItem receipt;
  SECItem digest;
  uint8_t *digestBuffer = NULL;
  uint32_t digestBufferLen;
  nsresult rv = NS_OK;
  NSSCMSContentInfo *cinfo;
  NSSCMSSignedData *sigd;

  if (m_cmsMsg == NULL)
    return NS_ERROR_FAILURE;

  /* Create and encode receipt object */
  if ( NSS_SMIMEUtil_CreateReceipt(m_cmsMsg->poolp,
                                        &receipt,
                                        &digestBuffer,
                                        &digestBufferLen,
                                        mReceiptSignedContentIdentifier,
                                        mReceiptSignedContentIdentifierLen,
                                        mReceiptOriginatorSignatureValue,
                                        mReceiptOriginatorSignatureValueLen,
                                        mReceiptOriginatorContentType,
                                        mReceiptOriginatorContentTypeLen) != SECSuccess) {
		rv = NS_ERROR_FAILURE;
		goto loser;
  }
  /* Get SignedData */
  cinfo = NSS_CMSMessage_GetContentInfo(m_cmsMsg);
  if (cinfo == NULL) {
    rv = NS_ERROR_FAILURE;
    goto loser;
  }
  sigd = (NSSCMSSignedData*)NSS_CMSContentInfo_GetContent(cinfo);
  if (sigd == NULL) {
    rv = NS_ERROR_FAILURE;
    goto loser;
  }

  digest.data = digestBuffer;
  digest.len = digestBufferLen;

  /* Set digest attribute */
  if (NSS_CMSSignedData_SetDigestValue(sigd, SEC_OID_SHA1, &digest) != SECSuccess) {
	rv = NS_ERROR_FAILURE;
	goto loser;
  } 

  *encodedReceipt = (uint8_t*)(receipt.data);
  *encodedReceiptLen = receipt.len;

loser:
  if (digestBuffer != NULL)
    PORT_Free(digestBuffer);

  return rv;
}

NS_IMETHODIMP nsCMSMessage::GetReceipt(bool *aHasReceipt,
                                       const uint8_t **aSignedContentIdentifier,
                                       uint32_t *aSignedContentIdentifierLen,
                                       const uint8_t **aOriginatorSignatureValue,
                                       uint32_t *aOriginatorSignatureValueLen,
                                       const uint8_t **aOriginatorContentType,
                                       uint32_t *aOriginatorContentTypeLen,
                                       const uint8_t **aMsgSigDigest,
                                       uint32_t *aMsgSigDigestLen)
{
  NSSCMSContentInfo *cinfo;
  NSSCMSSignedData *sigd;
  NSSCMSSignerInfo *si;
  SECItem *receipt;

  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetReceipt\n"));
  NS_ENSURE_ARG_POINTER(aHasReceipt);
  NS_ENSURE_ARG_POINTER(aSignedContentIdentifier);
  NS_ENSURE_ARG_POINTER(aSignedContentIdentifierLen);
  NS_ENSURE_ARG_POINTER(aOriginatorSignatureValue);
  NS_ENSURE_ARG_POINTER(aOriginatorSignatureValueLen);
  NS_ENSURE_ARG_POINTER(aOriginatorContentType);
  NS_ENSURE_ARG_POINTER(aOriginatorContentTypeLen);
  NS_ENSURE_ARG_POINTER(aMsgSigDigest);
  NS_ENSURE_ARG_POINTER(aMsgSigDigestLen);

  si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;

  if (!NSS_CMSSignerInfo_HasReceipt(si))
    return NS_OK;

  cinfo = NSS_CMSMessage_ContentLevel(m_cmsMsg, 0);
  if (!cinfo)
    return NS_OK;

  sigd = (NSSCMSSignedData*)NSS_CMSContentInfo_GetContent(cinfo);
  if (!sigd)
    return NS_OK;

  if (NSS_CMSContentInfo_GetContentTypeTag(&(sigd->contentInfo)) != SEC_OID_SMIME_RECEIPT)
    return NS_OK;

  receipt = (SECItem*)NSS_CMSContentInfo_GetContent(&(sigd->contentInfo));
  if (receipt == NULL)
    return NS_ERROR_FAILURE;

	// TODO uint8_t to PRUint8
  if (NSS_SMIMEUtil_GetReceipt(si->cmsg->poolp,
                               receipt,
                               (const unsigned char **) aSignedContentIdentifier,
                               aSignedContentIdentifierLen,
                               (const unsigned char **) aOriginatorSignatureValue,
                               aOriginatorSignatureValueLen,
                               (const unsigned char **) aOriginatorContentType,
                               aOriginatorContentTypeLen) != SECSuccess)
    return NS_ERROR_FAILURE;

  if (NSS_CMSSignerInfo_GetMsgSigDigest(si, (unsigned char **) aMsgSigDigest, aMsgSigDigestLen) != SECSuccess)
    return NS_ERROR_FAILURE;

  *aHasReceipt = PR_TRUE;

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::SetSecurityLabel(const nsACString& aSecurityPolicyIdentifier,
                                             int32_t aSecurityClassification,
                                             const nsACString& aPrivacyMark,
                                             const nsACString& aSecurityCategories)
{
  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::SetSecurityLabel\n"));

  mHasSecurityLabel = PR_TRUE;
  mSecurityPolicyIdentifier = aSecurityPolicyIdentifier;
  mSecurityClassification = aSecurityClassification;
  mPrivacyMark = aPrivacyMark;
  mSecurityCategories = aSecurityCategories;

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetSecurityLabel(bool *aHasSecurityLabel,
                                             nsACString& aSecurityPolicyIdentifier,
                                             int32_t *aSecurityClassification,
                                             nsACString& aPrivacyMark,
                                             nsACString& aSecurityCategories)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSecurityLabel\n"));
  NS_ENSURE_ARG_POINTER(aHasSecurityLabel);
  NS_ENSURE_ARG_POINTER(aSecurityClassification);

  NSSCMSSignerInfo *si = GetTopLevelSignerInfo();
  if (!si)
    return NS_ERROR_FAILURE;

  PRBool hasSecLabel = PR_FALSE; //  TCN useless aHasSecurityLabel ? PR_TRUE : PR_FALSE;
  NSS_CMSSignerInfo_GetSecurityLabel(si,
                                     &hasSecLabel,
                                     getter_Copies(aSecurityPolicyIdentifier),
                                     aSecurityClassification,
                                     getter_Copies(aPrivacyMark),
                                     getter_Copies(aSecurityCategories));
  *aHasSecurityLabel = hasSecLabel == PR_TRUE ? true:false;
  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::VerifyDetachedSignature(unsigned char* aDigestData, uint32_t aDigestDataLen)
{
  if (!aDigestData || !aDigestDataLen)
    return NS_ERROR_FAILURE;

  return CommonVerifySignature(aDigestData, aDigestDataLen);
}

nsresult nsCMSMessage::CommonVerifySignature(unsigned char* aDigestData, uint32_t aDigestDataLen)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature, content level count %d\n", NSS_CMSMessage_ContentLevelCount(m_cmsMsg)));
  NSSCMSContentInfo *cinfo = nullptr;
  NSSCMSSignedData *sigd = nullptr;
  NSSCMSSignerInfo *si;
  int32_t nsigners;
  RefPtr<CertVerifier> certVerifier;
  nsresult rv = NS_ERROR_FAILURE;

  if (!NSS_CMSMessage_IsSigned(m_cmsMsg)) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - not signed\n"));
    return NS_ERROR_CMS_VERIFY_NOT_SIGNED;
  } 

  cinfo = NSS_CMSMessage_ContentLevel(m_cmsMsg, 0);
  if (cinfo) {
    // I don't like this hard cast. We should check in some way, that we really have this type.
    sigd = (NSSCMSSignedData*)NSS_CMSContentInfo_GetContent(cinfo);
  }
  
  if (!sigd) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - no content info\n"));
    rv = NS_ERROR_CMS_VERIFY_NO_CONTENT_INFO;
    goto loser;
  }

  if (aDigestData && aDigestDataLen)
  {
    SECItem digest;
    digest.data = aDigestData;
    digest.len = aDigestDataLen;

    if (NSS_CMSSignedData_SetDigestValue(sigd, SEC_OID_SHA1, &digest)) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - bad digest\n"));
      rv = NS_ERROR_CMS_VERIFY_BAD_DIGEST;
      goto loser;
    }
  }

  // Import certs. Note that import failure is not a signature verification failure. //
  if (NSS_CMSSignedData_ImportCerts(sigd, CERT_GetDefaultCertDB(), certUsageEmailRecipient, true) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - can not import certs\n"));
  }

  nsigners = NSS_CMSSignedData_SignerInfoCount(sigd);
  PR_ASSERT(nsigners > 0);
  si = NSS_CMSSignedData_GetSignerInfo(sigd, 0);

  // See bug 324474. We want to make sure the signing cert is 
  // still valid at the current time.

  certVerifier = GetDefaultCertVerifier();
  NS_ENSURE_TRUE(certVerifier, NS_ERROR_UNEXPECTED);

  {
    SECStatus srv = certVerifier->VerifyCert(si->cert,
                                             certificateUsageEmailSigner,
                                             PR_Now(), nullptr /*XXX pinarg*/);
    if (srv != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG,
             ("nsCMSMessage::CommonVerifySignature - signing cert not trusted now\n"));
      rv = NS_ERROR_CMS_VERIFY_UNTRUSTED;
      goto loser;
    }
  }

  // We verify the first signer info,  only //
  if (NSS_CMSSignedData_VerifySignerInfo(sigd, 0, CERT_GetDefaultCertDB(), certUsageEmailSigner) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - unable to verify signature\n"));

    if (NSSCMSVS_SigningCertNotFound == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - signing cert not found\n"));
      rv = NS_ERROR_CMS_VERIFY_NOCERT;
    }
    else if(NSSCMSVS_SigningCertNotTrusted == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - signing cert not trusted at signing time\n"));
      rv = NS_ERROR_CMS_VERIFY_UNTRUSTED;
    }
    else if(NSSCMSVS_Unverified == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - can not verify\n"));
      rv = NS_ERROR_CMS_VERIFY_ERROR_UNVERIFIED;
    }
    else if(NSSCMSVS_ProcessingError == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - processing error\n"));
      rv = NS_ERROR_CMS_VERIFY_ERROR_PROCESSING;
    }
    else if(NSSCMSVS_BadSignature == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - bad signature\n"));
      rv = NS_ERROR_CMS_VERIFY_BAD_SIGNATURE;
    }
    else if(NSSCMSVS_DigestMismatch == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - digest mismatch\n"));
      rv = NS_ERROR_CMS_VERIFY_DIGEST_MISMATCH;
    }
    else if(NSSCMSVS_SignatureAlgorithmUnknown == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - algo unknown\n"));
      rv = NS_ERROR_CMS_VERIFY_UNKNOWN_ALGO;
    }
    else if(NSSCMSVS_SignatureAlgorithmUnsupported == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - algo not supported\n"));
      rv = NS_ERROR_CMS_VERIFY_UNSUPPORTED_ALGO;
    }
    else if(NSSCMSVS_MalformedSignature == si->verificationStatus) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - malformed signature\n"));
      rv = NS_ERROR_CMS_VERIFY_MALFORMED_SIGNATURE;
    }

    goto loser;
  }

  // Save the profile. Note that save import failure is not a signature verification failure. //
  if (NSS_SMIMESignerInfo_SaveSMIMEProfile(si) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - unable to save smime profile\n"));
  }

  rv = NS_OK;
loser:
  return rv;
}

NS_IMETHODIMP nsCMSMessage::AsyncVerifySignature(
                              nsISMimeVerificationListener *aListener)
{
  return CommonAsyncVerifySignature(aListener, nullptr, 0);
}

NS_IMETHODIMP nsCMSMessage::AsyncVerifyDetachedSignature(
                              nsISMimeVerificationListener *aListener,
                              unsigned char* aDigestData, uint32_t aDigestDataLen)
{
  if (!aDigestData || !aDigestDataLen)
    return NS_ERROR_FAILURE;

  return CommonAsyncVerifySignature(aListener, aDigestData, aDigestDataLen);
}

nsresult nsCMSMessage::CommonAsyncVerifySignature(nsISMimeVerificationListener *aListener,
                                                  unsigned char* aDigestData, uint32_t aDigestDataLen)
{
  nsSMimeVerificationJob *job = new nsSMimeVerificationJob;
  
  if (aDigestData)
  {
    job->digest_data = new unsigned char[aDigestDataLen];
    memcpy(job->digest_data, aDigestData, aDigestDataLen);
  }
  else
  {
    job->digest_data = nullptr;
  }
  
  job->digest_len = aDigestDataLen;
  job->mMessage = this;
  job->mListener = aListener;

  nsresult rv = nsCertVerificationThread::addJob(job);
  if (NS_FAILED(rv))
    delete job;

  return rv;
}

class nsZeroTerminatedCertArray : public nsNSSShutDownObject
{
public:
  nsZeroTerminatedCertArray()
  :mCerts(nullptr), mPoolp(nullptr), mSize(0)
  {
  }
  
  ~nsZeroTerminatedCertArray()
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return;

    destructorSafeDestroyNSSReference();
    shutdown(calledFromObject);
  }

  void virtualDestroyNSSReference()
  {
    destructorSafeDestroyNSSReference();
  }

  void destructorSafeDestroyNSSReference()
  {
    if (isAlreadyShutDown())
      return;

    if (mCerts)
    {
      for (uint32_t i=0; i < mSize; i++) {
        if (mCerts[i]) {
          CERT_DestroyCertificate(mCerts[i]);
        }
      }
    }

    if (mPoolp)
      PORT_FreeArena(mPoolp, false);
  }

  bool allocate(uint32_t count)
  {
    // only allow allocation once
    if (mPoolp)
      return false;
  
    mSize = count;

    if (!mSize)
      return false;
  
    mPoolp = PORT_NewArena(1024);
    if (!mPoolp)
      return false;

    mCerts = (CERTCertificate**)PORT_ArenaZAlloc(
      mPoolp, (count+1)*sizeof(CERTCertificate*));

    if (!mCerts)
      return false;

    // null array, including zero termination
    for (uint32_t i = 0; i < count+1; i++) {
      mCerts[i] = nullptr;
    }

    return true;
  }
  
  void set(uint32_t i, CERTCertificate *c)
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return;

    if (i >= mSize)
      return;
    
    if (mCerts[i]) {
      CERT_DestroyCertificate(mCerts[i]);
    }
    
    mCerts[i] = CERT_DupCertificate(c);
  }
  
  CERTCertificate *get(uint32_t i)
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return nullptr;

    if (i >= mSize)
      return nullptr;
    
    return CERT_DupCertificate(mCerts[i]);
  }

  CERTCertificate **getRawArray()
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return nullptr;

    return mCerts;
  }

private:
  CERTCertificate **mCerts;
  PLArenaPool *mPoolp;
  uint32_t mSize;
};

NS_IMETHODIMP nsCMSMessage::CreateEncrypted(nsIArray * aRecipientCerts)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted\n"));
  NSSCMSContentInfo *cinfo;
  NSSCMSEnvelopedData *envd;
  NSSCMSRecipientInfo *recipientInfo;
  nsZeroTerminatedCertArray recipientCerts;
  SECOidTag bulkAlgTag;
  int keySize;
  uint32_t i;
  nsCOMPtr<nsIX509Cert2> nssRecipientCert;
  nsresult rv = NS_ERROR_FAILURE;

  // Check the recipient certificates //
  uint32_t recipientCertCount;
  aRecipientCerts->GetLength(&recipientCertCount);
  PR_ASSERT(recipientCertCount > 0);

  if (!recipientCerts.allocate(recipientCertCount)) {
    goto loser;
  }

  for (i=0; i<recipientCertCount; i++) {
    nsCOMPtr<nsIX509Cert> x509cert = do_QueryElementAt(aRecipientCerts, i);

    nssRecipientCert = do_QueryInterface(x509cert);

    if (!nssRecipientCert)
      return NS_ERROR_FAILURE;

    ScopedCERTCertificate c(nssRecipientCert->GetCert());
    recipientCerts.set(i, c);
  }
  
  // Find a bulk key algorithm //
  if (NSS_SMIMEUtil_FindBulkAlgForRecipients(recipientCerts.getRawArray(), &bulkAlgTag,
                                            &keySize) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't find bulk alg for recipients\n"));
    rv = NS_ERROR_CMS_ENCRYPT_NO_BULK_ALG;
    goto loser;
  }

  m_cmsMsg = NSS_CMSMessage_Create(nullptr);
  if (!m_cmsMsg) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create new cms message\n"));
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto loser;
  }

  if ((envd = NSS_CMSEnvelopedData_Create(m_cmsMsg, bulkAlgTag, keySize)) == nullptr) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create enveloped data\n"));
    goto loser;
  }

  cinfo = NSS_CMSMessage_GetContentInfo(m_cmsMsg);
  if (NSS_CMSContentInfo_SetContent_EnvelopedData(m_cmsMsg, cinfo, envd) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create content enveloped data\n"));
    goto loser;
  }

  cinfo = NSS_CMSEnvelopedData_GetContentInfo(envd);
  if (NSS_CMSContentInfo_SetContent_Data(m_cmsMsg, cinfo, nullptr, false) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't set content data\n"));
    goto loser;
  }

  // Create and attach recipient information //
  for (i=0; i < recipientCertCount; i++) {
    ScopedCERTCertificate rc(recipientCerts.get(i));
    if ((recipientInfo = NSS_CMSRecipientInfo_Create(m_cmsMsg, rc)) == nullptr) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create recipient info\n"));
      goto loser;
    }
    if (NSS_CMSEnvelopedData_AddRecipient(envd, recipientInfo) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't add recipient info\n"));
      goto loser;
    }
  }

  return NS_OK;
loser:
  if (m_cmsMsg) {
    NSS_CMSMessage_Destroy(m_cmsMsg);
    m_cmsMsg = nullptr;
  }

  return rv;
}

NS_IMETHODIMP nsCMSMessage::CreateSigned(nsIX509Cert* aSigningCert, nsIX509Cert* aEncryptCert, unsigned char* aDigestData, uint32_t aDigestDataLen, nsIArray * secureHeaders, int32_t canonAlgo)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned\n"));
  NSSCMSContentInfo *cinfo;
  NSSCMSSignedData *sigd;
  NSSCMSSignerInfo *signerinfo;
  ScopedCERTCertificate scert;
  ScopedCERTCertificate ecert;
  nsCOMPtr<nsIX509Cert2> aSigningCert2 = do_QueryInterface(aSigningCert);
  nsresult rv = NS_ERROR_FAILURE;

  /* Get the certs */
  if (aSigningCert2) {
    scert = aSigningCert2->GetCert();
  }
  if (!scert) {
    return NS_ERROR_FAILURE;
  }

  if (aEncryptCert) {
    nsCOMPtr<nsIX509Cert2> aEncryptCert2 = do_QueryInterface(aEncryptCert);
    if (aEncryptCert2) {
      ecert = aEncryptCert2->GetCert();
    }
  }

  /*
   * create the message object
   */
  m_cmsMsg = NSS_CMSMessage_Create(nullptr); /* create a message on its own pool */
  if (!m_cmsMsg) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't create new message\n"));
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto loser;
  }

  /*
   * build chain of objects: message->signedData->data
   */
  if ((sigd = NSS_CMSSignedData_Create(m_cmsMsg)) == nullptr) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't create signed data\n"));
    goto loser;
  }
  cinfo = NSS_CMSMessage_GetContentInfo(m_cmsMsg);
  if (NSS_CMSContentInfo_SetContent_SignedData(m_cmsMsg, cinfo, sigd) 
          != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't set content signed data\n"));
    goto loser;
  }

  cinfo = NSS_CMSSignedData_GetContentInfo(sigd);

  if (mHasReceipt) {
    /* Set receipt content-type*/
    if (NSS_CMSContentInfo_SetContent(m_cmsMsg, cinfo, SEC_OID_SMIME_RECEIPT, nullptr)
            != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't set content receipt\n"));
      goto loser;
    }
  } else {
    /* we're always passing data in and detaching optionally */
  if (NSS_CMSContentInfo_SetContent_Data(m_cmsMsg, cinfo, nullptr, true) 
          != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't set content data\n"));
    goto loser;
    }
  }

  /* 
   * create & attach signer information
   */
  if ((signerinfo = NSS_CMSSignerInfo_Create(m_cmsMsg, scert, SEC_OID_SHA1)) 
          == nullptr) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't create signer info\n"));
    goto loser;
  }

  /* we want the cert chain included for this one */
  if (NSS_CMSSignerInfo_IncludeCerts(signerinfo, NSSCMSCM_CertChain, 
                                       certUsageEmailSigner) 
          != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't include signer cert chain\n"));
    goto loser;
  }

  if (NSS_CMSSignerInfo_AddSigningTime(signerinfo, PR_Now()) 
	      != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add signing time\n"));
    goto loser;
  }

  if (NSS_CMSSignerInfo_AddSMIMECaps(signerinfo) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add smime caps\n"));
    goto loser;
  }

 //Add Secure Headers
  if(secureHeaders!=NULL){

	uint32_t nbHeaders=0;
	SecHeaderField * headerFields= NULL;
	secureHeaders->GetLength(&nbHeaders);
	if(nbHeaders>0)
	{
		int32_t i=0;
		headerFields = (SecHeaderField *)PORT_Alloc(nbHeaders * sizeof(SecHeaderField));
		//init to null
		for(i=0;i<nbHeaders;++i){
			headerFields[i].headerName = NULL;
			headerFields[i].headerValue = NULL;
		}

		for(i=0;i<nbHeaders;++i){

				nsCOMPtr<nsIMsgSMIMESecureHeader> _secureHeader= do_QueryElementAt(secureHeaders,i);
			if (_secureHeader){
				nsAutoString _headerName;
				nsAutoString _headerValue;
				_secureHeader->GetHeaderStatus(&headerFields[i].headerStatus);
				//_secureHeader->GetHeaderEncrypted(&headerFields[i].headerEncrypted);
				_secureHeader->GetHeaderName(_headerName);
				_secureHeader->GetHeaderValue(_headerValue);
				if(_headerName.Length()>0){
					/*headerFields[i].headerName = (char *)PORT_Alloc((_headerName.Length()+1) * sizeof (char));
					PORT_Memcpy (headerFields[i].headerName,(char *)(NS_ConvertUTF16toUTF8(_headerName).get()),_headerName.Length());
					headerFields[i].headerName[_headerName.Length()]='\0';*/
					nsAutoCString hdrNameUTF8 = NS_ConvertUTF16toUTF8(_headerName);
					headerFields[i].headerName = (char *)PORT_Alloc((hdrNameUTF8.Length()+1) * sizeof (char));
					PORT_Memcpy (headerFields[i].headerName,(char *)hdrNameUTF8.get(),hdrNameUTF8.Length());
					headerFields[i].headerName[hdrNameUTF8.Length()]='\0';

				}
				if(_headerValue.Length()>0){
					/*headerFields[i].headerValue = (char *)PORT_Alloc((_headerValue.Length()+1) * sizeof (char));
					PORT_Memcpy (headerFields[i].headerValue,(char *)(NS_ConvertUTF16toUTF8(_headerValue).get()),_headerValue.Length());
					headerFields[i].headerValue[_headerValue.Length()]='\0';*/
					nsAutoCString hdrValueUTF8 = NS_ConvertUTF16toUTF8(_headerValue);
					headerFields[i].headerValue = (char *)PORT_Alloc((hdrValueUTF8.Length()+1) * sizeof (char));
					PORT_Memcpy (headerFields[i].headerValue,(char *)hdrValueUTF8.get(),hdrValueUTF8.Length());
					headerFields[i].headerValue[hdrValueUTF8.Length()]='\0';
				}

			}
		}

		if (NSS_CMSSignerInfo_AddSecureHeader(signerinfo, headerFields,nbHeaders,canonAlgo) != SECSuccess) {
			PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add Secure Headers\n"));
			//free memory
			for(i=0;i<nbHeaders;++i)
			{
				if(headerFields[i].headerName!=NULL)
					PORT_Free((char *)(headerFields[i].headerName));
				if(headerFields[i].headerValue!=NULL)
					PORT_Free((char *)(headerFields[i].headerValue));
			}
			PORT_Free((SecHeaderField *)headerFields);
			//free memory
			goto loser;
		}
		//free memory
		for(i=0;i<nbHeaders;++i)
		{
			if(headerFields[i].headerName!=NULL)
				PORT_Free((char *)(headerFields[i].headerName));
			if(headerFields[i].headerValue!=NULL)
				PORT_Free((char *)(headerFields[i].headerValue));
		}
		PORT_Free((SecHeaderField *)headerFields);
		//free memory
	}
  }
  /* Add receipt request */
  if (mHasReceiptRequest) {
    if (NSS_CMSSignerInfo_AddReceiptRequest(signerinfo,
                                            (char*)(mReceiptRequestSignedContentIdentifier.get()),
                                            (char*)(mReceiptRequestReceiptsTo.get())) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add receipt request\n"));
      goto loser;
    }
  }

  /* Add msgSigDigest attribute for a receipt */
  if (mHasReceipt) {
    if (NSS_CMSSignerInfo_AddMsgSigDigest(signerinfo, mReceiptMsgSigDigest, mReceiptMsgSigDigestLen) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add msgSigDigest attribute\n"));
      goto loser;
    }
  }

  /* Add Security Label */
  if (mHasSecurityLabel) {
    if (NSS_CMSSignerInfo_AddSecurityLabel(signerinfo,
                                           (char*)(mSecurityPolicyIdentifier.get()),
                                           mSecurityClassification,
                                           (char*)(mPrivacyMark.get()),
                                           (char*)(mSecurityCategories.get())) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add security label\n"));
      goto loser;
    }
  }

  if (ecert) {
    if (NSS_CMSSignerInfo_AddSMIMEEncKeyPrefs(signerinfo, ecert, 
	                                    CERT_GetDefaultCertDB())
	  != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add smime enc key prefs\n"));
      goto loser;
    }

    if (NSS_CMSSignerInfo_AddMSSMIMEEncKeyPrefs(signerinfo, ecert, 
	                                    CERT_GetDefaultCertDB())
	  != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add MS smime enc key prefs\n"));
      goto loser;
    }

    // If signing and encryption cert are identical, don't add it twice.
    bool addEncryptionCert =
      (ecert && (!scert || !CERT_CompareCerts(ecert, scert)));

    if (addEncryptionCert &&
        NSS_CMSSignedData_AddCertificate(sigd, ecert) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add own encryption certificate\n"));
      goto loser;
    }
  }

  if (NSS_CMSSignedData_AddSignerInfo(sigd, signerinfo) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add signer info\n"));
    goto loser;
  }

  // Finally, add the pre-computed digest if passed in
  if (aDigestData) {
    SECItem digest;

    digest.data = aDigestData;
    digest.len = aDigestDataLen;

    if (NSS_CMSSignedData_SetDigestValue(sigd, SEC_OID_SHA1, &digest)) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't set digest value\n"));
      goto loser;
    }
  }

  return NS_OK;
loser:
  if (m_cmsMsg) {
    NSS_CMSMessage_Destroy(m_cmsMsg);
    m_cmsMsg = nullptr;
  }
  return rv;
}

NS_IMETHODIMP nsCMSMessage::GetSecureHeader( nsIMutableArray ** _secureHeaders, int32_t * canonAlgo){
  NS_ENSURE_ARG_POINTER(_secureHeaders);

  nsresult rv;
  nsCOMPtr<nsIMutableArray> tmpSecureHeaders = do_CreateInstance(NS_ARRAY_CONTRACTID, &rv);
  if(NS_SUCCEEDED(rv)){
    NSSCMSSecureHeader secureHeaders;
    int i=0;
    int secureHeaderItem=0;
    int ca_len = 0;

    NSSCMSSignerInfo *signerinfo = GetTopLevelSignerInfo();
    if (!signerinfo) return NS_ERROR_FAILURE;
    if(NSS_CMSSignerInfo_GetSecureHeader(signerinfo,&secureHeaders)==SECSuccess)
    {
	  for(secureHeaderItem=0;secureHeaderItem<2;++secureHeaderItem){
        if(secureHeaders.element[secureHeaderItem]!=NULL){
          switch(secureHeaders.element[secureHeaderItem]->selector){
          case NSSCMSSecureHeaderElement_canonAlgorithm :
            ca_len=secureHeaders.element[secureHeaderItem]->id.canonAlgorithm.len;
            *canonAlgo=0;			
    		if((ca_len>0) &&(secureHeaders.element[secureHeaderItem]->id.canonAlgorithm.data!=NULL))
            {			  
			  if(ca_len == 4){
				/* canonAlgorithm is encoded with 4 octets  */
				if((secureHeaders.element[secureHeaderItem]->id.canonAlgorithm.data[3] & 0x1) == 1){
					*canonAlgo=1;					
				}
			  }else{
				if(ca_len == 1){
					/* canonAlgorithm is encoded with 1 octet */
					if((secureHeaders.element[secureHeaderItem]->id.canonAlgorithm.data[0] & 0x1) == 1){
						*canonAlgo=1;
					}
				}
			  }
            }
            break;
          case NSSCMSSecureHeaderElement_secHeaderField :
            for(i=0;secureHeaders.element[secureHeaderItem]->id.secHeaderFields[i]!=NULL;++i)
            {
              nsAutoString headerValue;
              nsAutoString headerName;
              int32_t headerStatus=0;
              //int32_t headerEncrypted=0;
              NSSCMSSecHeaderFieldElement * secHeaderElement = NULL;
              secHeaderElement=secureHeaders.element[secureHeaderItem]->id.secHeaderFields[i];
              if(secHeaderElement!=NULL){
                int hn_len=secHeaderElement->HeaderFieldName.len;
                if(hn_len>0){
                  char * tmp_name=(char *) PORT_Alloc((hn_len+1) * sizeof(char));
                  PORT_Memcpy(tmp_name,secHeaderElement->HeaderFieldName.data,hn_len);
                  tmp_name[hn_len]='\0';
                  headerName.Assign(NS_ConvertUTF8toUTF16(tmp_name));
                  PORT_Free((char *)tmp_name);
                }
                int hv_len=secHeaderElement->HeaderFieldValue.len;
                if(hv_len>0){
                  char * tmp_value=(char *) PORT_Alloc((hv_len+1) * sizeof(char));
                  PORT_Memcpy(tmp_value,secHeaderElement->HeaderFieldValue.data,hv_len);
                  tmp_value[hv_len]='\0';
                  headerValue.Assign(NS_ConvertUTF8toUTF16(tmp_value));
                  PORT_Free((char *)tmp_value);
                }
                int hs_len=secHeaderElement->HeaderFieldStatus.len;
                if((hs_len>0) && (secHeaderElement->HeaderFieldStatus.data!=NULL)){
                  PORT_Memcpy(&headerStatus,secHeaderElement->HeaderFieldStatus.data,1);
                }
                else{
                  headerStatus = -1;
                }

                /*int he_len=secHeaderElement->HeaderFieldEncrypted.len;
                if((he_len>0) && (secHeaderElement->HeaderFieldEncrypted.data!=NULL)){
                PORT_Memcpy(&headerEncrypted,secHeaderElement->HeaderFieldEncrypted.data,1);
                }
                else{
                headerEncrypted = -1;
                }*/

                nsCOMPtr<nsIMsgSMIMESecureHeader> secureHeader = do_CreateInstance(NS_SMIMESECUREHEADER_CONTRACTID,&rv);
                if(NS_SUCCEEDED(rv))
                {
					secureHeader->SetHeaderName(headerName);
					secureHeader->SetHeaderValue(headerValue);
					secureHeader->SetHeaderStatus(headerStatus);
					//secureHeader->SetHeaderEncrypted(headerEncrypted);
					tmpSecureHeaders->AppendElement(secureHeader,PR_FALSE);
                }
              }
            }
            break;
          }
        }
      }
    }
  }
  NS_ADDREF(*_secureHeaders = tmpSecureHeaders);

  return NS_OK;
}

NS_IMPL_THREADSAFE_ISUPPORTS1(nsCMSDecoder, nsICMSDecoder)

nsCMSDecoder::nsCMSDecoder()
: m_dcx(nullptr)
{
}

nsCMSDecoder::~nsCMSDecoder()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return;

  destructorSafeDestroyNSSReference();
  shutdown(calledFromObject);
}

void nsCMSDecoder::virtualDestroyNSSReference()
{
  destructorSafeDestroyNSSReference();
}

void nsCMSDecoder::destructorSafeDestroyNSSReference()
{
  if (isAlreadyShutDown())
    return;

  if (m_dcx) {
    NSS_CMSDecoder_Cancel(m_dcx);
    m_dcx = nullptr;
  }
}

/* void start (in NSSCMSContentCallback cb, in voidPtr arg); */
NS_IMETHODIMP nsCMSDecoder::Start(NSSCMSContentCallback cb, void * arg)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSDecoder::Start\n"));
  m_ctx = new PipUIContext();

  m_dcx = NSS_CMSDecoder_Start(0, cb, arg, 0, m_ctx, 0, 0);
  if (!m_dcx) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSDecoder::Start - can't start decoder\n"));
    return NS_ERROR_FAILURE;
  }
  return NS_OK;
}

/* void update (in string bug, in long len); */
NS_IMETHODIMP nsCMSDecoder::Update(const char *buf, int32_t len)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSDecoder::Update\n"));
  NSS_CMSDecoder_Update(m_dcx, (char *)buf, len);
  return NS_OK;
}

/* void finish (); */
NS_IMETHODIMP nsCMSDecoder::Finish(nsICMSMessage ** aCMSMsg)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSDecoder::Finish\n"));
  NSSCMSMessage *cmsMsg;
  cmsMsg = NSS_CMSDecoder_Finish(m_dcx);
  m_dcx = nullptr;
  if (cmsMsg) {
    nsCMSMessage *obj = new nsCMSMessage(cmsMsg);
    // The NSS object cmsMsg still carries a reference to the context
    // we gave it on construction.
    // Make sure the context will live long enough.
    obj->referenceContext(m_ctx);
    *aCMSMsg = obj;
    NS_ADDREF(*aCMSMsg);
  }
  return NS_OK;
}

NS_IMPL_THREADSAFE_ISUPPORTS1(nsCMSEncoder, nsICMSEncoder)

nsCMSEncoder::nsCMSEncoder()
: m_ecx(nullptr)
{
}

nsCMSEncoder::~nsCMSEncoder()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return;

  destructorSafeDestroyNSSReference();
  shutdown(calledFromObject);
}

void nsCMSEncoder::virtualDestroyNSSReference()
{
  destructorSafeDestroyNSSReference();
}

void nsCMSEncoder::destructorSafeDestroyNSSReference()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return;

  if (m_ecx)
    NSS_CMSEncoder_Cancel(m_ecx);
}

/* void start (); */
NS_IMETHODIMP nsCMSEncoder::Start(nsICMSMessage *aMsg, NSSCMSContentCallback cb, void * arg)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Start\n"));
  nsCMSMessage *cmsMsg = static_cast<nsCMSMessage*>(aMsg);
  m_ctx = new PipUIContext();

  m_ecx = NSS_CMSEncoder_Start(cmsMsg->getCMS(), cb, arg, 0, 0, 0, m_ctx, 0, 0, 0, 0);
  if (!m_ecx) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Start - can't start encoder\n"));
    return NS_ERROR_FAILURE;
  }
  return NS_OK;
}

/* void update (in string aBuf, in long aLen); */
NS_IMETHODIMP nsCMSEncoder::Update(const char *aBuf, int32_t aLen)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Update\n"));
  if (!m_ecx || NSS_CMSEncoder_Update(m_ecx, aBuf, aLen) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Update - can't update encoder\n"));
    return NS_ERROR_FAILURE;
  }
  return NS_OK;
}

/* void finish (); */
NS_IMETHODIMP nsCMSEncoder::Finish()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  nsresult rv = NS_OK;
  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Finish\n"));
  if (!m_ecx || NSS_CMSEncoder_Finish(m_ecx) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Finish - can't finish encoder\n"));
    rv = NS_ERROR_FAILURE;
  }
  m_ecx = nullptr;
  return rv;
}

/* void encode (in nsICMSMessage aMsg); */
NS_IMETHODIMP nsCMSEncoder::Encode(nsICMSMessage *aMsg)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Encode\n"));
  return NS_ERROR_NOT_IMPLEMENTED;
}
