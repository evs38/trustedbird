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

package org.milimail.messageRemoteServiceAPI.compose;

import org.milimail.messageRemoteServiceAPI.stubs.CDSNType;
/**
 * This Class represents different DSN types to request in return to the mail
 * See RFC 1891
 * @author Olivier PARNIERE
 *
 */
public class DSNType {
	private CDSNType type;
	
	public DSNType(CDSNType type) {
		this.type = type;
	}
	
	public DSNType() {
		this.type = new CDSNType();
	}
	
	public boolean isReturnFullHDRRequested() {
		return type.isReturnFullHDRRequested;
	}
	public void setReturnFullHDRRequested(boolean isReturnFullHDRRequested) {
		type.isReturnFullHDRRequested = isReturnFullHDRRequested;
	}
	public boolean isOnSuccessRequested() {
		return type.isOnSuccessRequested;
	}
	public void setOnSuccessRequested(boolean isOnSuccessRequested) {
		type.isOnSuccessRequested = isOnSuccessRequested;
	}
	public boolean isOnFailureRequested() {
		return type.isOnFailureRequested;
	}
	public void setOnFailureRequested(boolean isOnFailureRequested) {
		type.isOnFailureRequested = isOnFailureRequested;
	}
	public boolean isOnDelayRequested() {
		return type.isOnDelayRequested;
	}
	public void setOnDelayRequested(boolean isOnDelayRequested) {
		type.isOnDelayRequested = isOnDelayRequested;
	}
	public boolean isNeverRequested() {
		return type.isNeverRequested;
	}
	public void setNeverRequested(boolean isNeverRequested) {
		type.isNeverRequested = isNeverRequested;
	}
	public CDSNType getCorbaObject() {
		return type;
	}


}
