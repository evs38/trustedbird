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
#ifndef MESSAGEREMOTESERVICE_
#define MESSAGEREMOTESERVICE_

#include "IMessageRemoteService.h"
#include "AccountService_i.h"
#include "MessageComposeService_i.h"
#include <omniORB4/CORBA.h>
#include "prthread.h"

#define MESSAGE_REMOTE_SERVICE_CONTRACTID "@milimail.org/MessageRemoteService;1"
#define MESSAGE_REMOTE_SERVICE_CLASSNAME "Message Remote Service XPCOM"
#define MESSAGE_REMOTE_SERVICE_CID  \
  {0x4063ea47, 0x8aa8, 0x49d0, \
    { 0x9f, 0x65, 0x5c, 0xe2, 0x2c, 0xbd, 0x2a, 0x5f }}


class MessageRemoteService : public IMessageRemoteService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IMESSAGEREMOTESERVICE

  MessageRemoteService();

private:
  ~MessageRemoteService();
  
  /*!
   * Helper Method used to save IOR of corba service to local file in the
   * directory .milimail in the home directory
   * \param ior is the IOR of service
   * \param fileName is the name of the file wich contains the ior
   */
  NS_IMETHODIMP SaveServiceIOR(const char * const ior, const char * const fileName);
  
  CORBA::ORB_ptr orb;
  PRThread * orbThread;
  AccountService_i * accountService;
  MessageComposeService_i * messageComposeService;
  PRBool isStarted;
  
  /*!
   * 
   * Thread method wich is used to launch all services, to prevent UI blocking
   * \param orb is used to launch the corba server
   */
  static void InternalThreadFunc(void * orb);
protected:
  /* additional members */
};

#endif /*MESSAGEREMOTESERVICE_*/
