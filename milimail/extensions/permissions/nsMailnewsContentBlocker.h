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
 * The Original Code is content blocker code.
 *
 * The Initial Developer of the Original Code is
 * Michiel van Leeuwen <mvl@exedo.nl>.
 * Portions created by the Initial Developer are Copyright (C) 2004
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

#ifndef nsMailnewsContentBlocker_h__
#define nsMailnewsContentBlocker_h__

#include "nsIContentPolicy.h"
#include "nsIObserver.h"
#include "nsWeakReference.h"

class nsIPrefBranch;

////////////////////////////////////////////////////////////////////////////////

class nsMailnewsContentBlocker : public nsIContentPolicy,
                                 public nsIObserver,
                                 public nsSupportsWeakReference
{
public:

  // nsISupports
  NS_DECL_ISUPPORTS
  NS_DECL_NSICONTENTPOLICY
  NS_DECL_NSIOBSERVER

  nsMailnewsContentBlocker();
  nsresult Init();

private:
  ~nsMailnewsContentBlocker() {}

  void PrefChanged(nsIPrefBranch *, const char *);
  PRBool mBlockRemotePref;
};

#define NS_MAILNEWSCONTENTBLOCKER_CID \
{ 0xe37bc4ee, 0xc6b6, 0x4a05, \
  { 0xac, 0x14, 0x3c, 0x57, 0x05, 0x5a, 0x8e, 0xb5 } }

#define NS_MAILNEWSCONTENTBLOCKER_CONTRACTID "@mozilla.org/permissions/mailnewscontentblocker;1"

#endif /* nsMailnewsContentBlocker_h__ */
