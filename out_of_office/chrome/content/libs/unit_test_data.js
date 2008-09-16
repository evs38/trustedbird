/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is mozilla.org Code.
 *
 * The Initial Developer of the Original Code is
 *   BT Global Services / Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 1998-2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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


/**
 * 	@fileoverview Unit Test - This file provides data for tests
 * 	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
 */

/**
 * Data to perform preferences unit test
 */
var wordList = ["erable","chaine","bouleau"];
var keyCharTest="extensions.out_of_office.unittestchar";
var keyBoolTest="extensions.out_of_office.unittestbool";
var keyIntTest="extensions.out_of_office.unittestint";



/**
 * Data to perform Mail Address Validation (RFC2822) unit test
 *
 * 
 * Array definitions:
 * oooSettings.redirection=true;
 * oooSettings.destinationAddress=olivier.brun@bt.com;
 * oooSettings.keepMessage=true;
 * oooSettings.notificationEnable=true;
 * oooSettings.notificationMessage="Je suis absent pour le moment.\r\n\nRobert.";
 * 
 * 	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
 */

var arrayObjectSettings = [ 
/*01*/	[false,"toto@bidon.com",false,false,"Pas là !!!!"], 
/*02*/	[false,"toto@bidon.com",true,false,"Pas là !!!!"], 
/*03*/	[false,"toto@bidon.com",false,true,"Pas là !!!!"], 
/*04*/	[false,"toto@bidon.com",true,true,"Pas là !!!!"], 
/*05*/	[true,"toto@bidon.com",false,false,"Pas là !!!!"], 
/*06*/	[true,"toto@bidon.com",true,false,"Pas là !!!!"], 
/*07*/	[true,"toto@bidon.com",false,true,"Pas là !!!!"], 
/*08*/	[true,"toto@bidon.com",true,true,"Pas là !!!!"], 
/*09*/	[false,null,false,false,"Pas là !!!!"], 
/*10*/	[false,null,true,false,"Pas là !!!!"], 
/*11*/	[false,null,false,true,"Pas là !!!!"], 
/*12*/	[false,null,true,true,"Pas là !!!!"], 
/*13*/	[true,null,false,false,"Pas là !!!!"], 
/*14*/	[true,null,true,false,"Pas là !!!!"], 
/*15*/	[true,null,false,true,"Pas là !!!!"], 
/*16*/	[true,null,true,true,"Pas là !!!!"], 
/*17*/	[false,"toto@bidon.com",false,false,null], 
/*18*/	[false,"toto@bidon.com",true,false,null], 
/*19*/	[false,"toto@bidon.com",false,true,null], 
/*20*/	[false,"toto@bidon.com",true,true,null], 
/*21*/	[true,"toto@bidon.com",false,false,null], 
/*22*/	[true,"toto@bidon.com",true,false,null], 
/*23*/	[true,"toto@bidon.com",false,true,null], 
/*24*/	[true,"toto@bidon.com",true,true,null], 
/*25*/	[false,null,false,false,null], 
/*26*/	[false,null,true,false,null], 
/*27*/	[false,null,false,true,null], 
/*28*/	[false,null,true,true,null], 
/*29*/	[true,null,false,false,null], 
/*30*/	[true,null,true,false,null], 
/*31*/	[true,null,false,true,null], 
/*32*/	[true,null,true,true,null], 
/*33*/	[false,"",false,true,"&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>"], 		// 01 Notification Monkey test
/*34*/	[false,"",false,true,"\0&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>"], 	// 02 Notification Monkey test
/*35*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\r\nRegards"], 	// 03 Normal Notification test Lf CrLf
/*36*/	[false,"",false,true,"I'am not in the office today.\rI will treat your message soon\r\nRegards"], 	// 04 Normal Notification test Cr CrLf
/*37*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\r\rRegards"], 	// 05 Normal Notification test Lf CrCr
/*38*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\n\nRegards"], 	// 06 Normal Notification test Lf LfLf
];

/**
 * Data to perform Mail Address Validation (RFC2822) unit test
 *
 * Array definitions:
 * 		Field 0 : Mail Address to test
 * 		Field 1 : Result of the test
 * 
 * 	@author Olivier Brun BT Global Services / Etat francais Ministere de la Defense
 */

var addrDomainThreeParts = [
/*00*/	["USERUSER <USERUSER@test.milimail.org>" ,true ] , 
/*01*/	["\"User Of this address\" <USERUSER@test.milimail.org>" ,true ] , 
/*02*/	["1 <USERUSER@test.milimail.org>" ,true ] ,
/*03*/	["1\" <USERUSER@test.milimail.org>" ,false ] ,
/*04*/	["\"1 <USERUSER@test.milimail.org>" ,false ] ,
/*05*/	["\"1\" <USERUSER@test.milimail.org>" ,true ] ,
/*06*/	["1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ <USERUSER@test.milimail.org>" ,true ] ,
/*07*/	["ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 <USERUSER@test.milimail.org>" ,true ] ,
/*08*/	["USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ <USERUSER@test.milimail.org>" ,false ] ,
/*09*/	["USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\" <USERUSER@test.milimail.org>" ,false ] ,
/*10*/	["\"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ <USERUSER@test.milimail.org>" ,false ] ,
/*11*/	["USER\"@ABCDEFGHIJKLMNOPQRSTUVWXYZ\" <USERUSER@test.milimail.org>" ,false ] ,
/*12*/	["\"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\" <USERUSER@test.milimail.org>" ,true ] ,
/*13*/	["\"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\"\" <USERUSER@test.milimail.org>" ,false ] ,
/*14*/	[" \"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\" <USERUSER@test.milimail.org>" ,true ] ,
/*15*/	[" \"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\" <USERUSER@test.milimail.org> " ,true ] ,
/*16*/	["  \"USER@ABCDEFGHIJKLMNOPQRSTUVWXYZ\"  <USERUSER@test.milimail.org>   " ,true ] ,
/*17*/	["\"&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>\" <USERUSER@test.milimail.org>" ,false ] ,
/*18*/	[" USERUSER@test.milimail.org " ,false ] ,
/*19*/	[" <USERUSER@test.milimail.org>" ,false ] ,
/*20*/	["  <USERUSER@test.milimail.org>" ,false ] ,
/*21*/	["<USERUSER@test.milimail.org>" ,false ] ,
/*22*/	["Glue<USERUSER@test.milimail.org>" ,false ] ,
/*23*/	[" USERUSER@test.milimail.org;" ,false ] ,
/*24*/	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org>" ,false ] ,
/*25*/	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org>" ,false ] ,
/*26*/	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!@test.milimail.org>" ,false ] ,
/*27*/	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!@test.milimail.org>" ,false ] ,
/*28*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*29*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*30*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
/*31*/	["DisplayName  &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*32*/	[" &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*33*/	["  &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
];

var addrIPThreeParts = [
	["USERUSER <USERUSER@test.milimail.org>" ,true ] , 
	["\"User Of this address\" <USERUSER@test.milimail.org>" ,true ] , 
	["\"&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>\" <USERUSER@test.milimail.org>" ,false ] ,
	["1 <USERUSER@test.milimail.org>" ,true ] ,
	[" USERUSER@test.milimail.org " ,false ] ,
	[" <USERUSER@test.milimail.org>" ,false ] ,
	["  <USERUSER@test.milimail.org>" ,false ] ,
	["<USERUSER@test.milimail.org>" ,false ] ,
	["Glue<USERUSER@test.milimail.org>" ,false ] ,
	[" USERUSER@test.milimail.org;" ,false ] ,
	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>>@test.milimail.org" ,false ] ,
	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>>@test.milimail.org" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
  	["USERUSER@1.2.3.4" ,false ] ,
  	["USERUSER@[1.2.3.4]" ,true ] ,
  	["\"jiminy cricket\"@1.2.3.4" ,false ] ,
  	["\"jiminy cricket\"@[1.2.3.4]" ,true ] ,
  	["joe@123.124.233.4]" ,false ] ,
  	["joe@[123.124.233.4" ,false ] ,
  	["joe@]123.124.233.4[" ,false ] ,
  	["joe@[123.124.233.4]" ,true ] ,
  	[" USERUSER@256.256.256.256 " ,false ] ,
  	[" <USERUSER@0.0.0.0>" ,false ] ,
  	["  <USERUSER@2000.2000.2000.2000>" ,false ] ,
  	["<USERUSER@2000..2000>" ,false ] ,
  	["Glue<USERUSER@.2000..2000.>" ,false ] ,
  	["USERUSER@.20002000." ,false ] ,
  	["USERUSER@ 20002000 " ,false ] ,
  	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@1.2.3.4" ,false ] ,
  	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[123.124.233.4]" ,false ] ,
  	["joe&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>joe@[123.124.233.4]" ,false ] ,
];

var addrDomainTwoParts = [
	["USERUSER@test.milimail.org" ,true ] ,
	["\"jiminy cricket\"@milimail.com" ,true ] ,
	[" USERUSER@test.milimail.org " ,true ] ,
	[" <USERUSER@test.milimail.org>" ,true ] ,
	["  <USERUSER@test.milimail.org>" ,true ] ,
	["<USERUSER@test.milimail.org>" ,true ] ,
	["USERUSER@test.milimail.org;" ,false ] ,
	[" USERUSER@test.milimail.org;" ,false ] ,
	["Glue<USERUSER@test.milimail.org>" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
];

var addrIPTwoParts = [
	["USERUSER@1.2.3.4" ,false ] ,
	["USERUSER@[1.2.3.4]" ,true ] ,
	["\"jiminy cricket\"@1.2.3.4" ,false ] ,
	["\"jiminy cricket\"@[1.2.3.4]" ,true ] ,
	["USER@123.124.233.4]" ,false ] ,
	["USER@[123.124.233.4" ,false ] ,
	["USER@]123.124.233.4[" ,false ] ,
	["USER@[123.124.233.4]" ,true ] ,
	[" USER@[123.124.233.4]" ,true ] ,
	[" USER@[123.124.233.4] " ,true ] ,
	["  USER@[123.124.233.4] " ,true ] ,
	["  USER@[123.124.233.4]  " ,true ] ,
	[" USERUSER@256.256.256.256 " ,false ] ,
	[" <USERUSER@0.0.0.0>" ,false ] ,
	["  <USERUSER@2000.2000.2000.2000>" ,false ] ,
	["<USERUSER@2000..2000>" ,false ] ,
	["Glue<USERUSER@.2000..2000.>" ,false ] ,
	["USERUSER@.20002000." ,false ] ,
	["USERUSER@ 20002000 " ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@1.2.3.4" ,false ] ,
	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[123.124.233.4]" ,false ] ,
	["USER&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>USER@[123.124.233.4]" ,false ] ,
];



