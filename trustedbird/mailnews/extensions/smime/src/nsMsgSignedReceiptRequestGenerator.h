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
#ifndef _NSMSGSIGNEDRECEIPTREQUESTGENERATOR_H_
#define _NSMSGSIGNEDRECEIPTREQUESTGENERATOR_H_

#include "nsIMsgSignedReceiptRequestGenerator.h"
#include "nsXPIDLString.h"
#include "nsIFileSpec.h"
#include "nsIMsgIdentity.h"
#include "nsIMsgIncomingServer.h"
#include "nsFileStream.h"
#include "nsIMimeHeaders.h"
#include "nsIUrlListener.h"
#include "nsIMsgWindow.h"
#include "nsMsgComposeSecure.h"

class nsMsgSignedReceiptRequestGenerator : public nsIMsgSignedReceiptRequestGenerator, public nsIUrlListener
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIMSGSIGNEDRECEIPTREQUESTGENERATOR
    NS_DECL_NSIURLLISTENER

    nsMsgSignedReceiptRequestGenerator();
    virtual ~nsMsgSignedReceiptRequestGenerator();

private:
    nsresult Init();
    nsresult CreateReceiptMsg();
    nsresult CreateMsgHeader();
    nsresult CreateMsgContent();
    nsresult SendReceiptMsg();
    nsresult StoreMDNSentFlag(nsIMsgFolder *folder, nsMsgKey key);
    void AlertUnableToSendReceiptMsg(nsIMsgWindow *aWindow);
    nsresult WriteString(const char *str);
    nsresult WriteSignedString(const char *str);
    PRBool MailAddrMatch(const char *addr1, const char *addr2);

    // string bundle helper methods
    nsresult GetStringFromName(const PRUnichar *aName, PRUnichar **aResultString);
    nsresult FormatStringFromName(const PRUnichar *aName, const PRUnichar *aString, PRUnichar **aResultString);

private:
    nsXPIDLCString m_to;
    nsXPIDLCString m_from;
    nsXPIDLCString m_messageId;
    nsXPIDLCString m_charset;
    nsCOMPtr<nsIMsgFolder> m_folder;
    nsCOMPtr<nsIMsgIncomingServer> m_server;
    nsCOMPtr<nsIMimeHeaders> m_headers;
    nsCOMPtr<nsIMsgIdentity> m_identity;
    nsCOMPtr<nsIOutputStream> m_outputStream;
    nsCOMPtr<nsIFileSpec> m_fileSpec;
    nsCOMPtr<nsIMsgComposeSecure> m_secureCompose;
};

#endif
