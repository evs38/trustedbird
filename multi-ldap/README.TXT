===========================================================================

                       README FOR MULTI_LDAP

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

Please refer to :
http://www.milimail.org/milimail/index.php/Multi_ldap_auto_completion_user


-------------------------------------
 4. Changelog
-------------------------------------

Version 0.2.5.0
 * Add update.rdf file to the extension. Manage the update functionnality.

Version 0.2.4.0
 * Fix for [#484] Data are saved on cancel
 * Fix for [#491] LDAP User properties test plan
 * Fix for [#492] userA properties change userB properties
 * Fix for [#494] User account properties are saved on cancel.
 * Fix for [#495] Uncheck the collected address disable the autocompletion.
 * Fix for [#496] ldap_2.autoComplete.useDirectory set to false disable the autocompletion.
 * Fix for [#497] the string 'Use Custom Preferences' from account settings is not localized.
 * Fix for [#504] If the name of a server is the beginning of another one, it is automaticaly selected.

Version 0.2.3.0
 * Fix for [#475] autoComplete.ldapServers not updated

Version 0.2.2.0
 * Fix for [#465] multildap_OriginalReleaseGlobalVariables is not defined.

Version 0.2.1.0
 * Fix for [#460] bad display when you select a LDAP in the configuration.
 * Fix for [#461] First auto-completion done with only the last server.

Version 0.2.0.0
 * First working release
