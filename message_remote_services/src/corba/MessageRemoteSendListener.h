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
#ifndef MESSAGEREMOTESENDLISTENER_H_
#define MESSAGEREMOTESENDLISTENER_H_

#include "MessageComposeService_i.h"
#include "nsIMsgSendListener.h"

using namespace std;

class MessageRemoteSendListener : public nsIMsgSendListener
{
public:
  MessageRemoteSendListener(MessageSendListener_ptr p_listener,const CMessage& msg):p_listener(p_listener),msg(msg){
    m_done = PR_FALSE;   
  }
  
  virtual ~MessageRemoteSendListener();

  // nsISupports interface
  NS_DECL_ISUPPORTS

  /* void OnStartSending (in string aMsgID, in PRUint32 aMsgSize); */
  NS_IMETHOD OnStartSending(const char *aMsgID, PRUint32 aMsgSize) {
    return NS_OK;
  }

  /* void OnProgress (in string aMsgID, in PRUint32 aProgress, in PRUint32 aProgressMax); */
  NS_IMETHOD OnProgress(const char *aMsgID, PRUint32 aProgress, PRUint32 aProgressMax) {
    return NS_OK;
  }

  /* void OnStatus (in string aMsgID, in wstring aMsg); */
  NS_IMETHOD OnStatus(const char *aMsgID, const PRUnichar *aMsg) {
    return NS_OK;}

  /* void OnStopSending (in string aMsgID, in nsresult aStatus, in wstring aMsg, in nsIFileSpec returnFileSpec); */
  NS_IMETHOD OnStopSending(const char *aMsgID, nsresult aStatus, const PRUnichar *aMsg,
      nsIFileSpec *returnFileSpec) {
    bool success = false;

    if (aStatus == 0)
      success = true;

    p_listener->OnStop(msg.uuid, success);
    m_done = PR_TRUE;
    return NS_OK;
  }

  /* void OnSendNotPerformed */
  NS_IMETHOD OnSendNotPerformed(const char *aMsgID, nsresult aStatus)
  {
    return OnStopSending(aMsgID, aStatus, nsnull, nsnull);
  }

  /* void OnGetDraftFolderURI (); */
  NS_IMETHOD OnGetDraftFolderURI(const char *aFolderURI) {return NS_OK;}


  PRBool IsDone() {
    return m_done;
  }
  
private :
  PRBool m_done;
  MessageSendListener_ptr p_listener;
  CMessage msg;

};

#endif /*MESSAGEREMOTESENDLISTENER_H_*/
