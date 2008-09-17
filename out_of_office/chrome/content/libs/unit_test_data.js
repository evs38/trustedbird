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
/*00*/	[false,"toto@bidon.com",false,false,"Pas là !!!!"], 
/*01*/	[false,"toto@bidon.com",true,false,"Pas là !!!!"], 
/*02*/	[false,"toto@bidon.com",false,true,"Pas là !!!!"], 
/*03*/	[false,"toto@bidon.com",true,true,"Pas là !!!!"], 
/*04*/	[true,"toto@bidon.com",false,false,"Pas là !!!!"], 
/*05*/	[true,"toto@bidon.com",true,false,"Pas là !!!!"], 
/*06*/	[true,"toto@bidon.com",false,true,"Pas là !!!!"], 
/*07*/	[true,"toto@bidon.com",true,true,"Pas là !!!!"], 
/*08*/	[false,null,false,false,"Pas là !!!!"], 
/*09*/	[false,null,true,false,"Pas là !!!!"], 
/*10*/	[false,null,false,true,"Pas là !!!!"], 
/*11*/	[false,null,true,true,"Pas là !!!!"], 
/*12*/	[true,null,false,false,"Pas là !!!!"], 
/*13*/	[true,null,true,false,"Pas là !!!!"], 
/*14*/	[true,null,false,true,"Pas là !!!!"], 
/*15*/	[true,null,true,true,"Pas là !!!!"], 
/*16*/	[false,"toto@bidon.com",false,false,null], 
/*17*/	[false,"toto@bidon.com",true,false,null], 
/*18*/	[false,"toto@bidon.com",false,true,null], 
/*29*/	[false,"toto@bidon.com",true,true,null], 
/*20*/	[true,"toto@bidon.com",false,false,null], 
/*21*/	[true,"toto@bidon.com",true,false,null], 
/*22*/	[true,"toto@bidon.com",false,true,null], 
/*23*/	[true,"toto@bidon.com",true,true,null], 
/*24*/	[false,null,false,false,null], 
/*25*/	[false,null,true,false,null], 
/*26*/	[false,null,false,true,null], 
/*27*/	[false,null,true,true,null], 
/*28*/	[true,null,false,false,null], 
/*39*/	[true,null,true,false,null], 
/*30*/	[true,null,false,true,null], 
/*31*/	[true,null,true,true,null], 
/*32*/	[false,"",false,true,"&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>"], 		// 01 Notification Monkey test
/*33*/	[false,"",false,true,"\0&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>"], 	// 02 Notification Monkey test
/*34*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\r\nRegards"], 	// 03 Normal Notification test Lf CrLf
/*35*/	[false,"",false,true,"I'am not in the office today.\rI will treat your message soon\r\nRegards"], 	// 04 Normal Notification test Cr CrLf
/*36*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\r\rRegards"], 	// 05 Normal Notification test Lf CrCr
/*37*/	[false,"",false,true,"I'am not in the office today.\nI will treat your message soon\n\nRegards"], 	// 06 Normal Notification test Lf LfLf
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
/*05*/	["\"1\"   <USERUSER@test.milimail.org>" ,true ] ,
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
/*18*/	[" USERUSER@test.milimail.org " ,true ] ,
/*19*/	[" <USERUSER@test.milimail.org>" ,true ] ,
/*20*/	["  <USERUSER@test.milimail.org>" ,true ] ,
/*21*/	["<USERUSER@test.milimail.org>" ,true ] ,
/*22*/	["USERUSER@test.milimail.org " ,true ] ,
/*23*/	["<USERUSER@test.milimail.org> " ,true ] ,
/*24*/	["<USERUSER@test.milimail.org>  " ,true ] ,
/*25*/	["  <USERUSER@test.milimail.org>  " ,true ] ,
/*26*/	["USERUSER USERUSER@test.milimail.org" ,true ] , 	// Should be translated to 'USERUSER <USERUSER@test.milimail.org>'
/*27*/	["USERUSER <<USERUSER@test.milimail.org>" ,true ] , 
/*28*/	["USERUSER <USERUSER@test.milimail.org>>" ,true ] , 
/*29*/	["USERUSER <<USERUSER@test.milimail.org>>" ,true ] , 
/*30*/	["Glue<USERUSER@test.milimail.org>" ,true ] , 		// Should be translated to 'Glue <USERUSER@test.milimail.org>'
/*31*/	["\"Glue\"<USERUSER@test.milimail.org>" ,true ] ,
/*32*/	["\"Glue<USERUSER@test.milimail.org>" ,false ] ,
/*33*/	["Glue\"<USERUSER@test.milimail.org>" ,false ] ,
/*34*/	[" USERUSER@test.milimail.org;" ,true ] ,
/*35*/	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org>" ,false ] ,
/*36*/	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org>" ,false ] ,
/*37*/	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!@test.milimail.org>" ,false ] ,
/*38*/	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!@test.milimail.org>" ,false ] ,
/*39*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*40*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*41*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
/*42*/	["DisplayName  &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*43*/	[" &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*44*/	["  &é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
/*45*/	[" <  USERUSER@test.milimail.org  > " ,true ] ,
];

var addrIPThreeParts = [
/*00*/	["USERUSER <USERUSER@test.milimail.org>" ,true ] , 
/*01*/	["\"User Of this address\" <USERUSER@test.milimail.org>" ,true ] , 
/*02*/	["\"&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>\" <USERUSER@test.milimail.org>" ,false ] ,
/*03*/	["1 <USERUSER@test.milimail.org>" ,true ] ,
/*04*/	[" USERUSER@test.milimail.org " ,true ] ,
/*05*/	[" <USERUSER@test.milimail.org>" ,true ] ,
/*06*/	["  <USERUSER@test.milimail.org>" ,true ] ,
/*07*/	["<USERUSER@test.milimail.org>" ,true ] ,
/*08*/	["Glue<USERUSER@test.milimail.org>" ,true ] ,
/*09*/	[" USERUSER@test.milimail.org;" ,true ] ,
/*10*/	["DisplayName <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>>@test.milimail.org" ,false ] ,
/*11*/	["\"Display Name\" <&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>>@test.milimail.org" ,false ] ,
/*12*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*13*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*14*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
/*15*/	["USERUSER@1.2.3.4" ,false ] ,
/*16*/	["USERUSER@[1.2.3.4]" ,true ] ,
/*17*/	["\"jiminy cricket\"@1.2.3.4" ,false ] ,
/*18*/	["\"jiminy cricket\"@[1.2.3.4]" ,false ] ,
/*19*/	["joe@123.124.233.4]" ,false ] ,
/*20*/	["joe@[123.124.233.4" ,false ] ,
/*21*/	["joe@]123.124.233.4[" ,false ] ,
/*22*/	["joe@[123.124.233.4]" ,true ] ,
/*23*/	[" USERUSER@256.256.256.256 " ,true ] ,
/*24*/	[" <USERUSER@0.0.0.0>" ,false ] ,
/*25*/	["  <USERUSER@2000.2000.2000.2000>" ,true ] ,
/*26*/	["<USERUSER@2000..2000>" ,false ] ,
/*27*/	["Glue<USERUSER@.2000..2000.>" ,false ] ,
/*28*/	["USERUSER@.20002000." ,false ] ,
/*29*/	["USERUSER@ 20002000 " ,false ] ,
/*30*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@1.2.3.4" ,false ] ,
/*31*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[123.124.233.4]" ,false ] ,
/*32*/	["joe&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>joe@[123.124.233.4]" ,false ] ,
];

var addrDomainTwoParts = [
/*00*/	["USERUSER@test.milimail.org" ,true ] ,
/*01*/	["\"jiminy cricket\"@milimail.com" ,true ] ,
/*02*/	[" USERUSER@test.milimail.org " ,true ] ,
/*03*/	[" <USERUSER@test.milimail.org>" ,true ] ,
/*04*/	["  <USERUSER@test.milimail.org>" ,true ] ,
/*05*/	["<USERUSER@test.milimail.org>" ,true ] ,
/*06*/	["USERUSER@test.milimail.org;" ,false ] ,
/*07*/	[" USERUSER@test.milimail.org;" ,false ] ,
/*08*/	["Glue<USERUSER@test.milimail.org>" ,false ] ,
/*09*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@test.milimail.org" ,false ] ,
/*10*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>.org" ,false ] ,
/*11*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[test.milimail.org]" ,false ] ,
];

var addrIPTwoParts = [
/*00*/	["USERUSER@1.2.3.4" ,false ] ,
/*01*/	["USERUSER@[1.2.3.4]" ,true ] ,
/*02*/	["\"jiminy cricket\"@1.2.3.4" ,false ] ,
/*03*/	["\"jiminy cricket\"@[1.2.3.4]" ,true ] ,
/*04*/	["USER@123.124.233.4]" ,false ] ,
/*05*/	["USER@[123.124.233.4" ,false ] ,
/*06*/	["USER@]123.124.233.4[" ,false ] ,
/*07*/	["USER@[123.124.233.4]" ,true ] ,
/*08*/	[" USER@[123.124.233.4]" ,true ] ,
/*09*/	[" USER@[123.124.233.4] " ,true ] ,
/*10*/	["  USER@[123.124.233.4] " ,true ] ,
/*11*/	["  USER@[123.124.233.4]  " ,true ] ,
/*12*/	[" USERUSER@256.256.256.256 " ,false ] ,
/*13*/	[" <USERUSER@0.0.0.0>" ,false ] ,
/*14*/	["  <USERUSER@2000.2000.2000.2000>" ,false ] ,
/*15*/	["<USERUSER@2000..2000>" ,false ] ,
/*16*/	["Glue<USERUSER@.2000..2000.>" ,false ] ,
/*17*/	["USERUSER@.20002000." ,false ] ,
/*18*/	["USERUSER@ 20002000 " ,false ] ,
/*19*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@1.2.3.4" ,false ] ,
/*20*/	["&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>@[123.124.233.4]" ,false ] ,
/*21*/	["USER&é\"''(-è_çà)=&~#{[|`\^@]}$£¤*µ*ù%?,;.:/!§!<>USER@[123.124.233.4]" ,false ] ,
];



