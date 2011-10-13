/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2008-2009 EADS DEFENCE AND SECURITY - All rights reserved.
 * ximfmail is under the triple license  MPL 1.1/GPL 2.0/LGPL 2.1.
 * 
 *
 * Redistribution and use, in source and binary forms, with or without modification, 
 * are permitted provided that the following conditons are met :
 *
 * 1. Redistributions of source code must retain the above copyright notice, 
 * 2. MPL 1.1/GPL 2.0/LGPL 2.1. license agreements must be attached 
 *    in the redistribution of the source code.
 * 3. Neither the names of the copyright holders nor the names of any contributors 
 *    may be used to endorse or promote products derived from this software without specific 
 *    prior written permission from EADS Defence and Security.
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
 * REMINDER  :
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *  
 * EADS Defence and Security - 1 Boulevard Jean Moulin -  
 * ZAC de la Clef Saint Pierre - 78990 Elancourt - FRANCE (IDDN.FR.001.480012.002.S.P.2008.000.10000) 
 * ***** END LICENSE BLOCK ***** */


var SMTP_VERSION="0.0";
var SMTP_INSTANCE="smtp";
var LATIN_CHARSET =  "ISO-8859-1";

var XIMF_PREF_IDENTITY_USE_XIMFMAIL = "ximfmail_on";
var XIMF_PREF_IDENTITY_TREETHREAD_REF = "ximfmail_instance_treethread_ref";
var XIMF_PREF_IDENTITY_MAIL_PANEL_REF = "ximfmail_instance_mail_panel_ref";
var PREF_DEFAULT_CHARSET = "mailnews.view_default_charset";
var PREF_MAILNEWS_DEFAULT_CHARSET = "view_default_charset";
var PREF_MAILNEWS = "mailnews";
var PREF_MSGWINDOW_REFRESH = "ximfmail.msgwindow.hdr";

/*
 * Schema xml elements, attributes...
 */
var XIMF_VERSION_HEADER = "X-XIMF-Version";
var _XIMF_ATT_XVALUE = "ximfvalue";
var _XIMF_ATT_TEC_VALUE = "ximftecvalue";
var _XIMF_ATT_MAX_ITEMS = "ximfmaxitems";
var _XIMF_ATT_IS_MULTISET = "ismultiset";
var _XIMF_ATT_REF_BOX = "ximfreftextbox";
var _XIMF_ATT_REF_HEADER = "refheader";
var _XIMF_ATT_LINK_POPUP_BOX = "linkpopupbox";
var _XIMF_ATT_CONCAT_ID = "ximfconcatid";
var _XIMF_ATT_SEPARATOR = "ximfseparator";
var _XIMF_ATT_TEC_SEPARATOR = "ximftecseparator";
var _XIMF_DEFAULT_SEPARATOR = ";";
var _XIMF_ELT_DATEPICKER = "datepicker";

var XIMF_HEADER_RFC_VERSION = "x-ximf-version";
var XIMF_HEADER_INSTANCE_VERSION = "x-instance-version";
var XIMF_HEADER_INSTANCE_NAME = "x-instance-name";


//
var DEFAULT_XIMF_VERSION = "1.0";
var DEFAULT_XIMF_NAME = "XIMF_BASIC";
var XIMF_VERSION_HEADER = "X-XIMF-Version";
var XIMF_NAME_HEADER = "X-XIMF-NAME";
var XIMF_ENDLINE = "\r\n"; // Windows CRLF
var XIMF_SEPARATOR_HEADER = ": ";

var XIMFMAIL_SECURE_HEADERS_XML_FILE = "secureHeadersMail.xml";
var XIMFMAIL_SECURITY_LABEL_XML_DIR = "securityLabel";
var XIMFMAIL_SECURITY_LABEL_XML_FILE = "ximfmailSecurityLabels.xml";

