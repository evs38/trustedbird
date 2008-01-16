===========================================================================

                          README FOR XSMTP

===========================================================================

-------------------------------------
 Requirement
-------------------------------------

Version 2.0 of Thunderbird is necessary or use the Milimail distribution.
Download it from url http://www.mozilla.com/en-US/thunderbird/ or http://admisource.gouv.fr/frs/?group_id=40


--------------------------------------
 Installation, configuration and use
--------------------------------------

The extension xSMTP is integrated into the toolbarpalette of the "compose" window.
In order to make it visible and usable follow the step below:

   1. Make a right click on tool bar of the "compose" window.
   2. Choose and click on "Personalizing" .
   3. Choose and drag & drop the icon xSMTP on the tool bar. 
   
For further details, please refer to :
http://www.milimail.org/milimail/index.php/Xsmtp_user


-------------------------------------
 Changelog
-------------------------------------
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
