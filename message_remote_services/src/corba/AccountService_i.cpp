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
#include "AccountService_i.h"
#include "nsXPCOM.h"
#include "nsIServiceManager.h"
#include "nsIMsgAccountManager.h"
#include "nsCOMPtr.h"
#include "nsStringAPI.h"
#include "Utils.h"

#ifdef MRS_LOG

#ifdef XP_WIN
#define INFO(x) \
	logger.Info(x, "MRS");
#else
#define INFO(x) \
	logger.Info(x, __PRETTY_FUNCTION__);
#endif

#else

#define INFO(x)

#endif

using namespace std;

AccountService_i::AccountService_i() {
}

AccountService_i::~AccountService_i() {
}

//TODO List all Accounts
CAccounts * AccountService_i::GetAllAccounts() {
  INFO("Accounts getting process is beginning")

  nsresult rv;

  nsCOMPtr<nsIServiceManager> servMan;
  rv = NS_GetServiceManager(getter_AddRefs(servMan));
  ENSURE_SUCCESS(rv, "Cannot create NS_GetServiceManager");

  nsCOMPtr<nsIMsgAccountManager> pMsgAccountManager;

  rv = servMan->GetServiceByContractID(
      "@mozilla.org/messenger/account-manager;1",
      NS_GET_IID(nsIMsgAccountManager), getter_AddRefs(pMsgAccountManager));

  ENSURE_SUCCESS(rv,"Cannot create nsIMsgAccountManager");

  nsCOMPtr <nsISupportsArray> msgAccounts;
  rv = pMsgAccountManager->GetAccounts(getter_AddRefs(msgAccounts));
  ENSURE_SUCCESS(rv,"Cannot GetAccounts From nsIMsgAccountManager");

  PRUint32 count;
  msgAccounts->Count(&count);

  CAccounts * accounts = new CAccounts();
  accounts->length(count);

  for (int i=0; i < count; i++) {

    nsCOMPtr<nsIMsgAccount> msgAccount = do_QueryElementAt(msgAccounts, i);
    nsCOMPtr <nsIMsgIncomingServer> incomingServer;
    rv = msgAccount->GetIncomingServer(getter_AddRefs(incomingServer));

    ENSURE_SUCCESS(rv,"Cannot get nsIMsgAccount From nsIMsgIncomingServer");

    nsXPIDLCString hostname;
    rv = incomingServer->GetHostName(getter_Copies(hostname));
    CAccount * account = new CAccount();

    nsXPIDLCString accountKey;
    rv = msgAccount->GetKey(getter_Copies(accountKey));

    ENSURE_SUCCESS(rv,"Cannot GetKey From nsIMsgAccount");

    account->key = accountKey;
    account->serverHostName = hostname;

    (*(accounts))[i]=*account;

  }

  INFO("Accounts getting process is finished")

  return accounts;
}
