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
#ifndef MESSAGECOMPOSESERVICE_I_H_
#define MESSAGECOMPOSESERVICE_I_H_

#include "Services.h"
#include "nsIMsgComposeParams.h"
#include "nsIMsgIdentity.h"
#include "nsIServiceManager.h"

/*!
 * Corba MessageComposeServicePOA Implementation
 */
class MessageComposeService_i : public POA_MessageComposeService
{
public:

  /*!
   *  This method is used to Send a Message
   *  \param p_account is the account that will be used to send the message (FROM)
   *  \param p_message is the message to send 
   *  \param p_listener is the listener, which receives the sending process events
   */
  virtual void SendMessage(const Account& p_account, const CMessage& p_message,
                           MessageSendListener_ptr p_listener,
                           ::CORBA::Boolean openComposeWindowOnBadFormat);

  MessageComposeService_i();
  virtual ~MessageComposeService_i();

private:
  /*!
   * Helper method used to prepare Message Sending Process
   */
  void FillMsgComposeParams(const CMessage& p_message,
                            nsIMsgComposeParams * pMsgComposeParams);
  void GetMsgAccount(nsIMsgIdentity * * pMsgIdentity, const Account& p_account);
  
  /*!
   * Helper method used to control Format of the recipients addresse
   */
  bool ControlFormat(const Addresses& recipients);
  
  /*!
   * Helper method used to show Composition Window filled by message attributes
   */
  void ShowMessageCompositionWindow(nsIMsgComposeParams * pMsgComposeParams);
  
  /*!
     * Helper method used add custom headers to message
     */
  void AddCustomHeaders(nsIMsgCompFields * pMsgCompFields, const Headers& headers);
  
  void AddAttachment(nsIMsgCompFields * pMsgCompFields, const Attachments& attachments);
  
  PRBool IsFile(const Attachment& attachment);
  
  nsCOMPtr<nsIServiceManager> svcMgr;
 
};

#endif /*MESSAGECOMPOSESERVICE_I_H_*/
