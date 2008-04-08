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
#include "MessageRemoteService.h"
#include <iostream>

#include <prthread.h>
#include "nsILocalFile.h"
#include "nsIFileStreams.h"
#include "nsXPCOM.h"
#include "nsComponentManagerUtils.h"
#include "nsCOMPtr.h"
#include "nsString.h"
#include "nsServiceManagerUtils.h"

#include "nsDirectoryServiceDefs.h"
#include "nsIDirectoryService.h"
#include "nsIProperties.h"

#include <fstream>

/* Implementation file */
NS_IMPL_ISUPPORTS1(MessageRemoteService, IMessageRemoteService)

MessageRemoteService::MessageRemoteService()
{
  /* member initializers and constructor code */
}

MessageRemoteService::~MessageRemoteService() {
  /* destructor code */
}

/* void Start (); */
NS_IMETHODIMP MessageRemoteService::Start() {
  const char* options[][2] = { { "traceLevel", "50" }, { "endPoint",
      "giop:tcp:localhost:1449" }, { 0, 0 } };

  char ** c= NULL;
  int a = 0;

  orb = CORBA::ORB_init(a, c, "omniORB4", options);
  cout << "Corba ORB init" << endl;

  // init POA
  CORBA::Object_var poa_obj = orb->resolve_initial_references("RootPOA");
  PortableServer::POA_var poa = PortableServer::POA::_narrow(poa_obj);
  PortableServer::POAManager_var manager = poa->the_POAManager();

  manager->activate();

  // create service
  accountService = new AccountService_i();
  cout << "AccountService Service created " << endl;
  
  messageComposeService = new MessageComposeService_i();
  cout << "MessageComposeService Service created " << endl;
 
  
  //Print IOR
  cout << "Print IOR AccountService" << endl;
  CORBA::Object_var accountService_obj = accountService->_this();
  CORBA::String_var accountService_sior(orb->object_to_string(accountService_obj));
  nsresult rv = SaveServiceIOR((char*)accountService_sior,"AccountService.ior");
  NS_ENSURE_SUCCESS(rv, rv);
  //accountService->_remove_ref();

  cout << "Print IOR MessageComposeService" << endl;
  CORBA::Object_var composeService_obj = messageComposeService->_this();
  CORBA::String_var composeService_sior(orb->object_to_string(composeService_obj));
  rv = SaveServiceIOR((char*)composeService_sior,"MessageComposeService.ior");
  NS_ENSURE_SUCCESS(rv, rv);
  //messageComposeService->_remove_ref();

  
  cout << "Launch Thread " << endl;
  //Launch Thread
  orbThread = PR_CreateThread(PR_USER_THREAD, InternalThreadFunc,
      (void *)(orb), PR_PRIORITY_NORMAL, PR_GLOBAL_THREAD, PR_JOINABLE_THREAD,
      0);

  return NS_OK;
}

/* void Stop (); */
NS_IMETHODIMP MessageRemoteService::Stop() {

  orb->destroy();
  delete accountService;
  delete messageComposeService;
  return NS_OK;
}

/* End of implementation class template. */

void MessageRemoteService::InternalThreadFunc(void *orb) {

  cout << "Orb run From Thread" << endl;
  ((CORBA::ORB_ptr)orb)->run();

  cout << "ExitFrom Thread" << endl;
}

NS_IMETHODIMP MessageRemoteService::SaveServiceIOR(const char * const ior, const char * const fileName) {
  nsresult rv;
  nsCOMPtr<nsILocalFile> file;
  cout << "MessageRemoteService" << endl;
  nsCOMPtr<nsIServiceManager> svcMgr;
  rv = NS_GetServiceManager(getter_AddRefs(svcMgr));
  
  NS_ENSURE_SUCCESS(rv, rv);

  nsCOMPtr<nsIProperties> pDirectoryService;
  rv = svcMgr->GetServiceByContractID("@mozilla.org/file/directory_service;1",
      NS_GET_IID(nsIProperties), getter_AddRefs(pDirectoryService));
  
  NS_ENSURE_SUCCESS(rv, rv);

  //Get Home User Path
  pDirectoryService->Get(NS_OS_HOME_DIR, NS_GET_IID(nsILocalFile), getter_AddRefs(file));

  nsAutoString homePath;
  rv = file->GetPath(homePath);
  
  NS_ENSURE_SUCCESS(rv, rv);
  
  
  //Create Directory .milimail in user Home
  nsCOMPtr<nsILocalFile> pServicesDirectory = do_CreateInstance (NS_LOCAL_FILE_CONTRACTID, &rv);
  
  NS_ENSURE_SUCCESS(rv,rv);
  
  
  rv = pServicesDirectory->InitWithPath(homePath);
  
  NS_ENSURE_SUCCESS(rv,rv);

  //Append doe not work (only one character) under Linux Why? Windows?
  rv = pServicesDirectory->AppendNative(nsDependentCString(".milimail"));
  
  NS_ENSURE_SUCCESS(rv,rv);
  
  //Dont check success, directory may exist
  rv = pServicesDirectory->Create(nsIFile::DIRECTORY_TYPE, 0755);
  
  //IOR Services File Create
  
  rv = pServicesDirectory->AppendNative(nsDependentCString(fileName));
  
  
  nsAutoString serviceIORPath;
  rv = pServicesDirectory->GetPath(serviceIORPath);
  
  
  NS_ConvertUTF16toUTF8 temp(serviceIORPath);
  
  //c++ std style, more elegant and simple than XPCOM Style
  
  cout << temp.get() << endl ;
  ofstream outfile(temp.get());
  outfile << ior ;
  outfile.close();
  
  return NS_OK;
  
}
