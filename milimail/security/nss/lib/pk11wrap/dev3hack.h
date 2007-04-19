/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef DEVNSS3HACK_H
#define DEVNSS3HACK_H

#ifdef DEBUG
static const char DEVNSS3HACK_CVS_ID[] = "@(#) $RCSfile: dev3hack.h,v $ $Revision: 1.9 $ $Date: 2005/01/20 02:25:48 $";
#endif /* DEBUG */

#include "cert.h"

PR_BEGIN_EXTERN_C

NSS_EXTERN NSSToken *
nssToken_CreateFromPK11SlotInfo(NSSTrustDomain *td, PK11SlotInfo *nss3slot);

NSS_EXTERN void
nssToken_UpdateName(NSSToken *);

NSS_EXTERN PRStatus
nssToken_Refresh(NSSToken *);

NSSTrustDomain *
nssToken_GetTrustDomain(NSSToken *token);

void PK11Slot_SetNSSToken(PK11SlotInfo *sl, NSSToken *nsst);

NSSToken * PK11Slot_GetNSSToken(PK11SlotInfo *sl);

PR_END_EXTERN_C

#endif /* DEVNSS3HACK_H */
