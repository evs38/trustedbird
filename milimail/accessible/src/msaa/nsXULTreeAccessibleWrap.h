/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is Netscape Corp.
 * Portions created by Netscape Corp.are Copyright (C) 2003 Netscape
 * Corp. All Rights Reserved.
 *
 * Original Author: Aaron Leventhal
 *
 * Contributor(s):
 *
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

#ifndef __nsXULTreeAccessibleWrap_h__
#define __nsXULTreeAccessibleWrap_h__

#include "nsXULTreeAccessible.h"

typedef class nsXULTreeColumnsAccessible   nsXULTreeColumnsAccessibleWrap;

class nsXULTreeAccessibleWrap : public nsXULTreeAccessible
{
public:
  nsXULTreeAccessibleWrap(nsIDOMNode *aDOMNode, nsIWeakReference *aShell);
  virtual ~nsXULTreeAccessibleWrap() {}
  NS_IMETHOD GetRole(PRUint32 *aRole);
};

class nsXULTreeitemAccessibleWrap : public nsXULTreeitemAccessible
{
public:
  nsXULTreeitemAccessibleWrap(nsIAccessible *aParent, nsIDOMNode *aDOMNode, nsIWeakReference *aShell, 
    PRInt32 aRow, nsITreeColumn* aColumn);
  virtual ~nsXULTreeitemAccessibleWrap() {}
  NS_IMETHOD GetBounds(PRInt32 *x, PRInt32 *y, PRInt32 *width, PRInt32 *height);
  NS_IMETHOD GetRole(PRUint32 *aRole);
  NS_IMETHOD GetName(nsAString &aName);
  NS_IMETHOD GetDescription(nsAString &aDescription);
};

#endif
