===========================================================================

                          README FOR XSMTP

===========================================================================

-------------------------------------
 Summary
-------------------------------------
 1. Extension license
 2. Requirement
 3. Installation, configuration and use
 4. Changelog

-------------------------------------
 1. Extension license
-------------------------------------

# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version 
# 1.1 (the "License"); you may not use this file except in compliance with 
# the License. You may obtain a copy of the License at 
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is mozilla.
#
# The Initial Developer of the Original Code is
#   BT Global Services / Etat francais Ministere de la Defense
# Portions created by the Initial Developer are Copyright (C) 2002
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

-------------------------------------
 2. Requirement
-------------------------------------

Version 2.0 of Thunderbird is necessary or use the Milimail distribution.
Download it from url http://www.mozilla.com/en-US/thunderbird/ or http://admisource.gouv.fr/frs/?group_id=40


--------------------------------------
 3. Installation, configuration and use
--------------------------------------

The extension xSMTP is integrated into the toolbarpalette of the "compose" window.
In order to make it visible and usable follow the step below:

   1. Make a right click on tool bar of the "compose" window.
   2. Choose and click on "Personalizing" .
   3. Choose and drag & drop the icon xSMTP on the tool bar. 
   
For further details, please refer to :
http://www.milimail.org/milimail/index.php/Xsmtp_user


-------------------------------------
 4. Changelog
-------------------------------------

Version 0.5.2.0
 * Add update.rdf file to the extension. Manage the update functionnality.

Version 0.5.0.0
 * Fix for bugs :
   [#508] Few errors with XSMTP extension

Version 0.4.0.0
 * Fix for enhancements :
   [#488] Interdire les pièces jointes lors de l'envoi d'un message flash
   [#489] Message sonore à l'arrivée d'un message flash
   [#490] Couleur différente pour les messages flash

Version 0.3.0.0
 * Major code refactoring.
 * Added a strong validation engine.
 * Fix for bugs :
  [#406] No check in the edit box.
  [#407] The character : is prohibited if you enter it the text is truncated
  [#435] Allow the user to enter upper case characters in the Exempted-Address field
  [#439] Last character lost of a string when : is enter in a string
  [#440] The MCA field accept 1;1; but doesn't accept ;1;1
  [#454] Fields MCA or Distribution-codes still grayed with both empty

Version 0.2.0.0
 * First working release

 Version 0.1.0.0
 * Repository initialisation
