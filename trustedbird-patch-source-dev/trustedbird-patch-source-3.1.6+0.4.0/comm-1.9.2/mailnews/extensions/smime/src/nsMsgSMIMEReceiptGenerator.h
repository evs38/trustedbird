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

#ifndef _nsMsgSMIMEReceiptGenerator_H_
#define _nsMsgSMIMEReceiptGenerator_H_

#include "nsIMsgSMIMEReceiptGenerator.h"
#include "nsCOMPtr.h"
#include "nsIUrlListener.h"
#include "nsIMsgHdr.h"
#include "nsIMsgIncomingServer.h"
#include "nsIOutputStream.h"
#include "nsIFile.h"
#include "nsIMsgIdentity.h"
#include "nsIMsgWindow.h"
#include "nsIMimeHeaders.h"
#include "nsString.h"
#include "nsMsgComposeSecure.h"

class nsMsgSMIMEReceiptGenerator : public nsIMsgSMIMEReceiptGenerator, public nsIUrlListener
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIMSGSMIMERECEIPTGENERATOR
  NS_DECL_NSIURLLISTENER

  nsMsgSMIMEReceiptGenerator();
  virtual ~nsMsgSMIMEReceiptGenerator();

private:
  nsresult CreateMessage();
  nsresult CreateMessageHeaders();
  nsresult WriteString(const char *aStr);
  nsresult SendMessage();
  nsresult GetIdentity();
  nsresult StoreSMIMEReceiptSentFlag();

private:
  nsCOMPtr<nsIMsgWindow> m_window;
  nsCOMPtr<nsIOutputStream> m_outputStream;
  nsCOMPtr<nsIFile> m_file;
  nsCOMPtr<nsIMsgIdentity> m_identity;
  nsCString m_recipient;
  nsCOMPtr<nsIMsgFolder> m_folder;
  nsMsgKey m_key;
  nsCOMPtr<nsIMsgDBHdr> m_msghdr;
  nsCOMPtr<nsIMsgIncomingServer> m_server;
  nsCOMPtr<nsIMimeHeaders> m_headers;
  nsCOMPtr<nsIMsgComposeSecure> m_composeSecure;
  nsCOMPtr<nsIMsgSMIMECompFields> m_SMIMECompFields;
  PRUint8 *m_signedContentIdentifier;
  PRUint32 m_signedContentIdentifierLen;
  PRUint8 *m_originatorSignatureValue;
  PRUint32 m_originatorSignatureValueLen;
  PRUint8 *m_originatorContentType;
  PRUint32 m_originatorContentTypeLen;
  PRUint8 *m_msgSigDigest;
  PRUint32 m_msgSigDigestLen;
};

#endif // _nsMsgSMIMEReceiptGenerator_H_
