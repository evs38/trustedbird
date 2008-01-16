===========================================================================

                       README FOR MULTI_LDAP

===========================================================================

-------------------------------------
 Requirement
-------------------------------------

Version 2.0 of Thunderbird is necessary or use the Milimail distribution.
Download it from url http://www.mozilla.com/en-US/thunderbird/ or http://admisource.gouv.fr/frs/?group_id=40


--------------------------------------
 Installation, configuration and use
--------------------------------------

Please refer to :
http://www.milimail.org/milimail/index.php/Multi_ldap_auto_completion_user


-------------------------------------
 Changelog
-------------------------------------

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
