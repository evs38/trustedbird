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

#include "HeadersStreamListener.h"
#include "nsString.h"
#include "nsIDOMParser.h"
#include "nsIDOMNodeList.h"
#include "nsIDOMNode.h"
#include "nsIDOMDocument.h"
#include "nsIDOMNamedNodeMap.h"
#include "nsMsgUtils.h"
#include "Utils.h"
#include <iostream>

using namespace std;

NS_IMPL_ISUPPORTS1(HeadersStreamListener,nsIStreamListener)

nsresult HeadersStreamListener::OnDataAvailable(nsIRequest *aRequest,
		nsISupports *aContext, nsIInputStream *aInputStream, PRUint32 aOffset,
		PRUint32 aCount) {
	nsCAutoString content;

	char buf[aCount];
	PRUint32 ret, size;
	nsresult rv;
	PRUint32 count = aCount;

	while(aCount)
	{
		size = PR_MIN(aCount, sizeof(buf));
		rv = aInputStream->Read(buf, size, &ret);
		content.Append(buf,ret);

		aCount -= ret;
	}

	CHeaders * headers;
	DecodeXMLOutput(content.get(), count, &headers);

	m_headersListener->OnLoad(*headers);

	return NS_OK;

}

nsresult HeadersStreamListener::DecodeXMLOutput(const char * aBuff, PRUint32 aCount, CHeaders ** aHeaders){
	nsresult rv;
	*aHeaders = new CHeaders();
	CHeaders * headers = *aHeaders;

	nsCOMPtr<nsIDOMParser> pParser = do_CreateInstance(
			"@mozilla.org/xmlextras/domparser;1", &rv);
	nsCOMPtr<nsIDOMDocument> pDoc;
	rv= pParser->ParseFromBuffer(NS_REINTERPRET_CAST(const PRUint8 *, aBuff),
		aCount,
		"text/xml",
		getter_AddRefs(pDoc));
	ENSURE_SUCCESS(rv, "Cannot ParseFromBuffer on nsIDOMParser");

	//Get message element
	nsCOMPtr<nsIDOMNode> pNode;
	pDoc->GetLastChild(getter_AddRefs(pNode));

	//Get mailheader element
	nsCOMPtr<nsIDOMNode> pNodeMailHeader;
	rv = pNode->GetFirstChild(getter_AddRefs(pNodeMailHeader));

	//Get all headers childs
	nsCOMPtr<nsIDOMNodeList> pNodeHeadersList;
	rv = pNodeMailHeader->GetChildNodes(getter_AddRefs(pNodeHeadersList));

	PRUint32 length;
	pNodeHeadersList->GetLength(&length);
	cout << "List DOMElement Header length : " << length << endl;

	for (PRUint32 i=0; i < length; i++)
	{	nsCOMPtr<nsIDOMNode> headerNode;
		nsCOMPtr<nsIDOMNamedNodeMap> attrMap;

		rv = pNodeHeadersList->Item(i, getter_AddRefs(headerNode));

		rv = headerNode->GetAttributes(getter_AddRefs(attrMap));

		PRUint32 l;
		attrMap->GetLength(&l);
		CHeader header;

		for(PRUint32 j=0; j < l; j++)
		{
			nsCOMPtr<nsIDOMNode> att;
			rv = attrMap->Item(j, getter_AddRefs(att));
			nsAutoString n;
			rv = att->GetNodeValue(n);
			header.key = NS_ConvertUTF16toUTF8(n).get();
		}

		nsCOMPtr<nsIDOMNode> no;
		rv = headerNode->GetLastChild(getter_AddRefs(no));

		nsAutoString v;
		rv = no->GetNodeValue(v);
		header.value = NS_ConvertUTF16toUTF8(v).get();

		headers->length(i+1);
		(*headers)[i] = header;
	}
}

nsresult HeadersStreamListener::OnStartRequest(nsIRequest* aRequest, nsISupports* aContext) {
	m_done = PR_FALSE;
	return NS_OK;
}

nsresult HeadersStreamListener::OnStopRequest(nsIRequest* aRequest, nsISupports* aContext, nsresult rv) {
	m_done = PR_TRUE;
	return NS_OK;
}
