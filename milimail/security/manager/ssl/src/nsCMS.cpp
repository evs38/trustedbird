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
 * The Original Code is Mozilla Communicator.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corp..
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): David Drinan <ddrinan@netscape.com>
 *   Kai Engert <kengert@redhat.com>
 *   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#include "nsISupports.h"
#include "nsCMS.h"
#include "nsCOMPtr.h"
#include "nsNSSHelper.h"
#include "nsNSSCertificate.h"
#include "smime.h"
#include "cms.h"
#include "nsICMSMessageErrors.h"
#include "nsArray.h"
#include "nsCertVerificationThread.h"
#include "nsUUIDGenerator.h"

#include "prlog.h"
#ifdef PR_LOGGING
extern PRLogModuleInfo* gPIPNSSLog;
#endif

#include "nsNSSCleaner.h"

NSSCleanupAutoPtrClass(CERTCertificate, CERT_DestroyCertificate)

NS_IMPL_THREADSAFE_ISUPPORTS2(nsCMSMessage, nsICMSMessage, 
                                            nsICMSMessage2)

nsCMSMessage::nsCMSMessage()
{
  m_cmsMsg = nsnull;
}
nsCMSMessage::nsCMSMessage(NSSCMSMessage *aCMSMsg)
{
  m_cmsMsg = aCMSMsg;
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
  return CommonVerifySignature(nsnull, 0);
}

NSSCMSSignerInfo* nsCMSMessage::GetTopLevelSignerInfo()
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return nsnull;

  if (!m_cmsMsg)
    return nsnull;

  if (!NSS_CMSMessage_IsSigned(m_cmsMsg))
    return nsnull;

  NSSCMSContentInfo *cinfo = NSS_CMSMessage_ContentLevel(m_cmsMsg, 0);
  if (!cinfo)
    return nsnull;

  NSSCMSSignedData *sigd = (NSSCMSSignedData*)NSS_CMSContentInfo_GetContent(cinfo);
  if (!sigd)
    return nsnull;

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

/**
 * Decode a DER encoded OID to a dot-separated string of integers
 * @param in data DER encoded buffer
 * @param in len Length of data
 * @param out output Pointer to a string which will be allocated
 * @return True if no memory error
 */
PRBool GetSecurityLabelDecodeOid(const unsigned char* data, const unsigned int len, char** output)
{
	if (len > 0 && data[0] < 128) {
		/* Convert DER encoded OID to an array of integers (number of values is less than 'len + 1') */
		unsigned int* oid = (unsigned int*) PORT_Alloc((len + 1) * sizeof(unsigned int));
		if (oid == NULL) return PR_FALSE;

		unsigned int itemCount = 0;
		unsigned int i;
		
		/* Range of second item is 0-39 if first item is 0 or 1
		 * and 0-47 if first item is 2 */
		if (data[0] < 120) {
			oid[itemCount++] = data[0] / 40;
			oid[itemCount++] = data[0] % 40;
		} else {
			oid[itemCount++] = 2;
			oid[itemCount++] = data[0] - (2 * 40);
		}
	
		unsigned int n = 0;
		for (i = 1; i < len; i++) {
			n = n * 128 + (data[i] & 0x7F);
			if ((data[i] & 0x80) != 0x80) {
				oid[itemCount++] = n;
				n = 0;
			}
		}
	
		/* Allocate output string: max 7 characters by number + '.' */
		*output = (char*) PORT_Alloc(itemCount * (7 + 1) * sizeof(char));
		if (*output == NULL) return PR_FALSE;
	
		unsigned int outputCount = 0;
		for (i = 0; i < itemCount; i++) {
			if (i != 0) {
				(*output)[outputCount] = '.';
				outputCount++;
			}
			if (oid[i] < 10000000) outputCount += sprintf(&((*output)[outputCount]), "%d", oid[i]);
		}
		(*output)[outputCount] = '\0';
	
		PORT_Free(oid);
	}
	
	return PR_TRUE;
}

NS_IMETHODIMP nsCMSMessage::GetSecurityLabel(char **aSecurityPolicyIdentifier, PRInt32 *aSecurityClassification, PRUnichar** aPrivacyMark, PRUnichar** aSecurityCategories)
{
	nsNSSShutDownPreventionLock locker;
	if (isAlreadyShutDown()) return NS_ERROR_NOT_AVAILABLE;
	
	PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSecurityLabel\n"));
	NS_ENSURE_ARG(aSecurityPolicyIdentifier);
	NS_ENSURE_ARG(aSecurityClassification);
	NS_ENSURE_ARG(aPrivacyMark);
	NS_ENSURE_ARG(aSecurityCategories);
	
	NSSCMSSignerInfo *signerinfo = GetTopLevelSignerInfo();
	if (!signerinfo) return NS_ERROR_FAILURE;
	
	NSSCMSSecurityLabel* securityLabel = (NSSCMSSecurityLabel*) PORT_Alloc(sizeof(NSSCMSSecurityLabel));
	if (securityLabel == NULL) return NS_ERROR_OUT_OF_MEMORY;
	
	if (NSS_CMSSignerInfo_GetSecurityLabel(signerinfo, securityLabel) == SECSuccess) {
		
		/* Check unicity of each element as we use a SET_OF CHOICE instead of a SET */
		PRBool securityPolicyIdentifierAlreadyExists = PR_FALSE;
		PRBool securityClassificationAlreadyExists = PR_FALSE;
		PRBool privacyMarkAlreadyExists = PR_FALSE;
		PRBool securityCategoriesAlreadyExists = PR_FALSE;
		PRBool error = PR_FALSE;
		
		for (unsigned int elementId = 0; securityLabel->element[elementId] != NULL; elementId++) {
		
			unsigned int len;
			NSSCMSSecurityLabelElement* securityLabelElement = securityLabel->element[elementId];
			
			switch (securityLabelElement->selector) {
			
				case NSSCMSSecurityLabelElement_securityPolicyIdentifier:
					/*
					 * securityPolicyIdentifier
					 */
					if (securityPolicyIdentifierAlreadyExists) {
						error = PR_TRUE;
						break;
					}
					securityPolicyIdentifierAlreadyExists = PR_TRUE;
					
					if (securityLabelElement->id.securityPolicyIdentifier.len > 0 && securityLabelElement->id.securityPolicyIdentifier.data[0] < 128) {
						char* securityPolicyIdentifier = NULL;

						if (!GetSecurityLabelDecodeOid(securityLabelElement->id.securityPolicyIdentifier.data, securityLabelElement->id.securityPolicyIdentifier.len, &securityPolicyIdentifier)) return NS_ERROR_OUT_OF_MEMORY;
			
						if (securityPolicyIdentifier != NULL) {
							len = PORT_Strlen(securityPolicyIdentifier);
							*aSecurityPolicyIdentifier = (char*) PORT_Alloc((len + 1) * sizeof(char));
							PORT_Memcpy(*aSecurityPolicyIdentifier, securityPolicyIdentifier, len + 1);
							PORT_Free(securityPolicyIdentifier);
						}
					}
					break;
					
				case NSSCMSSecurityLabelElement_securityClassification:
					/*
					 * securityClassification
					 */
					if (securityClassificationAlreadyExists) {
						error = PR_TRUE;
						break;
					}
					securityClassificationAlreadyExists = PR_TRUE;
					
					len = securityLabelElement->id.securityClassification.len;
					
					*aSecurityClassification = -1;
					if (len > 0) {
						unsigned char* buf = (unsigned char*) PORT_Alloc(len * sizeof(unsigned char));
						if (buf == NULL) return NS_ERROR_OUT_OF_MEMORY;
						
						PORT_Memcpy(buf, securityLabelElement->id.securityClassification.data, len);
						*aSecurityClassification = 0;
						for (unsigned char j = 0; j < len; j++) *aSecurityClassification = ((*aSecurityClassification) << (j*8)) + buf[j];
						PORT_Free(buf);
					}
					break;
					
				case NSSCMSSecurityLabelElement_privacyMarkPrintableString:
					/*
					 * privacyMark (PrintableString)
					 */
					if (privacyMarkAlreadyExists) {
						error = PR_TRUE;
						break;
					}
					privacyMarkAlreadyExists = PR_TRUE;
					
					len = securityLabelElement->id.privacyMarkPrintableString.len;
					
					if (len > 0) {
						char* tempPrivacyMark = (char*) PORT_Alloc((len + 1) * sizeof(char));
						if (tempPrivacyMark == NULL) return NS_ERROR_OUT_OF_MEMORY;
						PORT_Memcpy(tempPrivacyMark, securityLabelElement->id.privacyMarkPrintableString.data, len);
						tempPrivacyMark[len] = '\0';
		
						*aPrivacyMark = ToNewUnicode(NS_ConvertUTF8toUTF16(tempPrivacyMark));
						PORT_Free(tempPrivacyMark);
					}
					break;
					
				case NSSCMSSecurityLabelElement_privacyMarkUTF8:
					/*
					 * privacyMark (UTF8)
					 */
					if (privacyMarkAlreadyExists) {
						error = PR_TRUE;
						break;
					}
					privacyMarkAlreadyExists = PR_TRUE;
					
					len = securityLabelElement->id.privacyMarkUTF8.len;
					
					if (len > 0) {
						char* tempPrivacyMark = (char*) PORT_Alloc((len + 1) * sizeof(char));
						if (tempPrivacyMark == NULL) return NS_ERROR_OUT_OF_MEMORY;
						PORT_Memcpy(tempPrivacyMark, securityLabelElement->id.privacyMarkUTF8.data, len);
						tempPrivacyMark[len] = '\0';
		
						*aPrivacyMark = ToNewUnicode(NS_ConvertUTF8toUTF16(tempPrivacyMark));
						PORT_Free(tempPrivacyMark);
					}
					break;
					
				case NSSCMSSecurityLabelElement_securityCategories:
					/*
					 * securityCategories
					 */
					if (securityCategoriesAlreadyExists) {
						error = PR_TRUE;
						break;
					}
					securityCategoriesAlreadyExists = PR_TRUE;
					
					if (securityLabelElement->id.securityCategories != NULL) {
						const char securityCategoriesSeparator = '|';
						unsigned int i;
						char* oid;
						
						/* Compute size of buffer */
						len = 0;
						for (i = 0; securityLabelElement->id.securityCategories[i] != NULL; i++) {
							oid = NULL;
							if (!GetSecurityLabelDecodeOid(securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.data, securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.len, &oid)) return NS_ERROR_OUT_OF_MEMORY;
							if (oid != NULL) {
								/* Add size of securityCategoryIdentifier */
								len += PORT_Strlen(oid);
								PORT_Free(oid);
								
								/* Add size of type field */
								len += 1;
								
								/* Add size of securityCategoryValue */
								if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 2) {
									if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0] == 0x02) { /* Integer */
										len += 7; /* 7 characters max for an integer */
									} else { /* UTF-8 and other types */
										len += securityLabelElement->id.securityCategories[i]->securityCategoryValue.len;
									}
								}
								
								/* Add size of 3 separators */
								len += 3;
							}
						}
						
						if (len > 0) {
							/* Create buffer */
							char* tempsecurityCategories = (char*) PORT_Alloc(len * sizeof(char));
							if (tempsecurityCategories == NULL) return NS_ERROR_OUT_OF_MEMORY;
			
							/* Fill buffer */
							len = 0;
							for (i = 0; securityLabelElement->id.securityCategories[i] != NULL; i++) {
								oid = NULL;
								if (!GetSecurityLabelDecodeOid(securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.data, securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.len, &oid)) return NS_ERROR_OUT_OF_MEMORY;
								if (oid != NULL) {
									/* Add securityCategoryIdentifier OID */
									PORT_Memcpy(tempsecurityCategories + len, oid, PORT_Strlen(oid));
									len += PORT_Strlen(oid);
									PORT_Free(oid);
									
									/* Add separator */
									tempsecurityCategories[len++] = securityCategoriesSeparator;
		
									/* Add type field */
									if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 0) {
										switch (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0]) {
											case 0x0C: /* UTF-8 */
												tempsecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_UTF8;
												break;
											case 0x02: /* Integer */
												tempsecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_INTEGER;
												break;
											default: /* Other type */
												tempsecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_UNKNOWN;
												break;
										}
									}
									
									/* Add separator */
									tempsecurityCategories[len++] = securityCategoriesSeparator;
									
									/* Add securityCategoryValue */
									if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 2) {
										if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0] == 0x02) { /* Integer: decode */
											unsigned int value = 0;
											for (unsigned int k = 2; k < securityLabelElement->id.securityCategories[i]->securityCategoryValue.len; k++) {
												value *= 256;
												value += securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[k];
											}
											if (value < 10000000) {
												int ret = sprintf(tempsecurityCategories + len, "%d", value);
												if (ret > 0) len += ret;
											}
										} else { /* UTF-8 and other types: direct copy */
											PORT_Memcpy(tempsecurityCategories + len, securityLabelElement->id.securityCategories[i]->securityCategoryValue.data + 2, securityLabelElement->id.securityCategories[i]->securityCategoryValue.len - 2);
											len += securityLabelElement->id.securityCategories[i]->securityCategoryValue.len - 2;
										}
									}
									
									/* Add separator */
									tempsecurityCategories[len++] = securityCategoriesSeparator;
								}
							}
							
							/* Overwrite last separator with \0 */
							tempsecurityCategories[len - 1] = '\0';

							*aSecurityCategories = ToNewUnicode(NS_ConvertUTF8toUTF16(tempsecurityCategories));
							PORT_Free(tempsecurityCategories);
						}
					}
					break;
			}
			
			if (error) break;
		}
		
		/* Too many elements: forget Security Label */
		if (error) {
			PORT_Free(*aSecurityPolicyIdentifier);
			*aSecurityPolicyIdentifier = NULL;
		}
	}
	
	PORT_Free(securityLabel);
	
	return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::GetSignedReceiptRequest(char ** aSignedContentIdentifier, char ** aReceiptsFrom, char ** aReceiptsTo)
{

  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignedReceiptRequest\n"));
  NS_ENSURE_ARG(aSignedContentIdentifier);
  NS_ENSURE_ARG(aReceiptsFrom);
  NS_ENSURE_ARG(aReceiptsTo);

  NSSCMSSignerInfo *signerinfo = GetTopLevelSignerInfo();
  if (!signerinfo)
    return NS_ERROR_FAILURE;

  if (NSS_CMSSignerInfo_HasReceiptRequest(signerinfo)) {
    NSSCMSReceiptRequest *receiptRequest = (NSSCMSReceiptRequest *) PORT_ZAlloc(sizeof(NSSCMSReceiptRequest));
    if (receiptRequest == NULL) {
      return NS_ERROR_OUT_OF_MEMORY;
    }

    if (NSS_CMSSignerInfo_GetReceiptRequest(signerinfo, receiptRequest) == SECSuccess)
    {
      // signedContentIdentifier
      int len = receiptRequest->signedContentIdentifier.len;
      *aSignedContentIdentifier = (char *) PORT_Alloc(len + 1);
      if (*aSignedContentIdentifier == NULL) {
        return NS_ERROR_OUT_OF_MEMORY;
      }
      PORT_Memcpy(*aSignedContentIdentifier, receiptRequest->signedContentIdentifier.data, len);
      (*aSignedContentIdentifier)[len] = '\0';

      // receiptsFrom
      len = receiptRequest->receiptsFrom.len;
      *aReceiptsFrom = (char *) PORT_Alloc(len + 1);
      if (*aReceiptsFrom == NULL) {
        return NS_ERROR_OUT_OF_MEMORY;
      }
      PORT_Memcpy(*aReceiptsFrom, receiptRequest->receiptsFrom.data, len);
      (*aReceiptsFrom)[len] = '\0';

      // receiptsTo
      len = receiptRequest->receiptsTo.len;
      *aReceiptsTo = (char *) PORT_Alloc(len + 1);
      if (*aReceiptsTo == NULL) {
        return NS_ERROR_OUT_OF_MEMORY;
      }
      PORT_Memcpy(*aReceiptsTo, receiptRequest->receiptsTo.data, len);
      (*aReceiptsTo)[len] = '\0';
    }

    if (receiptRequest)
      PORT_Free(receiptRequest);
  }

  return NS_OK;
}

NS_IMETHODIMP nsCMSMessage::ContentIsEncrypted(PRBool *isEncrypted)
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

NS_IMETHODIMP nsCMSMessage::ContentIsSigned(PRBool *isSigned)
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

    *scert = new nsNSSCertificate(si->cert);
    if (*scert) {
      (*scert)->AddRef();
    }
  }
  else {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::GetSignerCert no signer cert, do we have a cert list? %s\n",
      (si->certList != nsnull ? "yes" : "no") ));

    *scert = nsnull;
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

NS_IMETHODIMP nsCMSMessage::VerifyDetachedSignature(unsigned char* aDigestData, PRUint32 aDigestDataLen)
{
  if (!aDigestData || !aDigestDataLen)
    return NS_ERROR_FAILURE;

  return CommonVerifySignature(aDigestData, aDigestDataLen);
}

nsresult nsCMSMessage::CommonVerifySignature(unsigned char* aDigestData, PRUint32 aDigestDataLen)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature, content level count %d\n", NSS_CMSMessage_ContentLevelCount(m_cmsMsg)));
  NSSCMSContentInfo *cinfo = nsnull;
  NSSCMSSignedData *sigd = nsnull;
  NSSCMSSignerInfo *si;
  PRInt32 nsigners;
  nsresult rv = NS_ERROR_FAILURE;
  
  if (NSS_CMSMessage_IsSigned(m_cmsMsg) == PR_FALSE) {
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
  if (NSS_CMSSignedData_ImportCerts(sigd, CERT_GetDefaultCertDB(), certUsageEmailRecipient, PR_TRUE) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - can not import certs\n"));
  }

  nsigners = NSS_CMSSignedData_SignerInfoCount(sigd);
  PR_ASSERT(nsigners > 0);
  si = NSS_CMSSignedData_GetSignerInfo(sigd, 0);


  // See bug 324474. We want to make sure the signing cert is 
  // still valid at the current time.
  if (CERT_VerifyCertificateNow(CERT_GetDefaultCertDB(), si->cert, PR_TRUE, 
                                certificateUsageEmailSigner,
                                si->cmsg->pwfn_arg, NULL) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CommonVerifySignature - signing cert not trusted now\n"));
    rv = NS_ERROR_CMS_VERIFY_UNTRUSTED;
    goto loser;
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
  return CommonAsyncVerifySignature(aListener, nsnull, 0);
}

NS_IMETHODIMP nsCMSMessage::AsyncVerifyDetachedSignature(
                              nsISMimeVerificationListener *aListener,
                              unsigned char* aDigestData, PRUint32 aDigestDataLen)
{
  if (!aDigestData || !aDigestDataLen)
    return NS_ERROR_FAILURE;

  return CommonAsyncVerifySignature(aListener, aDigestData, aDigestDataLen);
}

nsresult nsCMSMessage::CommonAsyncVerifySignature(nsISMimeVerificationListener *aListener,
                                                  unsigned char* aDigestData, PRUint32 aDigestDataLen)
{
  nsSMimeVerificationJob *job = new nsSMimeVerificationJob;
  if (!job)
    return NS_ERROR_OUT_OF_MEMORY;
  
  if (aDigestData)
  {
    job->digest_data = new unsigned char[aDigestDataLen];
    if (!job->digest_data)
    {
      delete job;
      return NS_ERROR_OUT_OF_MEMORY;
    }
    
    memcpy(job->digest_data, aDigestData, aDigestDataLen);
  }
  else
  {
    job->digest_data = nsnull;
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
  :mCerts(nsnull), mPoolp(nsnull), mSize(0)
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
      for (PRUint32 i=0; i < mSize; i++) {
        if (mCerts[i]) {
          CERT_DestroyCertificate(mCerts[i]);
        }
      }
    }

    if (mPoolp)
      PORT_FreeArena(mPoolp, PR_FALSE);
  }

  PRBool allocate(PRUint32 count)
  {
    // only allow allocation once
    if (mPoolp)
      return PR_FALSE;
  
    mSize = count;

    if (!mSize)
      return PR_FALSE;
  
    mPoolp = PORT_NewArena(1024);
    if (!mPoolp)
      return PR_FALSE;

    mCerts = (CERTCertificate**)PORT_ArenaZAlloc(
      mPoolp, (count+1)*sizeof(CERTCertificate*));

    if (!mCerts)
      return PR_FALSE;

    // null array, including zero termination
    for (PRUint32 i = 0; i < count+1; i++) {
      mCerts[i] = nsnull;
    }

    return PR_TRUE;
  }
  
  void set(PRUint32 i, CERTCertificate *c)
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
  
  CERTCertificate *get(PRUint32 i)
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return nsnull;

    if (i >= mSize)
      return nsnull;
    
    return CERT_DupCertificate(mCerts[i]);
  }

  CERTCertificate **getRawArray()
  {
    nsNSSShutDownPreventionLock locker;
    if (isAlreadyShutDown())
      return nsnull;

    return mCerts;
  }

private:
  CERTCertificate **mCerts;
  PLArenaPool *mPoolp;
  PRUint32 mSize;
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
  PRUint32 i;
  nsNSSCertificate *nssRecipientCert;
  nsresult rv = NS_ERROR_FAILURE;

  // Check the recipient certificates //
  PRUint32 recipientCertCount;
  aRecipientCerts->GetLength(&recipientCertCount);
  PR_ASSERT(recipientCertCount > 0);

  if (!recipientCerts.allocate(recipientCertCount)) {
    goto loser;
  }

  for (i=0; i<recipientCertCount; i++) {
    nsCOMPtr<nsIX509Cert> x509cert = do_QueryElementAt(aRecipientCerts, i);

    nssRecipientCert = 
      NS_STATIC_CAST(nsNSSCertificate*, 
                     NS_STATIC_CAST(nsIX509Cert*, x509cert));

    if (!nssRecipientCert)
      return NS_ERROR_FAILURE;

    CERTCertificate *c = nssRecipientCert->GetCert();
    CERTCertificateCleaner rcCleaner(c);
    recipientCerts.set(i, c);
  }
  
  // Find a bulk key algorithm //
  if (NSS_SMIMEUtil_FindBulkAlgForRecipients(recipientCerts.getRawArray(), &bulkAlgTag,
                                            &keySize) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't find bulk alg for recipients\n"));
    rv = NS_ERROR_CMS_ENCRYPT_NO_BULK_ALG;
    goto loser;
  }

  m_cmsMsg = NSS_CMSMessage_Create(NULL);
  if (m_cmsMsg == nsnull) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create new cms message\n"));
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto loser;
  }

  if ((envd = NSS_CMSEnvelopedData_Create(m_cmsMsg, bulkAlgTag, keySize)) == nsnull) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create enveloped data\n"));
    goto loser;
  }

  cinfo = NSS_CMSMessage_GetContentInfo(m_cmsMsg);
  if (NSS_CMSContentInfo_SetContent_EnvelopedData(m_cmsMsg, cinfo, envd) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't create content enveloped data\n"));
    goto loser;
  }

  cinfo = NSS_CMSEnvelopedData_GetContentInfo(envd);
  if (NSS_CMSContentInfo_SetContent_Data(m_cmsMsg, cinfo, nsnull, PR_FALSE) != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateEncrypted - can't set content data\n"));
    goto loser;
  }

  // Create and attach recipient information //
  for (i=0; i < recipientCertCount; i++) {
    CERTCertificate *rc = recipientCerts.get(i);
    CERTCertificateCleaner rcCleaner(rc);
    if ((recipientInfo = NSS_CMSRecipientInfo_Create(m_cmsMsg, rc)) == nsnull) {
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
    m_cmsMsg = nsnull;
  }

  return rv;
}

NS_IMETHODIMP nsCMSMessage::CreateSigned(nsIX509Cert* aSigningCert, nsIX509Cert* aEncryptCert, unsigned char* aDigestData, PRUint32 aDigestDataLen, const char* aSecurityPolicyIdentifier, PRInt32 aSecurityClassification, const char* aPrivacyMark, const char* aSecurityCategories, unsigned char* aReceiptsTo)
{
  nsNSSShutDownPreventionLock locker;
  if (isAlreadyShutDown())
    return NS_ERROR_NOT_AVAILABLE;

  PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned\n"));
  NSSCMSContentInfo *cinfo;
  NSSCMSSignedData *sigd;
  NSSCMSSignerInfo *signerinfo;
  CERTCertificate *scert = nsnull, *ecert = nsnull;
  nsresult rv = NS_ERROR_FAILURE;

  /* Get the certs */
  scert = NS_STATIC_CAST(nsNSSCertificate*, aSigningCert)->GetCert();
  if (!scert) {
    return NS_ERROR_FAILURE;
  }

  if (aEncryptCert) {
    ecert = NS_STATIC_CAST(nsNSSCertificate*, aEncryptCert)->GetCert();
  }

  CERTCertificateCleaner ecertCleaner(ecert);
  CERTCertificateCleaner scertCleaner(scert);

  /*
   * create the message object
   */
  m_cmsMsg = NSS_CMSMessage_Create(NULL); /* create a message on its own pool */
  if (m_cmsMsg == NULL) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't create new message\n"));
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto loser;
  }

  /*
   * build chain of objects: message->signedData->data
   */
  if ((sigd = NSS_CMSSignedData_Create(m_cmsMsg)) == NULL) {
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

  /* we're always passing data in and detaching optionally */
  if (NSS_CMSContentInfo_SetContent_Data(m_cmsMsg, cinfo, nsnull, PR_TRUE) 
          != SECSuccess) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't set content data\n"));
    goto loser;
  }

  /* 
   * create & attach signer information
   */
  if ((signerinfo = NSS_CMSSignerInfo_Create(m_cmsMsg, scert, SEC_OID_SHA1)) 
          == NULL) {
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
    
  if (aSecurityPolicyIdentifier != NULL && aSecurityPolicyIdentifier[0] != '\0') {
    if (NSS_CMSSignerInfo_AddSecurityLabel(signerinfo, aSecurityPolicyIdentifier, aSecurityClassification, aPrivacyMark, aSecurityCategories) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add security label\n"));
      goto loser;
    }
  }
  
  // Add ReceiptRequest if requested
  if (aReceiptsTo != NULL && aReceiptsTo[0] != '\0') {

    // Generate UUID
    nsID* uuid;
    nsCOMPtr<nsIUUIDGenerator> uuidGenerator = nsGetServiceByContractID(NS_UUID_GENERATOR_CONTRACTID);
    if (!uuidGenerator) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't get UUID generator\n"));
      goto loser;
    }

    rv = uuidGenerator->GenerateUUID(&uuid);
    if (NS_FAILED(rv)) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't generate UUID\n"));
      goto loser;
    }

    if (NSS_CMSSignerInfo_AddReceiptRequest(signerinfo, aReceiptsTo, (unsigned char*) uuid->ToString()) != SECSuccess) {
      PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSMessage::CreateSigned - can't add signed receipt request\n"));
      NS_Free(uuid);
      goto loser;
    }
    NS_Free(uuid);
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

    if (NSS_CMSSignedData_AddCertificate(sigd, ecert) != SECSuccess) {
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
    m_cmsMsg = nsnull;
  }
  return rv;
}

NS_IMPL_THREADSAFE_ISUPPORTS1(nsCMSDecoder, nsICMSDecoder)

nsCMSDecoder::nsCMSDecoder()
: m_dcx(nsnull)
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
    m_dcx = nsnull;
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
NS_IMETHODIMP nsCMSDecoder::Update(const char *buf, PRInt32 len)
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
  m_dcx = nsnull;
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
: m_ecx(nsnull)
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
  nsCMSMessage *cmsMsg = NS_STATIC_CAST(nsCMSMessage*, aMsg);
  m_ctx = new PipUIContext();

  m_ecx = NSS_CMSEncoder_Start(cmsMsg->getCMS(), cb, arg, 0, 0, 0, m_ctx, 0, 0, 0, 0);
  if (m_ecx == nsnull) {
    PR_LOG(gPIPNSSLog, PR_LOG_DEBUG, ("nsCMSEncoder::Start - can't start encoder\n"));
    return NS_ERROR_FAILURE;
  }
  return NS_OK;
}

/* void update (in string aBuf, in long aLen); */
NS_IMETHODIMP nsCMSEncoder::Update(const char *aBuf, PRInt32 aLen)
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
  m_ecx = nsnull;
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
