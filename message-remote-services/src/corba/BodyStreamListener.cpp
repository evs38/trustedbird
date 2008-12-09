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

#include "BodyStreamListener.h"
#include "nsString.h"
#include "nsIDOMParser.h"
#include "nsIDOMNodeList.h"
#include "nsIDOMNode.h"
#include "nsIDOMDocument.h"
#include "nsIDOMNamedNodeMap.h"
#include "nsMsgUtils.h"
#include "Utils.h"
#include "nsReadLine.h"


#include <iostream>

using namespace std;

NS_IMPL_ISUPPORTS1(BodyStreamListener,nsIStreamListener)

nsresult BodyStreamListener::OnDataAvailable(nsIRequest *aRequest,
		nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset,
		PRUint32 aCount) {
	nsCAutoString content;
	nsCAutoString line;
	nsLineBuffer<char> * lineBuffer;
	nsresult rv = NS_InitLineBuffer(&lineBuffer);
	PRBool moreData=PR_TRUE;
	PRUint32 len = aCount;

	PRBool inBody = PR_FALSE;

	while (len> 0 && moreData)
	{
		NS_ReadLine(aInputStream, lineBuffer,line,&moreData);
		cout << "line : " << line.get() << endl;
		len -= MSG_LINEBREAK_LEN;
		len -= line.Length();

		if (line.IsEmpty()) {
			inBody = PR_TRUE;
			continue;
		}

		if (inBody) {
			content+=line;
			content+="\n";
		}
	}

	m_bodyListener->OnLoad(content.get());

	return NS_OK;

}



nsresult BodyStreamListener::OnStartRequest(nsIRequest* aRequest, nsISupports* aContext) {
	m_done = PR_FALSE;
	return NS_OK;
}

nsresult BodyStreamListener::OnStopRequest(nsIRequest* aRequest, nsISupports* aContext, nsresult rv) {
	m_done = PR_TRUE;
	return NS_OK;
}
