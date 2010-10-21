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
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   David Drinan <ddrinan@netscape.com>
 *   Stephane Saux <ssaux@netscape.com>
 *   ESS Signed Receipts: Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
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

#include "nsMsgComposeSecure.h"

#include "msgCore.h"
#include "nsIMsgCompFields.h"
#include "nsIMsgCompUtils.h"
#include "nsIMsgHeaderParser.h"
#include "nsIMsgIdentity.h"
#include "nsISMimeCert.h"
#include "nsIX509CertDB.h"
#include "nsMimeTypes.h"
#include "nsMsgMimeCID.h"
#include "nsMsgCompCID.h"
#include "nspr.h"
#include "nsArrayUtils.h"

// XXX These strings should go in properties file XXX //
#define MIME_MULTIPART_SIGNED_BLURB "This is a cryptographically signed message in MIME format."
#define MIME_SMIME_ENCRYPTED_CONTENT_DESCRIPTION "S/MIME Encrypted Message"
#define MIME_SMIME_SIGNATURE_CONTENT_DESCRIPTION "S/MIME Cryptographic Signature"
#define MIME_SMIME_RECEIPT_CONTENT_DESCRIPTION "S/MIME Receipt"

#define MK_MIME_ERROR_WRITING_FILE -1

#define SMIME_STRBUNDLE_URL "chrome://messenger/locale/am-smime.properties"

static void mime_crypto_write_base64 (void *closure, const char *buf,
              unsigned long size);
static nsresult mime_encoder_output_fn(const char *buf, PRInt32 size, void *closure);
static nsresult mime_nested_encoder_output_fn (const char *buf, PRInt32 size, void *closure);
static int make_multipart_signed_header_string(PRBool outer_p,
                  char **header_return,
                  char **boundary_return);
static char *mime_make_separator(const char *prefix);

// mscott --> FIX ME...for now cloning code from compose\nsMsgEncode.h/.cpp

MimeEncoderData *
MIME_B64EncoderInit(nsresult (* output_fn) (const char *buf, PRInt32 size, void *closure), void *closure) 
{
  MimeEncoderData *returnEncoderData = nsnull;
  nsIMimeConverter *converter;
  nsresult res = CallCreateInstance(NS_MIME_CONVERTER_CONTRACTID, &converter);
  if (NS_SUCCEEDED(res) && nsnull != converter) 
  {
    res = converter->B64EncoderInit(output_fn, closure, &returnEncoderData);
    NS_RELEASE(converter);
  }
  return NS_SUCCEEDED(res) ? returnEncoderData : nsnull;
}

MimeEncoderData * 
MIME_QPEncoderInit(nsresult (* output_fn) (const char *buf, PRInt32 size, void *closure), void *closure) 
{
  MimeEncoderData *returnEncoderData = nsnull;
  nsIMimeConverter *converter;
  nsresult res = CallCreateInstance(NS_MIME_CONVERTER_CONTRACTID, &converter);
  if (NS_SUCCEEDED(res) && nsnull != converter) 
  {
    res = converter->QPEncoderInit(output_fn, closure, &returnEncoderData);
    NS_RELEASE(converter);
  }
  return NS_SUCCEEDED(res) ? returnEncoderData : nsnull;
}

nsresult
MIME_EncoderDestroy(MimeEncoderData *data, PRBool abort_p) 
{
  //MimeEncoderData *returnEncoderData = nsnull;
  nsIMimeConverter *converter;
  nsresult res = CallCreateInstance(NS_MIME_CONVERTER_CONTRACTID, &converter);
  if (NS_SUCCEEDED(res) && nsnull != converter) 
  {
    res = converter->EncoderDestroy(data, abort_p);
    NS_RELEASE(converter);
  }

  return NS_SUCCEEDED(res) ? 0 : -1;
}

nsresult
MIME_EncoderWrite(MimeEncoderData *data, const char *buffer, PRInt32 size) 
{
  //  MimeEncoderData *returnEncoderData = nsnull;
  nsIMimeConverter *converter;
  PRInt32 written = 0;
  nsresult res = CallCreateInstance(NS_MIME_CONVERTER_CONTRACTID, &converter);
  if (NS_SUCCEEDED(res) && nsnull != converter) {
    res = converter->EncoderWrite(data, buffer, size, &written);
    NS_RELEASE(converter);
  }
  return NS_SUCCEEDED(res) ? 0 : -1;
}

static void
GenerateGlobalRandomBytes(unsigned char *buf, PRInt32 len)
{
  static PRBool    firstTime = PR_TRUE;
  
  if (firstTime)
  {
    // Seed the random-number generator with current time so that
    // the numbers will be different every time we run.
    PRInt32 aTime;
    LL_L2I(aTime, PR_Now());
    srand( (unsigned)aTime );
    firstTime = PR_FALSE;
  }
  
  for( PRInt32 i = 0; i < len; i++ )
    buf[i] = rand() % 10;
}
   
char 
*mime_make_separator(const char *prefix)
{
  unsigned char rand_buf[13]; 
  GenerateGlobalRandomBytes(rand_buf, 12);

  return PR_smprintf("------------%s"
           "%02X%02X%02X%02X"
           "%02X%02X%02X%02X"
           "%02X%02X%02X%02X",
           prefix,
           rand_buf[0], rand_buf[1], rand_buf[2], rand_buf[3],
           rand_buf[4], rand_buf[5], rand_buf[6], rand_buf[7],
           rand_buf[8], rand_buf[9], rand_buf[10], rand_buf[11]);
}

// end of copied code which needs fixed....


/////////////////////////////////////////////////////////////////////////////////////////
// Implementation of nsMsgSMIMESecureHeader
/////////////////////////////////////////////////////////////////////////////////////////
NS_IMPL_ISUPPORTS1(nsMsgSMIMESecureHeader, nsIMsgSMIMESecureHeader)

nsMsgSMIMESecureHeader::nsMsgSMIMESecureHeader():mHeaderStatus(-1),mHeaderEncrypted(-1)
{

}

nsMsgSMIMESecureHeader::~nsMsgSMIMESecureHeader()
{
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::SetHeaderName( const nsAString & value)
{
	mHeaderName = value;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::GetHeaderName( nsAString & _retval)
{
	_retval=mHeaderName;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::SetHeaderValue( const nsAString & value)
{
	mHeaderValue = value;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::GetHeaderValue( nsAString & _retval)
{
	_retval=mHeaderValue;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::SetHeaderStatus( PRInt32 value )
{
	mHeaderStatus=value;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::GetHeaderStatus(PRInt32 * _retval)
{
	*_retval=mHeaderStatus;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::SetHeaderEncrypted( PRInt32 value )
{
	mHeaderEncrypted=value;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMESecureHeader::GetHeaderEncrypted(PRInt32 * _retval)
{
	*_retval = mHeaderEncrypted;
	return NS_OK;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Implementation of nsMsgSMIMEComposeFields
/////////////////////////////////////////////////////////////////////////////////////////

NS_IMPL_ISUPPORTS1(nsMsgSMIMEComposeFields, nsIMsgSMIMECompFields)

nsMsgSMIMEComposeFields::nsMsgSMIMEComposeFields()
:mSignMessage(PR_FALSE), mAlwaysEncryptMessage(PR_FALSE),
mSMIMEReceiptRequest(PR_FALSE),
mSMIMEReceipt(PR_FALSE),
mSMIMEReceiptSignedContentIdentifierLen(0),
mSMIMEReceiptOriginatorSignatureValueLen(0),
mSMIMEReceiptOriginatorContentTypeLen(0),
mSMIMEReceiptMsgSigDigestLen(0),
mCanonAlgorithme(0),
mSecurityClassification(-1)
{
	nsresult rv;
	m_secureHeaders = do_CreateInstance(NS_ARRAY_CONTRACTID, &rv);
}

nsMsgSMIMEComposeFields::~nsMsgSMIMEComposeFields()
{
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSignMessage(PRBool value)
{
  mSignMessage = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSignMessage(PRBool *_retval)
{
  *_retval = mSignMessage;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetRequireEncryptMessage(PRBool value)
{
  mAlwaysEncryptMessage = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetRequireEncryptMessage(PRBool *_retval)
{
  *_retval = mAlwaysEncryptMessage;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptRequest(PRBool value)
{
  mSMIMEReceiptRequest = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptRequest(PRBool *_retval)
{
  *_retval = mSMIMEReceiptRequest;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceipt(PRBool value)
{
  mSMIMEReceipt = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceipt(PRBool *_retval)
{
  *_retval = mSMIMEReceipt;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptSignedContentIdentifier(PRUint8 *value)
{
  mSMIMEReceiptSignedContentIdentifier = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptSignedContentIdentifier(PRUint8 **_retval)
{
  *_retval = mSMIMEReceiptSignedContentIdentifier;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptSignedContentIdentifierLen(const PRUint32 value)
{
  mSMIMEReceiptSignedContentIdentifierLen = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptSignedContentIdentifierLen(PRUint32 *_retval)
{
  *_retval = mSMIMEReceiptSignedContentIdentifierLen;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptOriginatorSignatureValue(PRUint8 *value)
{
  mSMIMEReceiptOriginatorSignatureValue = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptOriginatorSignatureValue(PRUint8 **_retval)
{
  *_retval = mSMIMEReceiptOriginatorSignatureValue;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptOriginatorSignatureValueLen(const PRUint32 value)
{
  mSMIMEReceiptOriginatorSignatureValueLen = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptOriginatorSignatureValueLen(PRUint32 *_retval)
{
  *_retval = mSMIMEReceiptOriginatorSignatureValueLen;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptOriginatorContentType(PRUint8 *value)
{
  mSMIMEReceiptOriginatorContentType = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptOriginatorContentType(PRUint8 **_retval)
{
  *_retval = mSMIMEReceiptOriginatorContentType;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptOriginatorContentTypeLen(const PRUint32 value)
{
  mSMIMEReceiptOriginatorContentTypeLen = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptOriginatorContentTypeLen(PRUint32 *_retval)
{
  *_retval = mSMIMEReceiptOriginatorContentTypeLen;
  return NS_OK;
}

//Secure Headers
NS_IMETHODIMP nsMsgSMIMEComposeFields::AddSecureHeader(nsIMsgSMIMESecureHeader * secureHeader)
{
	nsresult rv = NS_OK;

	if (!secureHeader)
		return NS_ERROR_FAILURE;
	rv=m_secureHeaders->AppendElement(secureHeader,PR_FALSE);
	return rv;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSecureHeadersList(nsIMutableArray ** _SecureHeaders)
{
	*_SecureHeaders=m_secureHeaders;
	NS_ADDREF(*_SecureHeaders);
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::ClearSecureHeaders()
{
	if(m_secureHeaders)
	{
		m_secureHeaders->Clear();
	}
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetCanonAlgorithme(PRInt32 value)
{
	mCanonAlgorithme=value;
	return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetCanonAlgorithme(PRInt32 * retval)
{
	*retval = mCanonAlgorithme;
	return NS_OK;
}
//

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptMsgSigDigest(PRUint8 *value)
{
  mSMIMEReceiptMsgSigDigest = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptMsgSigDigest(PRUint8 **_retval)
{
  *_retval = mSMIMEReceiptMsgSigDigest;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSMIMEReceiptMsgSigDigestLen(const PRUint32 value)
{
  mSMIMEReceiptMsgSigDigestLen = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSMIMEReceiptMsgSigDigestLen(PRUint32 *_retval)
{
  *_retval = mSMIMEReceiptMsgSigDigestLen;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSecurityPolicyIdentifier(const nsAString &value)
{
  mSecurityPolicyIdentifier = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSecurityPolicyIdentifier(nsAString &_retval)
{
  _retval = mSecurityPolicyIdentifier;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSecurityClassification(PRInt32 value)
{
  mSecurityClassification = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSecurityClassification(PRInt32 *_retval)
{
  *_retval = mSecurityClassification;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetPrivacyMark(const nsAString &value)
{
  mPrivacyMark = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetPrivacyMark(nsAString &_retval)
{
  _retval = mPrivacyMark;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::SetSecurityCategories(const nsAString &value)
{
  mSecurityCategories = value;
  return NS_OK;
}

NS_IMETHODIMP nsMsgSMIMEComposeFields::GetSecurityCategories(nsAString &_retval)
{
  _retval = mSecurityCategories;
  return NS_OK;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Implementation of nsMsgComposeSecure
/////////////////////////////////////////////////////////////////////////////////////////

NS_IMPL_ISUPPORTS1(nsMsgComposeSecure, nsIMsgComposeSecure)

nsMsgComposeSecure::nsMsgComposeSecure()
{
  /* member initializers and constructor code */
  mSigEncoderData = 0;
  mMultipartSignedBoundary  = 0;
  mCryptoEncoderData = 0;
  mBuffer = 0;
  mBufferedBytes = 0;
  mCanonAlgorithme=0;
  mHasSecuritylabel = PR_FALSE;
  mSecurityClassification = -1;
}

nsMsgComposeSecure::~nsMsgComposeSecure()
{
  /* destructor code */
  if (mEncryptionContext) {
    if (mBufferedBytes) {
      mEncryptionContext->Update(mBuffer, mBufferedBytes);
      mBufferedBytes = 0;
    }
    mEncryptionContext->Finish();
  }

  if (mSigEncoderData) {
    MIME_EncoderDestroy (mSigEncoderData, PR_TRUE);
  }
  if (mCryptoEncoderData) {
    MIME_EncoderDestroy (mCryptoEncoderData, PR_TRUE);
  }

  delete [] mBuffer;

  PR_FREEIF(mMultipartSignedBoundary);
}

NS_IMETHODIMP nsMsgComposeSecure::RequiresCryptoEncapsulation(nsIMsgIdentity * aIdentity, nsIMsgCompFields * aCompFields, PRBool * aRequiresEncryptionWork)
{
  NS_ENSURE_ARG_POINTER(aRequiresEncryptionWork);

  nsresult rv = NS_OK;
  *aRequiresEncryptionWork = PR_FALSE;

  PRBool alwaysEncryptMessages = PR_FALSE;
  PRBool signMessage = PR_FALSE;
  rv = ExtractEncryptionState(aIdentity, aCompFields, &signMessage, &alwaysEncryptMessages);

  if (alwaysEncryptMessages || signMessage)
    *aRequiresEncryptionWork = PR_TRUE;

  return NS_OK;
}


nsresult nsMsgComposeSecure::GetSMIMEBundleString(const PRUnichar *name,
                                                  PRUnichar **outString)
{
  *outString = nsnull;

  NS_ENSURE_ARG_POINTER(name);

  if (!InitializeSMIMEBundle())
    return NS_ERROR_FAILURE;

  return NS_SUCCEEDED(mSMIMEBundle->GetStringFromName(name, outString));
}

nsresult
nsMsgComposeSecure::
SMIMEBundleFormatStringFromName(const PRUnichar *name,
                                const PRUnichar **params,
                                PRUint32 numParams,
                                PRUnichar **outString)
{
  NS_ENSURE_ARG_POINTER(name);

  if (!InitializeSMIMEBundle())
    return NS_ERROR_FAILURE;

  return mSMIMEBundle->FormatStringFromName(name, params,
                                            numParams, outString);
}

PRBool nsMsgComposeSecure::InitializeSMIMEBundle()
{
  if (mSMIMEBundle)
    return PR_TRUE;

  nsCOMPtr<nsIStringBundleService> bundleService =
    do_GetService(NS_STRINGBUNDLE_CONTRACTID);
  nsresult rv = bundleService->CreateBundle(SMIME_STRBUNDLE_URL,
                                            getter_AddRefs(mSMIMEBundle));
  NS_ENSURE_SUCCESS(rv, PR_FALSE);

  return PR_TRUE;
}

void nsMsgComposeSecure::SetError(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string)
{
  if (!sendReport || !bundle_string)
    return;

  if (mErrorAlreadyReported)
    return;

  mErrorAlreadyReported = PR_TRUE;
  
  nsString errorString;
  nsresult res;

  res = GetSMIMEBundleString(bundle_string,
                             getter_Copies(errorString));

  if (NS_SUCCEEDED(res) && !errorString.IsEmpty())
  {
    sendReport->SetMessage(nsIMsgSendReport::process_Current,
                           errorString.get(),
                           PR_TRUE);
  }
}

void nsMsgComposeSecure::SetErrorWithParam(nsIMsgSendReport *sendReport, const PRUnichar *bundle_string, const char *param)
{
  if (!sendReport || !bundle_string || !param)
    return;

  if (mErrorAlreadyReported)
    return;

  mErrorAlreadyReported = PR_TRUE;
  
  nsString errorString;
  nsresult res;
  const PRUnichar *params[1];

  NS_ConvertASCIItoUTF16 ucs2(param);
  params[0]= ucs2.get();

  res = SMIMEBundleFormatStringFromName(bundle_string,
                                        params,
                                        1,
                                        getter_Copies(errorString));

  if (NS_SUCCEEDED(res) && !errorString.IsEmpty())
  {
    sendReport->SetMessage(nsIMsgSendReport::process_Current,
                           errorString.get(),
                           PR_TRUE);
  }
}

nsresult nsMsgComposeSecure::ExtractEncryptionState(nsIMsgIdentity * aIdentity, nsIMsgCompFields * aComposeFields, PRBool * aSignMessage, PRBool * aEncrypt)
{
  if (!aComposeFields && !aIdentity)
    return NS_ERROR_FAILURE; // kick out...invalid args....

  NS_ENSURE_ARG_POINTER(aSignMessage);
  NS_ENSURE_ARG_POINTER(aEncrypt);

  nsCOMPtr<nsISupports> securityInfo;
  if (aComposeFields)
    aComposeFields->GetSecurityInfo(getter_AddRefs(securityInfo));

  if (securityInfo) // if we were given security comp fields, use them.....
  {
    nsCOMPtr<nsIMsgSMIMECompFields> smimeCompFields = do_QueryInterface(securityInfo);
    if (smimeCompFields)
    {
      smimeCompFields->GetSignMessage(aSignMessage);
      smimeCompFields->GetRequireEncryptMessage(aEncrypt);
      return NS_OK;
    }
  }

  // get the default info from the identity....
  PRInt32 ep = 0;
  nsresult testrv = aIdentity->GetIntAttribute("encryptionpolicy", &ep);
  if (NS_FAILED(testrv)) {
    *aEncrypt = PR_FALSE;
  }
  else {
    *aEncrypt = (ep > 0);
  }

  testrv = aIdentity->GetBoolAttribute("sign_mail", aSignMessage);
  if (NS_FAILED(testrv))
  {
    *aSignMessage = PR_FALSE;
  }
  return NS_OK;
}

nsresult nsMsgComposeSecure::ExtractSMIMEReceiptState(nsIMsgIdentity *aIdentity,
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
                                                      PRUint32 *aSMIMEReceiptMsgSigDigestLen)
{
  if (!aComposeFields && !aIdentity)
    return NS_ERROR_FAILURE; // kick out...invalid args....

  NS_ENSURE_ARG(aSMIMEReceiptRequest);
  NS_ENSURE_ARG(aSMIMEReceipt);
  NS_ENSURE_ARG(aSMIMEReceiptSignedContentIdentifier);
  NS_ENSURE_ARG(aSMIMEReceiptSignedContentIdentifierLen);
  NS_ENSURE_ARG(aSMIMEReceiptOriginatorSignatureValue);
  NS_ENSURE_ARG(aSMIMEReceiptOriginatorSignatureValueLen);
  NS_ENSURE_ARG(aSMIMEReceiptOriginatorContentType);
  NS_ENSURE_ARG(aSMIMEReceiptOriginatorContentTypeLen);
  NS_ENSURE_ARG(aSMIMEReceiptMsgSigDigest);
  NS_ENSURE_ARG(aSMIMEReceiptMsgSigDigestLen);

  *aSMIMEReceiptRequest = PR_FALSE;
  *aSMIMEReceipt = PR_FALSE;

  nsCOMPtr<nsISupports> securityInfo;
  if (aComposeFields)
  {
    aComposeFields->GetSecurityInfo(getter_AddRefs(securityInfo));

    if (securityInfo) // if we were given security comp fields, use them.....
    {
      nsCOMPtr<nsIMsgSMIMECompFields> smimeCompFields = do_QueryInterface(securityInfo);
      if (smimeCompFields)
      {
        /* Get SMIME receipt request */
        smimeCompFields->GetSMIMEReceiptRequest(aSMIMEReceiptRequest);

        if (*aSMIMEReceiptRequest)
          return NS_OK;

        /* Get SMIME receipt */
        smimeCompFields->GetSMIMEReceipt(aSMIMEReceipt);
        if (*aSMIMEReceipt)
        {
          smimeCompFields->GetSMIMEReceiptSignedContentIdentifier(aSMIMEReceiptSignedContentIdentifier);
          smimeCompFields->GetSMIMEReceiptSignedContentIdentifierLen(aSMIMEReceiptSignedContentIdentifierLen);
          smimeCompFields->GetSMIMEReceiptOriginatorSignatureValue(aSMIMEReceiptOriginatorSignatureValue);
          smimeCompFields->GetSMIMEReceiptOriginatorSignatureValueLen(aSMIMEReceiptOriginatorSignatureValueLen);
          smimeCompFields->GetSMIMEReceiptOriginatorContentType(aSMIMEReceiptOriginatorContentType);
          smimeCompFields->GetSMIMEReceiptOriginatorContentTypeLen(aSMIMEReceiptOriginatorContentTypeLen);
          smimeCompFields->GetSMIMEReceiptMsgSigDigest(aSMIMEReceiptMsgSigDigest);
          smimeCompFields->GetSMIMEReceiptMsgSigDigestLen(aSMIMEReceiptMsgSigDigestLen);
          return NS_OK;
        }

      }
    }
  }

  return NS_OK;
}

nsresult nsMsgComposeSecure::ExtractSecurityLabelState(nsIMsgCompFields * aComposeFields, PRBool * aHasSecuritylabel, nsAString& aSecurityPolicyIdentifier, PRInt32 * aSecurityClassification, nsAString& aPrivacyMark, nsAString& aSecurityCategories)
{
  if (!aComposeFields)
    return NS_ERROR_FAILURE; // kick out...invalid args....

  NS_ENSURE_ARG_POINTER(aHasSecuritylabel);
  NS_ENSURE_ARG_POINTER(aSecurityClassification);

  nsCOMPtr<nsISupports> securityInfo;
  if (aComposeFields)
  {
    aComposeFields->GetSecurityInfo(getter_AddRefs(securityInfo));

    if (securityInfo) // if we were given security comp fields, use them.....
    {
      nsCOMPtr<nsIMsgSMIMECompFields> smimeCompFields = do_QueryInterface(securityInfo);
      if (smimeCompFields)
      {
        smimeCompFields->GetSecurityPolicyIdentifier(aSecurityPolicyIdentifier);
        smimeCompFields->GetSecurityClassification(aSecurityClassification);
        smimeCompFields->GetPrivacyMark(aPrivacyMark);
        smimeCompFields->GetSecurityCategories(aSecurityCategories);
        if (!aSecurityPolicyIdentifier.IsEmpty())
          *aHasSecuritylabel = PR_TRUE;
      }
    }
  }

  return NS_OK;
}

/* void beginCryptoEncapsulation (in nsOutputFileStream aStream, in boolean aEncrypt, in boolean aSign, in string aRecipeints, in boolean aIsDraft); */
NS_IMETHODIMP nsMsgComposeSecure::BeginCryptoEncapsulation(nsIOutputStream * aStream,
                                                           const char * aRecipients,
                                                           nsIMsgCompFields * aCompFields,
                                                           nsIMsgIdentity * aIdentity,
                                                           nsIMsgSendReport *sendReport,
                                                           PRBool aIsDraft)
{
  mErrorAlreadyReported = PR_FALSE;
  nsresult rv = NS_OK;

  PRBool encryptMessages = PR_FALSE;
  PRBool signMessage = PR_FALSE;
  ExtractEncryptionState(aIdentity, aCompFields, &signMessage, &encryptMessages);

  if (!signMessage && !encryptMessages) return NS_ERROR_FAILURE;

  // Extract SMIME receipt request and receipt state
  mSMIMEReceiptRequest = PR_FALSE;
  ExtractSMIMEReceiptState(aIdentity,
                           aCompFields,
                           &mSMIMEReceiptRequest,
                           &mSMIMEReceipt,
                           &mSMIMEReceiptSignedContentIdentifier,
                           &mSMIMEReceiptSignedContentIdentifierLen,
                           &mSMIMEReceiptOriginatorSignatureValue,
                           &mSMIMEReceiptOriginatorSignatureValueLen,
                           &mSMIMEReceiptOriginatorContentType,
                           &mSMIMEReceiptOriginatorContentTypeLen,
                           &mSMIMEReceiptMsgSigDigest,
                           &mSMIMEReceiptMsgSigDigestLen);

  //Extract Headers to secure
  ReadHeadersToSecure(aIdentity,aCompFields);

  if (mSMIMEReceiptRequest) {
    signMessage = PR_TRUE;

    /* Generate a random signed content identifier for the receipt request */
    nsCOMPtr<nsIMsgCompUtils> compUtils;
    compUtils = do_GetService(NS_MSGCOMPUTILS_CONTRACTID, &rv);
    NS_ENSURE_SUCCESS(rv, rv);
    rv = compUtils->MsgGenerateMessageId(aIdentity, getter_Copies(mSMIMEReceiptRequestSignedContentIdentifier));
    NS_ENSURE_SUCCESS(rv, rv);

    /* Get sender address for the recipient field of the receipt request */
    aIdentity->GetEmail(mSMIMEReceiptRequestReceiptsTo);
  } else if (mSMIMEReceipt) {
    signMessage = PR_TRUE;
  }

  ExtractSecurityLabelState(aCompFields, &mHasSecuritylabel, mSecurityPolicyIdentifier, &mSecurityClassification, mPrivacyMark, mSecurityCategories);

  mStream = aStream;
  mIsDraft = aIsDraft;

  if (mSMIMEReceipt)
    mCryptoState = mime_crypto_signed_receipt;
  else if (encryptMessages && signMessage)
    mCryptoState = mime_crypto_signed_encrypted;
  else if (encryptMessages)
    mCryptoState = mime_crypto_encrypted;
  else if (signMessage)
    mCryptoState = mime_crypto_clear_signed;
  else
    PR_ASSERT(0);

  aIdentity->GetUnicharAttribute("signing_cert_name", mSigningCertName);
  aIdentity->GetUnicharAttribute("encryption_cert_name", mEncryptionCertName);

  rv = MimeCryptoHackCerts(aRecipients, sendReport, encryptMessages, signMessage);
  if (NS_FAILED(rv)) {
    goto FAIL;
  }

  switch (mCryptoState)
  {
  case mime_crypto_clear_signed:
    rv = MimeInitMultipartSigned(PR_TRUE, sendReport);
    break;
  case mime_crypto_opaque_signed:
    PR_ASSERT(0);    /* #### no api for this yet */
    rv = NS_ERROR_NOT_IMPLEMENTED;
    break;
  case mime_crypto_signed_encrypted:
    rv = MimeInitEncryption(PR_TRUE, sendReport);
    break;
  case mime_crypto_encrypted:
    rv = MimeInitEncryption(PR_FALSE, sendReport);
    break;
  case mime_crypto_signed_receipt:
    /* Nothing to be done here */
    break;
  case mime_crypto_none:
    /* This can happen if mime_crypto_hack_certs() decided to turn off
     encryption (by asking the user.) */
    rv = 1;
    break;
  default:
    PR_ASSERT(0);
    break;
  }

FAIL:
  return rv;
}

/* void finishCryptoEncapsulation (in boolean aAbort); */
NS_IMETHODIMP nsMsgComposeSecure::FinishCryptoEncapsulation(PRBool aAbort, nsIMsgSendReport *sendReport)
{
  nsresult rv = NS_OK;

  if (!aAbort) {
    switch (mCryptoState) {
    case mime_crypto_clear_signed:
      rv = MimeFinishMultipartSigned (PR_TRUE, sendReport);
      break;
    case mime_crypto_opaque_signed:
      PR_ASSERT(0);    /* #### no api for this yet */
      rv = NS_ERROR_FAILURE;
      break;
    case mime_crypto_signed_encrypted:
      rv = MimeFinishEncryption (PR_TRUE, sendReport);
      break;
    case mime_crypto_encrypted:
      rv = MimeFinishEncryption (PR_FALSE, sendReport);
      break;
    case mime_crypto_signed_receipt:
      rv = MimeFinishSignedReceipt(sendReport);
      break;
    default:
      PR_ASSERT(0);
      rv = NS_ERROR_FAILURE;
      break;
    }
  }
  return rv;
}

nsresult nsMsgComposeSecure::MimeInitMultipartSigned(PRBool aOuter, nsIMsgSendReport *sendReport)
{
  /* First, construct and write out the multipart/signed MIME header data.
   */
  nsresult rv = NS_OK;
  char *header = 0;
  PRUint32 L;

  rv = make_multipart_signed_header_string(aOuter, &header,
                    &mMultipartSignedBoundary);
  if (NS_FAILED(rv)) goto FAIL;

  L = strlen(header);

  if (aOuter){
    /* If this is the outer block, write it to the file. */
    PRUint32 n;
    rv = mStream->Write(header, L, &n);
    if (NS_FAILED(rv) || n < L) {
      rv = MK_MIME_ERROR_WRITING_FILE;
    }
  } else {
    /* If this is an inner block, feed it through the crypto stream. */
    rv = MimeCryptoWriteBlock (header, L);
  }

  PR_Free(header);
  if (NS_FAILED(rv)) goto FAIL;

  /* Now initialize the crypto library, so that we can compute a hash
   on the object which we are signing.
   */

  mHashType = nsICryptoHash::SHA1;

  PR_SetError(0,0);
  mDataHash = do_CreateInstance("@mozilla.org/security/hash;1", &rv);
  if (NS_FAILED(rv)) return 0;

  rv = mDataHash->Init(mHashType);
  if (NS_FAILED(rv)) {
    goto FAIL;
  }

  PR_SetError(0,0);
 FAIL:
  return rv;
}

nsresult nsMsgComposeSecure::MimeInitEncryption(PRBool aSign, nsIMsgSendReport *sendReport)
{
  nsresult rv;

  /* First, construct and write out the opaque-crypto-blob MIME header data.
   */

  char *s =
  PR_smprintf("Content-Type: " APPLICATION_PKCS7_MIME
          "; name=\"smime.p7m\"" CRLF
        "Content-Transfer-Encoding: " ENCODING_BASE64 CRLF
        "Content-Disposition: attachment"
          "; filename=\"smime.p7m\"" CRLF
        "Content-Description: %s" CRLF
        CRLF,
        MIME_SMIME_ENCRYPTED_CONTENT_DESCRIPTION);
  PRUint32 L;
  if (!s) return NS_ERROR_OUT_OF_MEMORY;
  L = strlen(s);
  PRUint32 n;
  rv = mStream->Write(s, L, &n);
  if (NS_FAILED(rv) || n < L) {
    return NS_ERROR_FAILURE;
  }
  PR_Free(s);
  s = 0;

  /* Now initialize the crypto library, so that we can filter the object
   to be encrypted through it.
   */

  if (!mIsDraft) {
    PRUint32 numCerts;
    mCerts->GetLength(&numCerts);
    PR_ASSERT(numCerts > 0);
    if (numCerts == 0) return NS_ERROR_FAILURE;
  }

  /* Initialize the base64 encoder. */
  PR_ASSERT(!mCryptoEncoderData);
  mCryptoEncoderData = MIME_B64EncoderInit(mime_encoder_output_fn,
                          this);
  if (!mCryptoEncoderData) {
    return NS_ERROR_OUT_OF_MEMORY;
  }

  /* Initialize the encrypter (and add the sender's cert.) */
  PR_ASSERT(mSelfEncryptionCert);
  PR_SetError(0,0);
  mEncryptionCinfo = do_CreateInstance(NS_CMSMESSAGE_CONTRACTID, &rv);
  if (NS_FAILED(rv)) return rv;
  rv = mEncryptionCinfo->CreateEncrypted(mCerts);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotEncrypt").get());
    goto FAIL;
  }

  mEncryptionContext = do_CreateInstance(NS_CMSENCODER_CONTRACTID, &rv);
  if (NS_FAILED(rv)) return rv;

  if (!mBuffer) {
    mBuffer = new char[eBufferSize];
    if (!mBuffer)
      return NS_ERROR_OUT_OF_MEMORY;
  }

  mBufferedBytes = 0;

  rv = mEncryptionContext->Start(mEncryptionCinfo, mime_crypto_write_base64, mCryptoEncoderData);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotEncrypt").get());
    goto FAIL;
  }

  /* If we're signing, tack a multipart/signed header onto the front of
   the data to be encrypted, and initialize the sign-hashing code too.
   */
  if (aSign) {
    rv = MimeInitMultipartSigned(PR_FALSE, sendReport);
    if (NS_FAILED(rv)) goto FAIL;
  }

 FAIL:
  return rv;
}

nsresult nsMsgComposeSecure::MimeFinishMultipartSigned (PRBool aOuter, nsIMsgSendReport *sendReport)
{
  int status;
  nsresult rv;
  nsCOMPtr<nsICMSMessage> cinfo = do_CreateInstance(NS_CMSMESSAGE_CONTRACTID, &rv);
  nsCOMPtr<nsICMSEncoder> encoder = do_CreateInstance(NS_CMSENCODER_CONTRACTID, &rv);
  char * header = nsnull;

  /* Compute the hash...
   */

  nsCAutoString hashString;
  mDataHash->Finish(PR_FALSE, hashString);

  mDataHash = 0;

  status = PR_GetError();
  if (status < 0) goto FAIL;

  /* Write out the headers for the signature.
   */
  PRUint32 L;
  header =
    PR_smprintf(CRLF
          "--%s" CRLF
          "Content-Type: " APPLICATION_PKCS7_SIGNATURE
            "; name=\"smime.p7s\"" CRLF
          "Content-Transfer-Encoding: " ENCODING_BASE64 CRLF
          "Content-Disposition: attachment; "
            "filename=\"smime.p7s\"" CRLF
          "Content-Description: %s" CRLF
          CRLF,
          mMultipartSignedBoundary,
          MIME_SMIME_SIGNATURE_CONTENT_DESCRIPTION);
  if (!header) {
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto FAIL;
  }

  L = strlen(header);
  if (aOuter) {
    /* If this is the outer block, write it to the file. */
    PRUint32 n;
    rv = mStream->Write(header, L, &n);
    if (NS_FAILED(rv) || n < L) {
      rv = MK_MIME_ERROR_WRITING_FILE;
    } 
  } else {
    /* If this is an inner block, feed it through the crypto stream. */
    rv = MimeCryptoWriteBlock (header, L);
  }

  PR_Free(header);

  /* Store the SMIME receipt request
   */
  if (mSMIMEReceiptRequest && !mSMIMEReceiptRequestReceiptsTo.IsEmpty())
    cinfo->SetReceiptRequest(mSMIMEReceiptRequestSignedContentIdentifier, mSMIMEReceiptRequestReceiptsTo);

  /* Store Security Label
   */
  if (mHasSecuritylabel)
    rv = cinfo->SetSecurityLabel(NS_ConvertUTF16toUTF8(mSecurityPolicyIdentifier), mSecurityClassification, NS_ConvertUTF16toUTF8(mPrivacyMark), NS_ConvertUTF16toUTF8(mSecurityCategories));

  /* Create the signature...
   */

  PR_ASSERT(mHashType == nsICryptoHash::SHA1);

  PR_ASSERT (mSelfSigningCert);
  PR_SetError(0,0);

  rv = cinfo->CreateSigned(mSelfSigningCert,
                       mSelfEncryptionCert,
                       (unsigned char*)hashString.get(),
                       hashString.Length(),
                       mSecureHeaders, 
                       mCanonAlgorithme);
  
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Initialize the base64 encoder for the signature data.
   */
  PR_ASSERT(!mSigEncoderData);
  mSigEncoderData =
  MIME_B64EncoderInit((aOuter
            ? mime_encoder_output_fn
            : mime_nested_encoder_output_fn),
             this);
  if (!mSigEncoderData) {
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto FAIL;
  }

  /* Write out the signature.
   */
  PR_SetError(0,0);
  rv = encoder->Start(cinfo, mime_crypto_write_base64, mSigEncoderData);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  // We're not passing in any data, so no update needed.
  rv = encoder->Finish();
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Shut down the sig's base64 encoder.
   */
  rv = MIME_EncoderDestroy(mSigEncoderData, PR_FALSE);
  mSigEncoderData = 0;
  if (NS_FAILED(rv)) {
    goto FAIL;
  }

  /* Now write out the terminating boundary.
   */
  {
  PRUint32 L;
  char *header = PR_smprintf(CRLF "--%s--" CRLF,
                 mMultipartSignedBoundary);
  PR_Free(mMultipartSignedBoundary);
  mMultipartSignedBoundary = 0;

  if (!header) {
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto FAIL;
  }
  L = strlen(header);
  if (aOuter) {
    /* If this is the outer block, write it to the file. */
    PRUint32 n;
    rv = mStream->Write(header, L, &n);
    if (NS_FAILED(rv) || n < L)
      rv = MK_MIME_ERROR_WRITING_FILE;
  } else {
    /* If this is an inner block, feed it through the crypto stream. */
    rv = MimeCryptoWriteBlock (header, L);
  }
  }

FAIL:
  return rv;
}

nsresult nsMsgComposeSecure::MimeFinishSignedReceipt(nsIMsgSendReport *sendReport)
{
  nsresult rv;
  PRUint32 L;
  PRUint32 n;
  PRUint8 *encodedReceiptObject = NULL;
  PRUint32 encodedReceiptObjectLen = 0;

  nsCOMPtr<nsICMSMessage> cinfo = do_CreateInstance(NS_CMSMESSAGE_CONTRACTID, &rv);
  nsCOMPtr<nsICMSEncoder> encoder = do_CreateInstance(NS_CMSENCODER_CONTRACTID, &rv);
  char * header = nsnull;

  /* Write out the headers for the signature.
   */
  header = PR_smprintf("Content-Type: " APPLICATION_PKCS7_MIME "; smime-type=signed-receipt; name=\"smime.p7m\"" CRLF
                       "Content-Transfer-Encoding: " ENCODING_BASE64 CRLF
                       "Content-Disposition: attachment; filename=\"smime.p7m\"" CRLF
                       "Content-Description: %s" CRLF CRLF,
                       MIME_SMIME_RECEIPT_CONTENT_DESCRIPTION);

  if (!header) {
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto FAIL;
  }

  L = strlen(header);
  rv = mStream->Write(header, L, &n);
  if (NS_FAILED(rv) || n < L)
    rv = MK_MIME_ERROR_WRITING_FILE;
  PR_smprintf_free(header);

  /* Store the SMIME receipt values
   */
  cinfo->SetReceipt(mSMIMEReceiptSignedContentIdentifier,
                    mSMIMEReceiptSignedContentIdentifierLen,
                    mSMIMEReceiptOriginatorSignatureValue,
                    mSMIMEReceiptOriginatorSignatureValueLen,
                    mSMIMEReceiptOriginatorContentType,
                    mSMIMEReceiptOriginatorContentTypeLen,
                    mSMIMEReceiptMsgSigDigest,
                    mSMIMEReceiptMsgSigDigestLen);

  /* Create the signature...
   */

  PR_ASSERT (mSelfSigningCert);
  PR_SetError(0, 0);

  rv = cinfo->CreateSigned(mSelfSigningCert, mSelfEncryptionCert, NULL, 0,NULL,0);
  if (NS_FAILED(rv))  {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Create receipt object and set message digest */
  rv = cinfo->CreateReceipt(&encodedReceiptObject, &encodedReceiptObjectLen);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Initialize the base64 encoder for the signature data.
   */
  PR_ASSERT(!mSigEncoderData);
  mSigEncoderData =
  MIME_B64EncoderInit(mime_encoder_output_fn, this);
  if (!mSigEncoderData) {
    rv = NS_ERROR_OUT_OF_MEMORY;
    goto FAIL;
  }

  /* Write out the signature.
   */
  PR_SetError(0, 0);
  rv = encoder->Start(cinfo, mime_crypto_write_base64, mSigEncoderData);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Attach receipt object to the signature */
  rv = encoder->Update((char*)encodedReceiptObject, (PRInt32)encodedReceiptObjectLen);
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  rv = encoder->Finish();
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotSign").get());
    goto FAIL;
  }

  /* Shut down the sig's base64 encoder.
   */
  rv = MIME_EncoderDestroy(mSigEncoderData, PR_FALSE);
  mSigEncoderData = 0;
  if (NS_FAILED(rv))
    goto FAIL;

  rv = mStream->Write(CRLF, 2, &n);
  if (NS_FAILED(rv) || n < 2)
    rv = NS_ERROR_FAILURE;

FAIL:
  return rv;
}

/* Helper function for mime_finish_crypto_encapsulation() to close off
   an opaque crypto object (for encrypted or signed-and-encrypted messages.)
 */
nsresult nsMsgComposeSecure::MimeFinishEncryption (PRBool aSign, nsIMsgSendReport *sendReport)
{
  nsresult rv;

  /* If this object is both encrypted and signed, close off the
   signature first (since it's inside.) */
  if (aSign) {
    rv = MimeFinishMultipartSigned (PR_FALSE, sendReport);
    if (NS_FAILED(rv)) {
      goto FAIL;
    }
  }

  /* Close off the opaque encrypted blob.
   */
  PR_ASSERT(mEncryptionContext);

  if (mBufferedBytes) {
    rv = mEncryptionContext->Update(mBuffer, mBufferedBytes);
    mBufferedBytes = 0;
    if (NS_FAILED(rv)) {
      PR_ASSERT(PR_GetError() < 0);
      goto FAIL;
    }
  }
  
  rv = mEncryptionContext->Finish();
  if (NS_FAILED(rv)) {
    SetError(sendReport, NS_LITERAL_STRING("ErrorCanNotEncrypt").get());
    goto FAIL;
  }

  mEncryptionContext = 0;

  PR_ASSERT(mEncryptionCinfo);
  if (!mEncryptionCinfo) {
    rv = NS_ERROR_FAILURE;
  }
  if (mEncryptionCinfo) {
    mEncryptionCinfo = 0;
  }

  /* Shut down the base64 encoder. */
  rv = MIME_EncoderDestroy(mCryptoEncoderData, PR_FALSE);
  mCryptoEncoderData = 0;

  PRUint32 n;
  rv = mStream->Write(CRLF, 2, &n);
  if (NS_FAILED(rv) || n < 2)
    rv = NS_ERROR_FAILURE;

 FAIL:
  return rv;
}

/* Used to figure out what certs should be used when encrypting this message.
 */
nsresult nsMsgComposeSecure::MimeCryptoHackCerts(const char *aRecipients,
                                                 nsIMsgSendReport *sendReport,
                                                 PRBool aEncrypt,
                                                 PRBool aSign)
{
  char *mailbox_list = 0;
  nsCString all_mailboxes, mailboxes;
  const char *mailbox = 0;
  PRUint32 count = 0;
  nsCOMPtr<nsIX509CertDB> certdb = do_GetService(NS_X509CERTDB_CONTRACTID);
  nsresult res;
  nsCOMPtr<nsIMsgHeaderParser> pHeader = do_GetService(NS_MAILNEWS_MIME_HEADER_PARSER_CONTRACTID, &res);
  NS_ENSURE_SUCCESS(res,res);

  mCerts = do_CreateInstance(NS_ARRAY_CONTRACTID, &res);
  if (NS_FAILED(res)) {
    return res;
  }

  PR_ASSERT(aEncrypt || aSign);
  certdb->FindEmailEncryptionCert(mEncryptionCertName, getter_AddRefs(mSelfEncryptionCert));
  certdb->FindEmailSigningCert(mSigningCertName, getter_AddRefs(mSelfSigningCert));

  // must have both the signing and encryption certs to sign
  if ((mSelfSigningCert == nsnull) && aSign) {
    SetError(sendReport, NS_LITERAL_STRING("NoSenderSigningCert").get());
    res = NS_ERROR_FAILURE;
    goto FAIL;
  }

  if ((mSelfEncryptionCert == nsnull) && aEncrypt) {
    SetError(sendReport, NS_LITERAL_STRING("NoSenderEncryptionCert").get());
    res = NS_ERROR_FAILURE;
    goto FAIL;
  }

  pHeader->ExtractHeaderAddressMailboxes(nsDependentCString(aRecipients),
                                         all_mailboxes);
  pHeader->RemoveDuplicateAddresses(all_mailboxes, EmptyCString(), mailboxes);

  pHeader->ParseHeaderAddresses(mailboxes.get(), 0, &mailbox_list, &count);

  if (count < 0) return count;

  if (aEncrypt && mSelfEncryptionCert) {
    // Make sure self's configured cert is prepared for being used
    // as an email recipient cert.
    
    nsCOMPtr<nsISMimeCert> sc = do_QueryInterface(mSelfEncryptionCert);
    if (sc) {
      sc->SaveSMimeProfile();
    }
  }

  /* If the message is to be encrypted, then get the recipient certs */
  if (aEncrypt) {
    mailbox = mailbox_list;

    PRBool already_added_self_cert = PR_FALSE;

    for (; count > 0; count--) {
      nsCString mailbox_lowercase;
      ToLowerCase(nsDependentCString(mailbox), mailbox_lowercase);
      nsCOMPtr<nsIX509Cert> cert;
      certdb->FindCertByEmailAddress(nsnull, mailbox_lowercase.get(), getter_AddRefs(cert));
      PRBool foundValidCert = PR_FALSE;

      if (cert) {
        PRUint32 verification_result;

        if (NS_SUCCEEDED(
            cert->VerifyForUsage(nsIX509Cert::CERT_USAGE_EmailRecipient, &verification_result))
            &&
            nsIX509Cert::VERIFIED_OK == verification_result)
        {
          foundValidCert = PR_TRUE;
        }
      }
      
      if (!foundValidCert) {
        // Failure to find a valid encryption cert is fatal.
        // here I assume that mailbox contains ascii rather than utf8.
        SetErrorWithParam(sendReport, NS_LITERAL_STRING("MissingRecipientEncryptionCert").get(), mailbox);
        res = NS_ERROR_FAILURE;
        goto FAIL;
      }

    /* #### see if recipient requests `signedData'.
     if (...) no_clearsigning_p = PR_TRUE;
     (This is the only reason we even bother looking up the certs
     of the recipients if we're sending a signed-but-not-encrypted
     message.)
     */

      PRBool isSame;
      if (NS_SUCCEEDED(cert->Equals(mSelfEncryptionCert, &isSame))
          && isSame) {
        already_added_self_cert = PR_TRUE;
      }

      mCerts->AppendElement(cert, PR_FALSE);
      // To understand this loop, especially the "+= strlen +1", look at the documentation
      // of ParseHeaderAddresses. Basically, it returns a list of zero terminated strings.
      mailbox += strlen(mailbox) + 1;
    }
    
    if (!already_added_self_cert) {
      mCerts->AppendElement(mSelfEncryptionCert, PR_FALSE);
    }
  }
FAIL:
  if (mailbox_list) {
    nsMemory::Free(mailbox_list);
  }
  return res;
}

NS_IMETHODIMP nsMsgComposeSecure::MimeCryptoWriteBlock (const char *buf, PRInt32 size)
{
  int status = 0;
  nsresult rv;

  /* If this is a From line, mangle it before signing it.  You just know
   that something somewhere is going to mangle it later, and that's
   going to cause the signature check to fail.

   (This assumes that, in the cases where From-mangling must happen,
   this function is called a line at a time.  That happens to be the
   case.)
  */
  if (size >= 5 && buf[0] == 'F' && !strncmp(buf, "From ", 5)) {
    char mangle[] = ">";
    status = MimeCryptoWriteBlock (mangle, 1);
    if (status < 0)
    return status;
  }

  /* If we're signing, or signing-and-encrypting, feed this data into
   the computation of the hash. */
  if (mDataHash) {
    PR_SetError(0,0);
    mDataHash->Update((const PRUint8*) buf, size);
	  status = PR_GetError();
	  if (status < 0) goto FAIL;
	}

  PR_SetError(0,0);
  if (mEncryptionContext) {
	  /* If we're encrypting, or signing-and-encrypting, write this data
		 by filtering it through the crypto library. */

    /* We want to create equally sized encryption strings */
    const char *inputBytesIterator = buf;
    PRUint32 inputBytesLeft = size;

    while (inputBytesLeft) {
      const PRUint32 spaceLeftInBuffer = eBufferSize - mBufferedBytes;
      const PRUint32 bytesToAppend = NS_MIN(inputBytesLeft, spaceLeftInBuffer);

      memcpy(mBuffer+mBufferedBytes, inputBytesIterator, bytesToAppend);
      mBufferedBytes += bytesToAppend;
      
      inputBytesIterator += bytesToAppend;
      inputBytesLeft -= bytesToAppend;

      if (eBufferSize == mBufferedBytes) {
        rv = mEncryptionContext->Update(mBuffer, mBufferedBytes);
        mBufferedBytes = 0;
        if (NS_FAILED(rv)) {
          status = PR_GetError();
          PR_ASSERT(status < 0);
          if (status >= 0) status = -1;
          goto FAIL;
        }
      }
    }
  } else {
	  /* If we're not encrypting (presumably just signing) then write this
		 data directly to the file. */

    PRUint32 n;
    rv = mStream->Write(buf, size, &n);
    if (NS_FAILED(rv) || n < size) {
      return MK_MIME_ERROR_WRITING_FILE;
    }
  }
 FAIL:
  return status;
}




/*
 * Supprime les sauts de ligne.
 */
nsAutoString& removeJumpSymb(nsAutoString& s)
{
	s.ReplaceSubstring(NS_LITERAL_STRING("\n\r"), NS_LITERAL_STRING(""));
	s.ReplaceSubstring(NS_LITERAL_STRING("\r\n"), NS_LITERAL_STRING(""));
	s.ReplaceSubstring(NS_LITERAL_STRING("\r"), NS_LITERAL_STRING(""));
	s.ReplaceSubstring(NS_LITERAL_STRING("\n"), NS_LITERAL_STRING(""));
	s.Append(NS_LITERAL_STRING("\r\n"));
	return s;
}

/*
 * Transforme les tabulations et les occurences multiples d'espace en un espace unique.
 */
nsAutoString& onlyOneWhiteSpace(nsAutoString& s)
{
	s.ReplaceSubstring(NS_LITERAL_STRING("\t"), NS_LITERAL_STRING(" "));
	s.ReplaceSubstring(NS_LITERAL_STRING("  "), NS_LITERAL_STRING(" "));
	return s;
}


nsAutoString& canonilizeHeaderValue(nsAutoString &hdrval)
{
	removeJumpSymb(hdrval);
	onlyOneWhiteSpace(hdrval);
	hdrval.CompressWhitespace();
	return hdrval;
}

nsAutoString& canonilizeHeaderName(nsAutoString &hdrname)
{
	nsCAutoString utf8str =  NS_ConvertUTF16toUTF8(hdrname);
	ToLowerCase(utf8str);
	hdrname = NS_ConvertUTF8toUTF16(utf8str);
	onlyOneWhiteSpace(hdrname);
	hdrname.CompressWhitespace();
	return hdrname;
}

void strsplit(const char separator, nsAString& strToSplit, nsStringArray & result)
{
    PRInt32 start = 0;
    PRInt32 end = 0;
    PRInt32 len = 0;

    while (end != -1) {
      end = strToSplit.FindChar(separator,start);
      if (end == -1) {
        len = strToSplit.Length() - start;
      } else {
        len = end - start;
      }
      // grab the name of the current header pref
     const nsAString& str_tmp = Substring(strToSplit, start, end);

      start = end + 1;
	  result.AppendString(str_tmp);
    }
	
}

void parseHeaderValue(const nsAString & str, const nsAString& headerName, nsAString & headerVal)
{
	nsVoidArray tab_header;
	nsAutoString ligne_header;
	nsAutoString tmpstr(str);
	nsAString::const_iterator cur_pos_str,cur_pos_CRLF,start,end;

	tmpstr.BeginReading(start);
	tmpstr.EndReading(end);
	
	cur_pos_str=start;
	cur_pos_CRLF=end;
	NS_NAMED_LITERAL_STRING(valuePrefix, "\r\n");
	
	while(FindInReadable(valuePrefix, start, end))
	{
		cur_pos_CRLF = end;
		if(*cur_pos_CRLF == PRUnichar(' '))
		{
			ligne_header.Append(Substring(cur_pos_CRLF.start(),cur_pos_CRLF.get()-2));
			tmpstr.Replace(0,end.get()-end.start()+1,NS_LITERAL_STRING(""));
		}
		else
		{
			ligne_header.Append(Substring(cur_pos_CRLF.start(),cur_pos_CRLF.get()));
			nsAutoString _hdrName;
			nsAutoString _hdrValue;
			
			_hdrName.Assign(Substring(ligne_header,0,ligne_header.FindChar(':',0)));
			_hdrValue.Assign(Substring(ligne_header,ligne_header.FindChar(':',0)+2,ligne_header.Length()-ligne_header.FindChar(':',0)+1));
			if(_hdrName.Equals(headerName)){
				headerVal.Assign(_hdrValue);
				break;
			}	
			ligne_header.Assign(NS_LITERAL_STRING(""));
			tmpstr.Replace(0,end.get()-end.start(),NS_LITERAL_STRING(""));
		}
		
		tmpstr.BeginReading(start);
		tmpstr.EndReading(end);
	}
}

void GetValueHeader(nsAString& headerName,nsIMsgCompFields * aComposeFields, nsAString & result)
{
	nsresult rv;
	nsAutoString otherHeaders;
	nsAutoString to;
    nsAutoString from;
	nsAutoString subject;
	nsAutoString cc;
	nsAutoString bcc;
	nsAutoString body;
	nsAutoString messageId;
	nsAutoString priority;
	nsAutoString replyTo;
	nsAutoString charset;
	aComposeFields->GetTo(to);
	aComposeFields->GetFrom(from);
	aComposeFields->GetSubject(subject);
	aComposeFields->GetCc(cc);
	aComposeFields->GetBcc(bcc);
	aComposeFields->GetBody(body);
	aComposeFields->GetOtherRandomHeaders(otherHeaders);
	aComposeFields->GetReplyTo(replyTo);
	char * tmp;
	aComposeFields->GetMessageId(&tmp);
	messageId=NS_ConvertASCIItoUTF16(tmp);
	aComposeFields->GetPriority(&tmp);
	priority=NS_ConvertASCIItoUTF16(tmp);
	aComposeFields->GetCharacterSet(&tmp);
	charset=NS_ConvertASCIItoUTF16(tmp);
	if(charset.IsEmpty()){
		aComposeFields->GetDefaultCharacterSet(&tmp);
		charset=NS_ConvertASCIItoUTF16(tmp);
	}

	//replace the tabulation by a space for each header
	//which can be multiline to simplify the treatment
	to.ReplaceSubstring(NS_LITERAL_STRING("\t"), NS_LITERAL_STRING(" "));
	cc.ReplaceSubstring(NS_LITERAL_STRING("\t"), NS_LITERAL_STRING(" "));
	bcc.ReplaceSubstring(NS_LITERAL_STRING("\t"), NS_LITERAL_STRING(" "));

	if(headerName.LowerCaseEqualsLiteral("from")){
		if(!from.IsEmpty())
			result.Assign(from);
	}
	else if(headerName.LowerCaseEqualsLiteral("to")){
		if(!to.IsEmpty())
			result.Assign(to);
	}
	else if(headerName.LowerCaseEqualsLiteral("body")){
		if(!body.IsEmpty())
			result.Assign(body);
	}
	else if(headerName.LowerCaseEqualsLiteral("subject")){
		if(!subject.IsEmpty()){
			nsCOMPtr<nsIMimeConverter> mimeconverter = do_GetService(NS_MIME_CONVERTER_CONTRACTID, &rv);
			tmp=NULL;
			mimeconverter->EncodeMimePartIIStr_UTF8(NS_ConvertUTF16toUTF8(subject),PR_FALSE,NS_ConvertUTF16toUTF8(charset).get(),0,77,&tmp);
			if(tmp!=NULL)
			{
				result.Assign(NS_ConvertUTF8toUTF16(tmp));
			}
			else{
				result.Assign(subject);
			}
			
		}
	}
	else if(headerName.LowerCaseEqualsLiteral("cc")){
		if(!cc.IsEmpty())
			result.Assign(cc);
	}
	else if(headerName.LowerCaseEqualsLiteral("bcc")){
		if(!bcc.IsEmpty())
			result.Assign(bcc);
	}
	else if(headerName.LowerCaseEqualsLiteral("message-id")){
		if(!messageId.IsEmpty())
			result.Assign(messageId);
	}
	else if(headerName.LowerCaseEqualsLiteral("priority")){
		if(!priority.IsEmpty())
			result.Assign(priority);
	}
	else if(headerName.LowerCaseEqualsLiteral("reply-to")){
		if(!replyTo.IsEmpty())
			result.Assign(replyTo);
	}
	else{
		parseHeaderValue(otherHeaders,headerName,result);
	}
}

nsresult nsMsgComposeSecure::ReadHeadersToSecure(nsIMsgIdentity * aIdentity,nsIMsgCompFields * aComposeFields){

  //Extract Signed Headers list
   nsCOMPtr<nsISupports> securityInfo;
  if (aComposeFields)
  {
    aComposeFields->GetSecurityInfo(getter_AddRefs(securityInfo));

    if (securityInfo) // if we were given security comp fields, use them.....
    {
      nsCOMPtr<nsIMsgSMIMECompFields> smimeCompFields = do_QueryInterface(securityInfo);
      if (smimeCompFields)
      {
		nsCOMPtr<nsIMutableArray> tmpHeaders;
        smimeCompFields->GetSecureHeadersList(getter_AddRefs(tmpHeaders));
		smimeCompFields->GetCanonAlgorithme(&mCanonAlgorithme);
		if(tmpHeaders)
		{
			nsresult rv;
			mSecureHeaders = do_CreateInstance(NS_ARRAY_CONTRACTID, &rv);
			PRUint32 nbHeaders;
			tmpHeaders->GetLength(&nbHeaders);
			for(int i=0;i<nbHeaders;++i)
			{
				nsCOMPtr<nsIMsgSMIMESecureHeader> _secureHeader= do_QueryElementAt(tmpHeaders,i);
				if(_secureHeader)
				{
					nsAutoString _headerName;
					nsAutoString _headerValue;
					PRInt32 _headerStatus;
					_secureHeader->GetHeaderName(_headerName);
					GetValueHeader(_headerName,aComposeFields,_headerValue);
					if(!_headerValue.IsEmpty()){
						if(mCanonAlgorithme){
							canonilizeHeaderName(_headerName);
							canonilizeHeaderValue(_headerValue);
						}
						_secureHeader->SetHeaderName(_headerName);
						_secureHeader->SetHeaderValue(_headerValue);
						mSecureHeaders->AppendElement(_secureHeader,PR_FALSE);
					}
				}
			}
		}
	  }
    }
  }

	return NS_OK;
}

/* Returns a string consisting of a Content-Type header, and a boundary
   string, suitable for moving from the header block, down into the body
   of a multipart object.  The boundary itself is also returned (so that
   the caller knows what to write to close it off.)
 */
static int
make_multipart_signed_header_string(PRBool outer_p,
									char **header_return,
									char **boundary_return)
{
  *header_return = 0;
  *boundary_return = mime_make_separator("ms");
  const char * crypto_multipart_blurb = nsnull;

  if (!*boundary_return)
	return NS_ERROR_OUT_OF_MEMORY;

  if (outer_p) {
	  crypto_multipart_blurb = MIME_MULTIPART_SIGNED_BLURB;
  }

  *header_return = PR_smprintf(
        "Content-Type: " MULTIPART_SIGNED "; "
        "protocol=\"" APPLICATION_PKCS7_SIGNATURE "\"; "
				"micalg=" PARAM_MICALG_SHA1 "; "
				"boundary=\"%s\"" CRLF
				CRLF
				"%s%s"
				"--%s" CRLF,

				*boundary_return,
				(crypto_multipart_blurb ? crypto_multipart_blurb : ""),
				(crypto_multipart_blurb ? CRLF CRLF : ""),
				*boundary_return);

  if (!*header_return) {
	  PR_Free(*boundary_return);
	  *boundary_return = 0;
	  return NS_ERROR_OUT_OF_MEMORY;
	}

  return 0;
}

/* Used as the output function of a SEC_PKCS7EncoderContext -- we feed
   plaintext into the crypto engine, and it calls this function with encrypted
   data; then this function writes a base64-encoded representation of that
   data to the file (by filtering it through the given MimeEncoderData object.)

   Also used as the output function of SEC_PKCS7Encode() -- but in that case,
   it's used to write the encoded representation of the signature.  The only
   difference is which MimeEncoderData object is used.
 */
static void
mime_crypto_write_base64 (void *closure, const char *buf,
						  unsigned long size)
{
  MimeEncoderData *data = (MimeEncoderData *) closure;
  int status = MIME_EncoderWrite (data, buf, size);
  PR_SetError(status < 0 ? status : 0, 0);
}


/* Used as the output function of MimeEncoderData -- when we have generated
   the signature for a multipart/signed object, this is used to write the
   base64-encoded representation of the signature to the file.
 */
nsresult mime_encoder_output_fn(const char *buf, PRInt32 size, void *closure)
{
  nsMsgComposeSecure *state = (nsMsgComposeSecure *) closure;
  nsCOMPtr<nsIOutputStream> stream;
  state->GetOutputStream(getter_AddRefs(stream));
  PRUint32 n;
  nsresult rv = stream->Write((char *) buf, size, &n);
  if (NS_FAILED(rv) || n < size)
    return MK_MIME_ERROR_WRITING_FILE;
  else
    return 0;
}

/* Like mime_encoder_output_fn, except this is used for the case where we
   are both signing and encrypting -- the base64-encoded output of the
   signature should be fed into the crypto engine, rather than being written
   directly to the file.
 */
static nsresult
mime_nested_encoder_output_fn (const char *buf, PRInt32 size, void *closure)
{
  nsMsgComposeSecure *state = (nsMsgComposeSecure *) closure;
  return state->MimeCryptoWriteBlock ((char *) buf, size);
}
