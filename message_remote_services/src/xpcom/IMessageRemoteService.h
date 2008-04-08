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
/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM ../src/xpcom/IMessageRemoteService.idl
 */

#ifndef __gen_IMessageRemoteService_h__
#define __gen_IMessageRemoteService_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    IMessageRemoteService */
#define IMESSAGEREMOTESERVICE_IID_STR "f9b41dae-2b80-47ac-bfbc-feead1aaef5b"

#define IMESSAGEREMOTESERVICE_IID \
  {0xf9b41dae, 0x2b80, 0x47ac, \
    { 0xbf, 0xbc, 0xfe, 0xea, 0xd1, 0xaa, 0xef, 0x5b }}

class NS_NO_VTABLE IMessageRemoteService : public nsISupports {
 public: 

  NS_DEFINE_STATIC_IID_ACCESSOR(IMESSAGEREMOTESERVICE_IID)

  /* void Start (); */
  NS_IMETHOD Start(void) = 0;

  /* void Stop (); */
  NS_IMETHOD Stop(void) = 0;

};

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IMESSAGEREMOTESERVICE \
  NS_IMETHOD Start(void); \
  NS_IMETHOD Stop(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IMESSAGEREMOTESERVICE(_to) \
  NS_IMETHOD Start(void) { return _to Start(); } \
  NS_IMETHOD Stop(void) { return _to Stop(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IMESSAGEREMOTESERVICE(_to) \
  NS_IMETHOD Start(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Start(); } \
  NS_IMETHOD Stop(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Stop(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IMessageRemoteService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IMESSAGEREMOTESERVICE

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IMessageRemoteService)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void Start (); */
NS_IMETHODIMP _MYCLASS_::Start()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void Stop (); */
NS_IMETHODIMP _MYCLASS_::Stop()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IMessageRemoteService_h__ */
