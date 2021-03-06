/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Contributor(s):
 * Contributor(s):
 *   Scott MacGregor <mscott@netscape.com>
 *   Copyright (c) 2011 CASSIDIAN - All rights reserved
 *   Copyright(c) Airbus Defence and Space 2014 - All rights reserved */

#include "mozilla/ModuleUtils.h"
#include "nsISupports.h"
#include "nsCOMPtr.h"

#include "nsIFactory.h"
#include "nsIServiceManager.h"
#include "nsIModule.h"

#include "pratom.h"
#include "nsMsgSMIMECID.h"
#include "nsMsgCompCID.h"

/* Include all of the interfaces our factory can generate components for */
#include "nsMsgComposeSecure.h"
#include "nsSMimeJSHelper.h"
#include "nsEncryptedSMIMEURIsService.h"
#include "nsMsgSMIMEReceiptGenerator.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(nsMsgComposeSecure)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsMsgSMIMEComposeFields)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsSMimeJSHelper)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsEncryptedSMIMEURIsService)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsMsgSMIMEReceiptGenerator)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsMsgSMIMESecureHeader)

NS_DEFINE_NAMED_CID(NS_MSGCOMPOSESECURE_CID);
NS_DEFINE_NAMED_CID(NS_MSGSMIMECOMPFIELDS_CID);
NS_DEFINE_NAMED_CID(NS_SMIMEJSJELPER_CID);
NS_DEFINE_NAMED_CID(NS_SMIMEENCRYPTURISERVICE_CID);
NS_DEFINE_NAMED_CID(NS_SMIMERECEIPT_GENERATOR_CID);
NS_DEFINE_NAMED_CID(NS_SMIMESECUREHEADER_CID);

const mozilla::Module::CIDEntry kMsgSMIMECIDs[] = {
  { &kNS_MSGCOMPOSESECURE_CID, false, NULL, nsMsgComposeSecureConstructor },
  { &kNS_MSGSMIMECOMPFIELDS_CID, false, NULL, nsMsgSMIMEComposeFieldsConstructor },
  { &kNS_SMIMEJSJELPER_CID, false, NULL, nsSMimeJSHelperConstructor },
  { &kNS_SMIMEENCRYPTURISERVICE_CID, false, NULL, nsEncryptedSMIMEURIsServiceConstructor },
  { &kNS_SMIMERECEIPT_GENERATOR_CID, false, NULL, nsMsgSMIMEReceiptGeneratorConstructor },
  { &kNS_SMIMESECUREHEADER_CID, false, NULL, nsMsgSMIMESecureHeaderConstructor },
  { NULL }
};

const mozilla::Module::ContractIDEntry kMsgSMIMEContracts[] = {
  { NS_MSGCOMPOSESECURE_CONTRACTID, &kNS_MSGCOMPOSESECURE_CID },
  { NS_MSGSMIMECOMPFIELDS_CONTRACTID, &kNS_MSGSMIMECOMPFIELDS_CID },
  { NS_SMIMEJSHELPER_CONTRACTID, &kNS_SMIMEJSJELPER_CID },
  { NS_SMIMEENCRYPTURISERVICE_CONTRACTID, &kNS_SMIMEENCRYPTURISERVICE_CID },
  { NS_SMIMESECUREHEADER_CONTRACTID, &kNS_SMIMESECUREHEADER_CID },
  { NS_SMIMERECEIPT_GENERATOR_CONTRACTID, &kNS_SMIMERECEIPT_GENERATOR_CID},
  { NULL }
};

/////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////

static const mozilla::Module kMsgSMIMEModule = {
    mozilla::Module::kVersion,
    kMsgSMIMECIDs,
    kMsgSMIMEContracts
};

NSMODULE_DEFN(nsMsgSMIMEModule) = &kMsgSMIMEModule;
