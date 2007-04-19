/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
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

#ifndef nsIMenuItem_h__
#define nsIMenuItem_h__

#include "prtypes.h"
#include "nsISupports.h"
#include "nsString.h"

#include "nsIDocShell.h"
#include "nsIDOMElement.h"


// {f2e79600-1700-11d5-bb6f-90f240fe493c}
#define NS_IMENUITEM_IID      \
{ 0xf2e79600, 0x1700, 0x11d5, \
  { 0xbb, 0x6f, 0x90, 0xf2, 0x40, 0xfe, 0x49, 0x3c } };

class nsIMenu;
class nsIWidget;
class nsIMenuListener;
class nsIChangeManager;
class nsIContent;

enum {
  knsMenuItemNoModifier      = 0,
  knsMenuItemShiftModifier   = (1 << 0),
  knsMenuItemAltModifier     = (1 << 1),
  knsMenuItemControlModifier = (1 << 2),
  knsMenuItemCommandModifier = (1 << 3)
};

/**
 * MenuItem widget
 */
class nsIMenuItem : public nsISupports {

  public:
    NS_DEFINE_STATIC_IID_ACCESSOR(NS_IMENUITEM_IID)

    enum EMenuItemType { eRegular = 0, eCheckbox, eRadio } ;

   /**
    * Creates the MenuItem
    *
    */
    NS_IMETHOD Create ( nsIMenu* aParent, const nsString & aLabel, PRBool isSeparator, 
                          EMenuItemType aItemType, PRBool aEnabled, 
                          nsIChangeManager* aManager, nsIDocShell* aShell, nsIContent* aNode ) = 0;
    
   /**
    * Get the MenuItem label
    *
    */
    NS_IMETHOD GetLabel(nsString &aText) = 0;

   /**
    * Set the Menu shortcut char
    *
    */
    NS_IMETHOD SetShortcutChar(const nsString &aText) = 0;
  
    /**
    * Get the Menu shortcut char
    *
    */
    NS_IMETHOD GetShortcutChar(nsString &aText) = 0;

   /**
    * Gets whether the item is enabled or disabled
    *
    */
    NS_IMETHOD GetEnabled(PRBool *aIsEnabled) = 0;

   /**
    * Sets whether the item is checked or not
    *
    */
    NS_IMETHOD SetChecked(PRBool aIsEnabled) = 0;

   /**
    * Gets whether the item is checked or not
    *
    */
    NS_IMETHOD GetChecked(PRBool *aIsEnabled) = 0;

   /**
    * Gets whether the item is a checkbox or radio
    *
    */
    NS_IMETHOD GetMenuItemType(EMenuItemType *aType) = 0;
    
   /**
    * Gets the target for MenuItem
    *
    */
    NS_IMETHOD GetTarget(nsIWidget *& aTarget) = 0;
    
   /**
    * Gets Native Menu Handle
    *
    */
    NS_IMETHOD GetNativeData(void*& aData) = 0;

   /**
    * Adds menu listener
    *
    */
    NS_IMETHOD AddMenuListener(nsIMenuListener * aMenuListener) = 0;

   /**
    * Removes menu listener
    *
    */
    NS_IMETHOD RemoveMenuListener(nsIMenuListener * aMenuListener) = 0;

   /**
    * Indicates whether it is a separator
    *
    */
    NS_IMETHOD IsSeparator(PRBool & aIsSep) = 0;

   /**
    * Executes the "cached" JavaScript Command 
    * @return NS_OK if the command was executed properly, otherwise an error code
    */
    NS_IMETHOD DoCommand() = 0;

    /**
    *
    */
    NS_IMETHOD SetModifiers(PRUint8 aModifiers) = 0;
    NS_IMETHOD GetModifiers(PRUint8 * aModifiers) = 0;
};

// {58C5DE16-931C-4D31-AB7E-1B5FBDF596C4}
#define NS_IMENUITEM_MOZILLA_1_8_BRANCH_IID \
{ 0x58C5DE16, 0x931C, 0x4D31, \
  { 0xAB, 0x7E, 0x1B, 0x5F, 0xBD, 0xF5, 0x96, 0xC4 } };

class nsIMenuItem_MOZILLA_1_8_BRANCH : public nsIMenuItem  {
  
  public:
    NS_DEFINE_STATIC_IID_ACCESSOR(NS_IMENUITEM_MOZILLA_1_8_BRANCH_IID)

    /**
     * Sends a DOM event to the menu item's content node 
     * @return NS_OK if the event was sent properly, otherwise an error code
     */
    NS_IMETHOD DispatchDOMEvent(const nsString &eventName, PRBool *preventDefaultCalled) = 0;

   /**
    * Sets an appropriate icon for the menu item.
    */
    NS_IMETHOD SetupIcon() = 0;
};

#endif
