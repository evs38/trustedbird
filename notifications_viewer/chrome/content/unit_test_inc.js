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
 * The Original Code is Mozilla Communicator
 * 
 * The Initial Developer of the Original Code is
 *    Daniel Rocher <daniel.rocher@marine.defense.gouv.fr>
 *       Etat francais Ministere de la Defense
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */


/**
	@fileoverview Unit Test - This file provides messages for tests
	@author Daniel Rocher / Etat francais Ministere de la Defense
*/


var msgDSN=["From: MAILER-DAEMON@vraimentbidon.org (Mail Delivery System)\n"+
		"Subject: Successful Mail Delivery Report\n"+
		"To: daniel@vraimentbidon.org\n"+
		"Auto-Submitted: auto-replied\n"+
		"MIME-Version: 1.0\n"+
		"Content-Type: multipart/report; report-type=delivery-status;\n"+
		"	boundary=\"E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\"\n"+
		"Message-Id: <20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>","\n\n"
		,
		"This is a MIME-encapsulated message.\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Notification\n"+
		"Content-Type: text/plain; charset=us-ascii\n\n"+
		"This is the mail system at host mydesktop.vraimentbidon.org.\n\n"+
		"Your message was successfully delivered to the destination(s)\n"+
		"listed below. If the message was delivered to mailbox you will\n"+
		"receive no further notifications. Otherwise you may still receive\n"+
		"notifications of mail delivery errors from other systems.\n\n"+
		"                   The mail system\n\n"+
		"<sertim@vraimentbidon.ORG>: delivery via local: delivered to mailbox\n\n"+
		"<daniel@vraimentbidon.ORG>: delivery via local: delivered to mailbox\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Delivery report\n"+
		"Content-Type: message/delivery-status\n\n"+
		"Reporting-MTA: dns; mydesktop.vraimentbidon.org\n"+
		"X-Postfix-Queue-ID: E9AED1FF86\n"+
		"X-Postfix-Sender: rfc822; daniel@vraimentbidon.org\n"+
		"Arrival-Date: Wed, 13 Feb 2008 14:07:46 +0100 (CET)\n\n"+
		"Final-Recipient: rfc822; sertim@vraimentbidon.ORG\n"+
		"Original-Recipient: rfc822;sertim@vraimentbidon.ORG\n"+
		"Action: delivered\n"+
		"Status: 2.0.0\n"+
		"Diagnostic-Code: X-Postfix; delivery via local: delivered to mailbox\n\n"+
		"Final-Recipient: rfc822; daniel@vraimentbidon.ORG\n"+
		"Original-Recipient: rfc822;daniel@vraimentbidon.ORG\n"+
		"Action: delivered\n"+
		"Status: 2.0.0\n"+
		"Diagnostic-Code: X-Postfix; delivery via local: delivered to mailbox\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Message Headers\n"+
		"Content-Type: text/rfc822-headers\n\n"+
		"Received: from dd (localhost [127.0.0.1])\n"+
		"	by mydesktop.vraimentbidon.org (Postfix) with ESMTP id E9AED1FF86;\n"+
		"	Wed, 13 Feb 2008 14:07:46 +0100 (CET)\n"+
		"To: <daniel@vraimentbidon.org>\n"+
		"To: <sertim@vraimentbidon.org>\n"+
		"Date: Fri, 10 Feb 2008 10:10:10 +0100 (CET)\n"+
		"From: daniel@vraimentbidon.org (daniel)\n"+
		"Subject: test\n"+
		"Message-Id: <20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org--\n\n"
		];

var msgDSN2=["From - Wed Feb 13 14:55:50 2008\n"+
		"Return-Path: <>\n"+
		"X-Original-To: daniel@vraimentbidon.org\n"+
		"Delivered-To: daniel@vraimentbidon.org\n"+
		"Received: by mydesktop.vraimentbidon.org (Postfix)\n"+
		"	id 54E3C1FF8B; Wed, 13 Feb 2008 14:55:16 +0100 (CET)\n"+
		"Date: Wed, 13 Feb 2008 14:55:16 +0100 (CET)\n"+
		"From: MAILER-DAEMON@vraimentbidon.org (Mail Delivery System)\n"+
		"Subject: Undelivered Mail Returned to Sender\n"+
		"To: daniel@vraimentbidon.org\n"+
		"Auto-Submitted: auto-replied\n"+
		"MIME-Version: 1.0\n"+
		"Content-Type: multipart/report; report-type=delivery-status;\n"+
		"	boundary=\"B3C761FF89.1202910916/mydesktop.vraimentbidon.org\"\n"+
		"Message-Id: <20080213135516.54E3C1FF8B@mydesktop.vraimentbidon.org>","\n\n"
		,
		"This is a MIME-encapsulated message.\n\n"
		,
		"--B3C761FF89.1202910916/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Notification\n"+
		"Content-Type: text/plain; charset=us-ascii\n\n"+
		"This is the mail system at host mydesktop.vraimentbidon.org.\n\n"+
		"I'm sorry to have to inform you that your message could not\n"+
		"be delivered to one or more recipients. It's attached below.\n\n"+
		"For further assistance, please send mail to postmaster.\n\n"+
		"If you do so, please include this problem report. You can\n"+
		"delete your own text from the attached returned message.\n\n"+
		"                   The mail system\n\n"+
		"<autre.compte@vraimentbidon.org>: unknown user: \"autre.compte\"\n\n"
		,
		"--B3C761FF89.1202910916/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Delivery report\n"+
		"Content-Type: message/delivery-status\n\n"+
		"Reporting-MTA: dns; mydesktop.vraimentbidon.org\n"+
		"X-Postfix-Queue-ID: B3C761FF89\n"+
		"X-Postfix-Sender: rfc822; daniel@vraimentbidon.org\n"+
		"Arrival-Date: Wed, 13 Feb 2008 14:55:15 +0100 (CET)\n\n"+
		"Final-Recipient: rfc822; autre.compte@vraimentbidon.org\n"+
		"Action: failed\n"+
		"Status: 5.1.1\n"+
		"Diagnostic-Code: X-Postfix; unknown user: \"autre.compte\"\n\n"
		,
		"--B3C761FF89.1202910916/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Undelivered Message\n"+
		"Content-Type: message/rfc822\n\n"+
		"Received: by mydesktop.vraimentbidon.org (Postfix, from userid 1000)\n"+
		"	id B3C761FF89; Wed, 13 Feb 2008 14:55:15 +0100 (CET)\n"+
		"Subject: test\n"+
		"To: <daniel@vraimentbidon.org>\n"+
		"To: <sertim@vraimentbidon.org>\n"+
		"To: <autre.compte@vraimentbidon.org>\n"+
		"Date: Fri, 18 Jan 2008 09:29:21 +0100 (CET)\n"+
		"From: daniel@vraimentbidon.org (daniel)\n"+
		"Message-Id: <20080213135515.B3C761FF89@mydesktop.vraimentbidon.org>\n\n"+
		"Pour un essais\n\n"
		,
		"--B3C761FF89.1202910916/mydesktop.vraimentbidon.org--\n"
		];


var msgNoDSN= ["From - Mon Feb 25 14:40:02 2008\n"+
		"Return-Path: <daniel@vraimentbidon.org>\n"+
		"X-Original-To: daniel@vraimentbidon.org\n"+
		"Delivered-To: daniel@vraimentbidon.org\n"+
		"Received: from [192.168.2.204] (unknown [192.168.2.204])\n"+
		"	by mydesktop.vraimentbidon.org (Postfix) with ESMTP id 142F11FE1C\n"+
		"	for <daniel@vraimentbidon.org>; Mon, 25 Feb 2008 14:40:00 +0100 (CET)\n"+
		"Message-ID: <47C2C52F.2080503@vraimentbidon.org>\n"+
		"Date: Mon, 25 Feb 2008 14:39:59 +0100\n"+
		"From: daniel <daniel@vraimentbidon.org>\n"+
		"User-Agent: Thunderbird 2.0.0.6 (X11/20071022)\n"+
		"MIME-Version: 1.0\n"+
		"To: daniel@vraimentbidon.org\n"+
		"Subject: test envoi fichier joint\n"+
		"Content-Type: \tmultipart/mixed;\n"+
		"boundary=\"------------000907060704010604050406\"","\n\n"
		,
		"This is a multi-part message in MIME format.\n"
		,
		"--------------000907060704010604050406\n"
		,
		"Content-Type: text/plain; charset=ISO-8859-15; format=flowed\n"+
		"Content-Transfer-Encoding: 7bit\n\n\n\n"
		,
		"--------------000907060704010604050406\n"
		,
		"Content-Type: application/x-desktop;\n"+
		"name=\"Perso.desktop\"\n"+
		"Content-Transfer-Encoding: base64\n"+
		"Content-Disposition: inline;\n"+
		"filename=\"Perso.desktop\"\n"+
		
		"W0Rlc2t0b3AgRW50cnldCkVuY29kaW5nPVVURi04Ckljb249a2ZtX2hvbWUKTmFtZT1Eb3Nz\n"+
		"aWVyIFBlcnNvbm5lbApOYW1lW2ZyXT1Eb3NzaWVyIFBlcnNvbm5lbApUeXBlPUxpbmsKVVJM\n"+
		"PSRIT01FCg==\n"
		,
		"--------------000907060704010604050406--\n"
		];


var msgBadDSN=["From: MAILER-DAEMON@vraimentbidon.org (Mail Delivery System)\n"+
		"Subject: Successful Mail Delivery Report\n"+
		"To: daniel@vraimentbidon.org\n"+
		"Auto-Submitted: auto-replied\n"+
		"MIME-Version: 1.0\n"+
		"Content-Type: multipart/report; report-type=delivery-status;\n"+
		"	boundary=\"E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\"\n"+
		"Message-Id: <20080213131118.4DD991FF88@mydesktop.vraimentbidon.org>\n"+
		"This is a MIME-encapsulated message.","\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Notification\n"+
		"Content-Type: text/plain; charset=us-ascii\n\n"+
		"This is the mail system at host mydesktop.vraimentbidon.org.\n\n"+
		"Your message was successfully delivered to the destination(s)\n"+
		"listed below. If the message was delivered to mailbox you will\n"+
		"receive no further notifications. Otherwise you may still receive\n"+
		"notifications of mail delivery errors from other systems.\n\n"+
		"                   The mail system\n\n"+
		"<sertim@vraimentbidon.ORG>: delivery via local: delivered to mailbox\n\n"+
		"<daniel@vraimentbidon.ORG>: delivery via local: delivered to mailbox\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Delivery report\n"+
		"Content-Type: message/delivery-status\n\n"+
		"Reporting-MTA: dns; mydesktop.vraimentbidon.org\n"+
		"X-Postfix-Queue-ID: E9AED1FF86\n"+
		"X-Postfix-Sender: rfc822; daniel@vraimentbidon.org\n"+
		"Arrival-Date: Wed, 13 Feb 2008 14:07:46 +0100 (CET)\n\n"+
		"Final-Recipient: rfc822; sertim@vraimentbidon.ORG\n"+
		"Original-Recipient: rfc822;sertim@vraimentbidon.ORG\n"+
		"Action: nothing\n"+
		"Status: 2.0.0\n"+
		"Diagnostic-Code: X-Postfix; delivery via local: delivered to mailbox\n\n"+
		"Final-Recipient: rfc822; daniel@vraimentbidon.ORG\n"+
		"Original-Recipient: rfc822;daniel@vraimentbidon.ORG\n"+
		"Status: 2.0.0\n"+
		"Diagnostic-Code: X-Postfix; delivery via local: delivered to mailbox\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org\n"
		,
		"Content-Description: Message Headers\n"+
		"Content-Type: text/rfc822-headers\n\n"+
		"Received: from dd (localhost [127.0.0.1])\n"+
		"	by mydesktop.vraimentbidon.org (Postfix) with ESMTP id E9AED1FF86;\n"+
		"	Wed, 13 Feb 2008 14:07:46 +0100 (CET)\n"+
		"To: <daniel@vraimentbidon.org>\n"+
		"To: <sertim@vraimentbidon.org>\n"+
		"Date: Fri, 10 Feb 2008 10:10:10 +0100 (CET)\n"+
		"From: daniel@vraimentbidon.org (daniel)\n"+
		"Subject: test\n"+
		"Message-Id: <20080213130850.E9AED1FF86@mydesktop.vraimentbidon.org>\n\n"
		,
		"--E9AED1FF86.1202908278/mydesktop.vraimentbidon.org--\n\n"
		];

var MdnDenied="Return-Path: <daniel@vraimentbidon.org>\n"+
"From: Daniel Rocher <daniel@vraimentbidon.org>\n"+
"Reply-To: daniel@vraimentbidon.org\n"+
"To: daniel@vraimentbidon.org\n"+
"Subject: Message Disposition Notification\n"+
"Date: Thu, 24 Apr 2008 20:41:22 +0200\n"+
"User-Agent: KMail/1.9.6 (enterprise 0.20070907.709405)\n"+
"MIME-Version: 1.0\n"+
"Content-Type: Multipart/report;\n"+
"  boundary=\"Boundary-00=_SRNEI7gNBqMQFGs\";\n"+
"  report-type=\"disposition-notification\"\n"+
"In-Reply-To: <200804242037.37481.daniel@vraimentbidon.org>\n"+
"References: <200804242037.37481.daniel@vraimentbidon.org>\n"+
"Message-Id: <200804242041.22950.daniel@vraimentbidon.org>\n"+
"\n"+
"--Boundary-00=_SRNEI7gNBqMQFGs\n"+
"Content-Type: text/plain;\n"+
"  charset=\"iso-8859-1\"\n"+
"Content-Transfer-Encoding: quoted-printable\n"+
"\n"+
"Le message envoy=E9 le 24/04/2008 20:37 =E0 daniel@vraimentbidon.org avec l=\n"+
"e sujet =AB=A0MDN rejet=E9=A0=BB a =E9t=E9 manipul=E9. L'exp=E9diteur n'a p=\n"+
"as souhait=E9 vous donner plus de d=E9tails.\n"+
"--Boundary-00=_SRNEI7gNBqMQFGs\n"+
"Content-Type: Message/disposition-notification\n"+
"Content-Transfer-Encoding: 7bit\n"+
"\n"+
"Reporting-UA: villou-gutsy; KMime 0.1.0\n"+
"Final-Recipient: rfc822; Daniel Rocher <daniel@vraimentbidon.org>\n"+
"Original-Message-ID: <200804242037.37481.daniel@vraimentbidon.org>\n"+
"Disposition: manual-action/MDN-sent-manually; denied\n"+
"\n"+
"--Boundary-00=_SRNEI7gNBqMQFGs--\n";


var MdnDisplayed="From: Daniel Rocher <daniel@vraimentbidon.org>"+
"Reply-To: daniel@vraimentbidon.org\n"+
"To: daniel@vraimentbidon.org\n"+
"Subject: Message Disposition Notification\n"+
"Date: Thu, 24 Apr 2008 20:41:29 +0200\n"+
"User-Agent: KMail/1.9.6 (enterprise 0.20070907.709405)\n"+
"MIME-Version: 1.0\n"+
"Content-Type: Multipart/report;\n"+
"  boundary=\"Boundary-00=_ZRNEIbB9odfUlkp\";\n"+
"  report-type=\"disposition-notification\"\n"+
"In-Reply-To: <200804242037.54209.daniel@vraimentbidon.org>\n"+
"References: <200804242037.54209.daniel@vraimentbidon.org>\n"+
"Message-Id: <200804242041.29452.daniel@vraimentbidon.org>\n"+
"\n"+
"--Boundary-00=_ZRNEIbB9odfUlkp\n"+
"Content-Type: text/plain;\n"+
"  charset=\"iso-8859-1\"\n"+
"Content-Transfer-Encoding: quoted-printable\n"+
"\n"+
"Le message envoy=E9 le 24/04/2008 20:37 =E0 daniel@vraimentbidon.org avec l=\n"+
"e sujet =AB=A0AR accept=E9=A0=BB a =E9t=E9 affich=E9. Il n'est pas certain =\n"+
"qu'il ait =E9t=E9 lu ou compris.\n"+
"--Boundary-00=_ZRNEIbB9odfUlkp\n"+
"Content-Type: Message/disposition-notification\n"+
"Content-Transfer-Encoding: 7bit\n"+
"\n"+
"Reporting-UA: villou-gutsy; KMime 0.1.0\n"+
"Final-Recipient: rfc822; Daniel Rocher <daniel@vraimentbidon.org>\n"+
"Original-Message-ID: <200804242037.54209.daniel@vraimentbidon.org>\n"+
"Disposition: manual-action/MDN-sent-manually; displayed\n"+
"\n"+
"--Boundary-00=_ZRNEIbB9odfUlkp--\n";

