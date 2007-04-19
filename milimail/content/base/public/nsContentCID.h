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

#ifndef nsContentCID_h__
#define nsContentCID_h__

#include "nsISupports.h"
#include "nsIFactory.h"
#include "nsIComponentManager.h"

// {1691E1F7-EE41-11d4-9885-00C04FA0CF4B}
#define NS_STYLESET_CID \
{ 0x1691e1f7, 0xee41, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

// {972D8D8F-F0DA-11d4-9885-00C04FA0CF4B}
#define NS_DOCUMENT_VIEWER_CID \
{ 0x972d8d8f, 0xf0da, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

// {A5121627-EDB6-11d4-9885-00C04FA0CF4B}
#define NS_ANONYMOUSCONTENT_CID \
{ 0xa5121627, 0xedb6, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

// {FC886801-E768-11d4-9885-00C04FA0CF4B}
#define NS_CONTENT_DOCUMENT_LOADER_FACTORY_CID \
 { 0xfc886801, 0xe768, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

/* a6cf90f9-15b3-11d2-932e-00805f8add32 */
#define NS_LAYOUT_DEBUGGER_CID \
 { 0xa6cf90f9, 0x15b3, 0x11d2,{0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32}}

#define NS_HTMLDOCUMENT_CID                       \
{ /* 5d0fcdd0-4daa-11d2-b328-00805f8a3859 */      \
 0x5d0fcdd0, 0x4daa, 0x11d2,                      \
 {0xb3, 0x28, 0x00, 0x80, 0x5f, 0x8a, 0x38, 0x59}}

#define NS_WYCIWYGPROTOCOLHANDLER_CID             \
{ /* e7509b46-2eB2-410a-9d7c-c3ce73284d01 */      \
  0xe7509b46, 0x2eb2, 0x410a,                     \
  {0x9d, 0x7c, 0xc3, 0xce, 0x73, 0x28, 0x4d, 0x01}}

#define NS_XMLDOCUMENT_CID                        \
{ /* a6cf9063-15b3-11d2-932e-00805f8add32 */      \
 0xa6cf9063, 0x15b3, 0x11d2,                      \
 {0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32}}

#define NS_IMAGEDOCUMENT_CID                      \
{ /* e11a6080-4daa-11d2-b328-00805f8a3859 */      \
 0xe11a6080, 0x4daa, 0x11d2,                      \
 {0xb3, 0x28, 0x00, 0x80, 0x5f, 0x8a, 0x38, 0x59}}

// {A1FDE864-E802-11d4-9885-00C04FA0CF4B}
#define NS_HTMLHRELEMENT_CID                   \
{ 0xa1fde864, 0xe802, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

// {A1FDE865-E802-11d4-9885-00C04FA0CF4B}
#define NS_HTMLINPUTELEMENT_CID                   \
{ 0xa1fde865, 0xe802, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

#define NS_HTMLIMAGEELEMENT_CID                   \
{ /* d6008c40-4dad-11d2-b328-00805f8a3859 */      \
 0xd6008c40, 0x4dad, 0x11d2,                      \
 {0xb3, 0x28, 0x00, 0x80, 0x5f, 0x8a, 0x38, 0x59}}

#define NS_HTMLOPTIONELEMENT_CID                  \
{ /* a6cf90f5-15b3-11d2-932e-00805f8add32 */      \
 0xa6cf90f5, 0x15b3, 0x11d2,                      \
 {0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32}}

#define NS_NAMESPACEMANAGER_CID                   \
{ /* d9783472-8fe9-11d2-9d3c-0060088f9ff7 */      \
 0xd9783472, 0x8fe9, 0x11d2,                      \
 {0x9d, 0x3c, 0x00, 0x60, 0x08, 0x8f, 0x9f, 0xf7}}

/* a6cf90d7-15b3-11d2-932e-00805f8add32 */
#define NS_FRAME_UTIL_CID \
 { 0xa6cf90d5, 0x15b3, 0x11d2,{0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32}}


// XXX This should really be factored into a style-specific DLL so
// that all the HTML, generic layout, and style stuff isn't munged
// together.

// {2E363D60-872E-11d2-B531-000000000000}
#define NS_CSSPARSER_CID \
{ 0x2e363d60, 0x872e, 0x11d2, { 0xb5, 0x31, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0 } }

// {95F46161-D177-11d2-BF86-00105A1B0627}
#define NS_HTML_CSS_STYLESHEET_CID \
{ 0x95f46161, 0xd177, 0x11d2, { 0xbf, 0x86, 0x0, 0x10, 0x5a, 0x1b, 0x6, 0x27 } }

// {A1FDE867-E802-11d4-9885-00C04FA0CF4B}
#define NS_CSS_STYLESHEET_CID \
{ 0xa1fde867, 0xe802, 0x11d4, { 0x98, 0x85, 0x0, 0xc0, 0x4f, 0xa0, 0xcf, 0x4b } }

// {eaca2576-0d4a-11d3-9d7e-0060088f9ff7}
#define NS_CSS_LOADER_CID \
{ 0xeaca2576, 0x0d4a, 0x11d3, { 0x9d, 0x7e, 0x00, 0x60, 0x08, 0x8f, 0x9f, 0xf7 } }

// {96882B72-8A27-11d2-8EAF-00805F29F370}
#define NS_SELECTION_CID \
{ 0x96882b72, 0x8a27, 0x11d2, { 0x8e, 0xaf, 0x0, 0x80, 0x5f, 0x29, 0xf3, 0x70 } }

#define NS_FRAMESELECTION_CID \
{/* {905F80F1-8A7B-11d2-918C-0080C8E44DB5}*/ \
 0x905f80f1, 0x8a7b, 0x11d2, { 0x91, 0x8c, 0x0, 0x80, 0xc8, 0xe4, 0x4d, 0xb5 } }

#define NS_DOMSELECTION_CID \
{/* {C87A37FC-8109-4ce2-A322-8CDEC925379F}*/ \
 0xc87a37fc, 0x8109, 0x4ce2, { 0xa3, 0x22, 0x8c, 0xde, 0xc9, 0x25, 0x37, 0x9f } }

#define NS_RANGE_CID \
{/* {56AD2981-8A87-11d2-918C-0080C8E44DB5}*/ \
 0x56ad2981, 0x8a87, 0x11d2, { 0x91, 0x8c, 0x0, 0x80, 0xc8, 0xe4, 0x4d, 0xb5 } }
#define NS_CONTENTITERATOR_CID \
{/* {a6cf90e3-15b3-11d2-932e-00805f8add32}*/ \
 0xa6cf90e3, 0x15b3, 0x11d2, {0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 } }

#define NS_PRECONTENTITERATOR_CID \
{/* {80D7E247-D4B8-45d7-BB59-6F1DD56F384C} */ \
 0x80d7e247, 0xd4b8, 0x45d7, { 0xbb, 0x59, 0x6f, 0x1d, 0xd5, 0x6f, 0x38, 0x4c } }

#define NS_GENERATEDSUBTREEITERATOR_CID \
{/* {9A45253B-EB8F-49f1-B925-E9EA90D3EB3A}*/ \
 0x9a45253b, 0xeb8f, 0x49f1, { 0xb9, 0x25, 0xe9, 0xea, 0x90, 0xd3, 0xeb, 0x3a } }

#define NS_GENERATEDCONTENTITERATOR_CID \
{/* {A364930F-E353-49f1-AC69-91637EB8B757}*/ \
 0xa364930f, 0xe353, 0x49f1, { 0xac, 0x69, 0x91, 0x63, 0x7e, 0xb8, 0xb7, 0x57 } }

#define NS_SUBTREEITERATOR_CID \
{/* {a6cf90e5-15b3-11d2-932e-00805f8add32}*/ \
 0xa6cf90e5, 0x15b3, 0x11d2, {0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 } }

// {09F689E0-B4DA-11d2-A68B-00104BDE6048}
#define NS_EVENTLISTENERMANAGER_CID \
{ 0x9f689e0, 0xb4da, 0x11d2, { 0xa6, 0x8b, 0x0, 0x10, 0x4b, 0xde, 0x60, 0x48 } }

// {66856477-6596-40eb-bb87-59ca2dabb6f7}
#define NS_DOMEVENTGROUP_CID \
{ 0x66856477, 0x6596, 0x40eb, { 0xbb, 0x87, 0x59, 0xca, 0x2d, 0xab, 0xb6, 0xf7 } }

// {64F300A1-C88C-11d3-97FB-00400553EEF0}
#define NS_XBLSERVICE_CID \
{ 0x64f300a1, 0xc88c, 0x11d3, { 0x97, 0xfb, 0x0, 0x40, 0x5, 0x53, 0xee, 0xf0 } }

// 3a9cd622-264d-11d4-ba06-0060b0fc76dd
#define NS_DOM_IMPLEMENTATION_CID \
{ 0x3a9cd622, 0x264d, 0x11d4, {0xba, 0x06, 0x00, 0x60, 0xb0, 0xfc, 0x76, 0xdd } }

// {AE52FE52-683A-437D-B661-DE55F4E0A873}
#define NS_NODEINFOMANAGER_CID \
{ 0xae52fe52, 0x683a, 0x437d, { 0xb6, 0x61, 0xde, 0x55, 0xf4, 0xe0, 0xa8, 0x73 } }

// {ECEA1B28-AE54-4047-8BBE-C624235106B4}
#define NS_COMPUTEDDOMSTYLE_CID \
{ 0xecea1b28, 0xae54, 0x4047, { 0x8b, 0xbe, 0xc6, 0x24, 0x23, 0x51, 0x06, 0xb4 } }

// {4aef38b7-6364-4e23-a5e7-12f837fbbd9c}
#define NS_XMLCONTENTSERIALIZER_CID \
{ 0x4aef38b7, 0x6364, 0x4e23, { 0xa5, 0xe7, 0x12, 0xf8, 0x37, 0xfb, 0xbd, 0x9c } }

// {9d3f70da-86e9-11d4-95ec-00b0d03e37b7}
#define NS_HTMLCONTENTSERIALIZER_CID \
{ 0x9d3f70da, 0x86e9, 0x11d4, { 0x95, 0xec, 0x00, 0xb0, 0xd0, 0x3e, 0x37, 0xb7 } }

// {feca3c34-205e-4ae5-bd1c-03c686ff012b}
#define MOZ_SANITIZINGHTMLSERIALIZER_CID \
{ 0xfeca3c34, 0x205e, 0x4ae5, { 0xbd, 0x1c, 0x03, 0xc6, 0x86, 0xff, 0x01, 0x2b  } }

// {6030f7ef-32ed-46a7-9a63-6a5d3f90445f}
#define NS_PLAINTEXTSERIALIZER_CID \
{ 0x6030f7ef, 0x32ed, 0x46a7, { 0x9a, 0x63, 0x6a, 0x5d, 0x3f, 0x90, 0x44, 0x5f } }

// {d4f2b600-b5c1-11d6-b483-cc97c63e567c}
#define NS_HTMLFRAGMENTSINK_CID \
{ 0xd4f2b600, 0xb5c1, 0x11d6, { 0xb4, 0x83, 0xcc, 0x97, 0xc6, 0x3e, 0x56, 0x7c } }

// {13111d00-ce81-11d6-8082-ecf3665af67c}
#define NS_HTMLFRAGMENTSINK2_CID \
{ 0x13111d00, 0xce81, 0x11d6, { 0x80, 0x82, 0xec, 0xf3, 0x66, 0x5a, 0xf6, 0x7c } }

// {A47E9526-6E48-4574-9D6C-3164E271F74E}
#define NS_HTMLPARANOIDFRAGMENTSINK_CID \
{ 0xa47e9526, 0x6e48, 0x4574, { 0x9d, 0x6c, 0x31, 0x64, 0xe2, 0x71, 0xf7, 0x4e } }

// {4B664E54-72A2-4bbf-A5C2-66D4DC3066A0}
#define NS_XMLFRAGMENTSINK_CID \
{ 0x4b664e54, 0x72a2, 0x4bbf, { 0xa5, 0xc2, 0x66, 0xd4, 0xdc, 0x30, 0x66, 0xa0 } }

// {4DC30689-929D-425e-A709-082C6294E542}
#define NS_XMLFRAGMENTSINK2_CID \
{ 0x4dc30689, 0x929d, 0x425e, { 0xa7, 0x9, 0x8, 0x2c, 0x62, 0x94, 0xe5, 0x42 } }

// {2D78BBF0-E26C-482B-92B3-78A7B2AFC8F7}
#define NS_XHTMLPARANOIDFRAGMENTSINK_CID  \
{ 0x2d78bbf0, 0xe26c, 0x482b, { 0x92, 0xb3, 0x78, 0xa7, 0xb2, 0xaf, 0xc8, 0xf7} }

// {3986B301-097C-11d3-BF87-00105A1B0627}
#define NS_XULPOPUPLISTENER_CID \
{ 0x3986b301, 0x97c, 0x11d3, { 0xbf, 0x87, 0x0, 0x10, 0x5a, 0x1b, 0x6, 0x27 } }

// {1F5C1721-7DC3-11d3-BF87-00105A1B0627}
#define NS_XULCONTROLLERS_CID \
{ 0x1f5c1721, 0x7dc3, 0x11d3, { 0xbf, 0x87, 0x0, 0x10, 0x5a, 0x1b, 0x6, 0x27 } }


// {daedcb43-1dd1-11b2-b1d2-caf06cb40387}
#define NS_DLGDEFAULTKEYS_CID \
{ 0xdaedcb43, 0x1dd1, 0x11b2, { 0xb1, 0xd2, 0xca, 0xf0, 0x6c, 0xb4, 0x3, 0x87 } }

// {BFD05264-834C-11d2-8EAC-00805F29F371}
#define NS_XULSORTSERVICE_CID \
{ 0xbfd05264, 0x834c, 0x11d2, { 0x8e, 0xac, 0x0, 0x80, 0x5f, 0x29, 0xf3, 0x71 } }

// {3D262D00-8B5A-11d2-8EB0-00805F29F370}
#define NS_XULTEMPLATEBUILDER_CID \
{ 0x3d262d00, 0x8b5a, 0x11d2, { 0x8e, 0xb0, 0x0, 0x80, 0x5f, 0x29, 0xf3, 0x70 } }

// {1abdcc96-1dd2-11b2-b520-f8f59cdd67bc}
#define NS_XULTREEBUILDER_CID \
{ 0x1abdcc96, 0x1dd2, 0x11b2, { 0xb5, 0x20, 0xf8, 0xf5, 0x9c, 0xdd, 0x67, 0xbc } }

// {CE058B21-BA9C-11d2-BF86-00105A1B0627}
#define NS_XULCONTENTSINK_CID \
{ 0xce058b21, 0xba9c, 0x11d2, { 0xbf, 0x86, 0x0, 0x10, 0x5a, 0x1b, 0x6, 0x27 } }

// {541AFCB2-A9A3-11d2-8EC5-00805F29F370}
#define NS_XULDOCUMENT_CID \
{ 0x541afcb2, 0xa9a3, 0x11d2, { 0x8e, 0xc5, 0x0, 0x80, 0x5f, 0x29, 0xf3, 0x70 } }

// {3A0A0FC1-8349-11d3-BE47-00104BDE6048}
#define NS_XULPROTOTYPECACHE_CID \
{ 0x3a0a0fc1, 0x8349, 0x11d3, { 0xbe, 0x47, 0x0, 0x10, 0x4b, 0xde, 0x60, 0x48 } }

// {a6cf9126-15b3-11d2-932e-00805f8add32}
#define NS_RANGEUTILS_CID \
{ 0xa6cf9126, 0x15b3, 0x11d2, {0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 } }

#ifdef MOZ_SVG

#define NS_SVGDOCUMENT_CID                        \
{ /* b7f44954-1dd1-11b2-8c2e-c2feab4186bc */      \
  0xb7f44954, 0x11d1, 0x11b2,                     \
  {0x8c, 0x2e, 0xc2, 0xfe, 0xab, 0x41, 0x86, 0xbc}}

#endif // MOZ_SVG

#define NS_SYNCLOADDOMSERVICE_CID                   \
 { /* 0e4e7d00-f71a-439f-9178-1a71ff11b55f */       \
  0x0e4e7d00, 0xf71a, 0x439f,                       \
 {0x91, 0x78, 0x1a, 0x71, 0xff, 0x11, 0xb5, 0x5f} }
#define NS_SYNCLOADDOMSERVICE_CONTRACTID            \
"@mozilla.org/content/syncload-dom-service;1"

// {f96f5ec9-755b-447e-b1f3-717d1a84bb41}
#define NS_PLUGINDOCUMENT_CID \
{ 0xf96f5ec9, 0x755b, 0x447e, { 0xb1, 0xf3, 0x71, 0x7d, 0x1a, 0x84, 0xbb, 0x41 } }

#endif /* nsContentCID_h__ */
