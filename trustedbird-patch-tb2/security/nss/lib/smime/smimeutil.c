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
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Eric Ballet Baz / BT Global Services / Etat francais - Ministere de la Defense
 *   Raphael Fairise / BT Global Services / Etat francais - Ministere de la Defense
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

/*
 * Stuff specific to S/MIME policy and interoperability.
 *
 * $Id: smimeutil.c,v 1.20 2007/05/10 01:12:21 nelson%bolyard.com Exp $
 */

#include "secmime.h"
#include "secoid.h"
#include "pk11func.h"
#include "ciferfam.h"	/* for CIPHER_FAMILY symbols */
#include "secasn1.h"
#include "secitem.h"
#include "cert.h"
#include "key.h"
#include "secerr.h"
#include "cms.h"
#include "nss.h"
#include "cmslocal.h"

SEC_ASN1_MKSUB(CERT_IssuerAndSNTemplate)
SEC_ASN1_MKSUB(SEC_OctetStringTemplate)
SEC_ASN1_CHOOSER_DECLARE(CERT_IssuerAndSNTemplate)

/* various integer's ASN.1 encoding */
static unsigned char asn1_int40[] = { SEC_ASN1_INTEGER, 0x01, 0x28 };
static unsigned char asn1_int64[] = { SEC_ASN1_INTEGER, 0x01, 0x40 };
static unsigned char asn1_int128[] = { SEC_ASN1_INTEGER, 0x02, 0x00, 0x80 };

/* RC2 algorithm parameters (used in smime_cipher_map) */
static SECItem param_int40 = { siBuffer, asn1_int40, sizeof(asn1_int40) };
static SECItem param_int64 = { siBuffer, asn1_int64, sizeof(asn1_int64) };
static SECItem param_int128 = { siBuffer, asn1_int128, sizeof(asn1_int128) };

/*
 * XXX Would like the "parameters" field to be a SECItem *, but the
 * encoder is having trouble with optional pointers to an ANY.  Maybe
 * once that is fixed, can change this back...
 */
typedef struct {
    SECItem capabilityID;
    SECItem parameters;
    long cipher;		/* optimization */
} NSSSMIMECapability;

static const SEC_ASN1Template NSSSMIMECapabilityTemplate[] = {
    { SEC_ASN1_SEQUENCE,
	  0, NULL, sizeof(NSSSMIMECapability) },
    { SEC_ASN1_OBJECT_ID,
	  offsetof(NSSSMIMECapability,capabilityID), },
    { SEC_ASN1_OPTIONAL | SEC_ASN1_ANY,
	  offsetof(NSSSMIMECapability,parameters), },
    { 0, }
};

static const SEC_ASN1Template NSSSMIMECapabilitiesTemplate[] = {
    { SEC_ASN1_SEQUENCE_OF, 0, NSSSMIMECapabilityTemplate }
};

/*
 * NSSSMIMEEncryptionKeyPreference - if we find one of these, it needs to prompt us
 *  to store this and only this certificate permanently for the sender email address.
 */
typedef enum {
    NSSSMIMEEncryptionKeyPref_IssuerSN,
    NSSSMIMEEncryptionKeyPref_RKeyID,
    NSSSMIMEEncryptionKeyPref_SubjectKeyID
} NSSSMIMEEncryptionKeyPrefSelector;

typedef struct {
    NSSSMIMEEncryptionKeyPrefSelector selector;
    union {
	CERTIssuerAndSN			*issuerAndSN;
	NSSCMSRecipientKeyIdentifier	*recipientKeyID;
	SECItem				*subjectKeyID;
    } id;
} NSSSMIMEEncryptionKeyPreference;

extern const SEC_ASN1Template NSSCMSRecipientKeyIdentifierTemplate[];

static const SEC_ASN1Template smime_encryptionkeypref_template[] = {
    { SEC_ASN1_CHOICE,
	  offsetof(NSSSMIMEEncryptionKeyPreference,selector), NULL,
	  sizeof(NSSSMIMEEncryptionKeyPreference) },
    { SEC_ASN1_POINTER | SEC_ASN1_CONTEXT_SPECIFIC | SEC_ASN1_XTRN | 0
          | SEC_ASN1_CONSTRUCTED,
	  offsetof(NSSSMIMEEncryptionKeyPreference,id.issuerAndSN),
	  SEC_ASN1_SUB(CERT_IssuerAndSNTemplate),
	  NSSSMIMEEncryptionKeyPref_IssuerSN },
    { SEC_ASN1_POINTER | SEC_ASN1_CONTEXT_SPECIFIC | 1
          | SEC_ASN1_CONSTRUCTED,
	  offsetof(NSSSMIMEEncryptionKeyPreference,id.recipientKeyID),
	  NSSCMSRecipientKeyIdentifierTemplate,
	  NSSSMIMEEncryptionKeyPref_RKeyID },
    { SEC_ASN1_POINTER | SEC_ASN1_CONTEXT_SPECIFIC | SEC_ASN1_XTRN | 2
          | SEC_ASN1_CONSTRUCTED,
	  offsetof(NSSSMIMEEncryptionKeyPreference,id.subjectKeyID),
	  SEC_ASN1_SUB(SEC_OctetStringTemplate),
	  NSSSMIMEEncryptionKeyPref_SubjectKeyID },
    { 0, }
};

/*
 *
 * XIMF HEADERS SIGNED : ASN.1 BER
 *
 */

static const SEC_ASN1Template NSSCMSHeaderFieldElementTemplate[] = {
	{ SEC_ASN1_SEQUENCE, 0, NULL, sizeof(NSSCMSSecHeaderFieldElement) },
	{ SEC_ASN1_IA5_STRING, offsetof(NSSCMSSecHeaderFieldElement, HeaderFieldName)},
	{ SEC_ASN1_IA5_STRING, offsetof(NSSCMSSecHeaderFieldElement, HeaderFieldValue)},
	{ SEC_ASN1_INTEGER | SEC_ASN1_OPTIONAL, offsetof(NSSCMSSecHeaderFieldElement, HeaderFieldStatus)}, /* OPTIONAL, default=-1 */
	/*{ SEC_ASN1_INTEGER | SEC_ASN1_OPTIONAL | 1, offsetof(NSSCMSSecHeaderFieldElement, HeaderFieldEncrypted)},*/ /* OPTIONAL, default=-1 */
	{ 0 }
};

static const SEC_ASN1Template NSSCMSSecureHeaderElementTemplate[] = {
	{ SEC_ASN1_CHOICE, offsetof(NSSCMSSecureHeaderElement, selector), NULL, sizeof(NSSCMSSecureHeaderElement) },
	{ SEC_ASN1_ENUMERATED, offsetof(NSSCMSSecureHeaderElement,id.canonAlgorithm),NULL,NSSCMSSecureHeaderElement_canonAlgorithm},
	{ SEC_ASN1_SET_OF, offsetof(NSSCMSSecureHeaderElement,id.secHeaderFields), NSSCMSHeaderFieldElementTemplate, NSSCMSSecureHeaderElement_secHeaderField},
	{ 0 }
};

static const SEC_ASN1Template NSSCMSSecureHeaderTemplate[] = {
	{ SEC_ASN1_SET_OF, 0, NSSCMSSecureHeaderElementTemplate},
};



/* 
 * ESS Security Label
 * 
 * Implemented as a SET OF CHOICE because SET decoding is not implemented in NSS
 */
static const SEC_ASN1Template securityCategoryIdentifierTemplate[] = {
    { SEC_ASN1_OBJECT_ID, 0, NULL },
};

static const SEC_ASN1Template securityCategoryValueTemplate[] = {
    { SEC_ASN1_ANY, 0, NULL },
};

static const SEC_ASN1Template securityCategoryValueUTF8Template[] = {
    { SEC_ASN1_UTF8_STRING | SEC_ASN1_MAY_STREAM, 0, NULL, sizeof(SECItem) },
};

static const SEC_ASN1Template securityCategoryValueIntegerTemplate[] = {
    { SEC_ASN1_INTEGER, 0, NULL, sizeof(SECItem) },
};

static const SEC_ASN1Template NSSCMSSecurityLabelSecurityCategoryTemplate[] = {
    { SEC_ASN1_SEQUENCE, 0, NULL, sizeof(NSSCMSSecurityLabelSecurityCategory) },
    { SEC_ASN1_CONTEXT_SPECIFIC | 0, offsetof(NSSCMSSecurityLabelSecurityCategory, securityCategoryIdentifier), securityCategoryIdentifierTemplate },
    { SEC_ASN1_CONTEXT_SPECIFIC | SEC_ASN1_EXPLICIT | SEC_ASN1_CONSTRUCTED | 1, offsetof(NSSCMSSecurityLabelSecurityCategory, securityCategoryValue), securityCategoryValueTemplate },
    { 0 }
};

static const SEC_ASN1Template NSSCMSSecurityLabelElementTemplate[] = {
    { SEC_ASN1_CHOICE, offsetof(NSSCMSSecurityLabelElement, selector), NULL, sizeof(NSSCMSSecurityLabelElement) },
    { SEC_ASN1_OBJECT_ID, offsetof(NSSCMSSecurityLabelElement, id.securityPolicyIdentifier), NULL, NSSCMSSecurityLabelElement_securityPolicyIdentifier },
    { SEC_ASN1_INTEGER, offsetof(NSSCMSSecurityLabelElement, id.securityClassification), NULL, NSSCMSSecurityLabelElement_securityClassification },
    { SEC_ASN1_PRINTABLE_STRING, offsetof(NSSCMSSecurityLabelElement, id.privacyMarkPrintableString), NULL, NSSCMSSecurityLabelElement_privacyMarkPrintableString },
    { SEC_ASN1_UTF8_STRING, offsetof(NSSCMSSecurityLabelElement, id.privacyMarkUTF8), NULL, NSSCMSSecurityLabelElement_privacyMarkUTF8 },
    { SEC_ASN1_SET_OF, offsetof(NSSCMSSecurityLabelElement, id.securityCategories), NSSCMSSecurityLabelSecurityCategoryTemplate, NSSCMSSecurityLabelElement_securityCategories },
    { 0 }
};

static const SEC_ASN1Template NSSCMSSecurityLabelTemplate[] = {
    { SEC_ASN1_SET_OF, 0, NSSCMSSecurityLabelElementTemplate },
};


/* ESS Signed Receipt Request */
static const SEC_ASN1Template NSSCMSReceiptRequestReceiptsFromTemplate[] = {
    { SEC_ASN1_INTEGER, 0, NULL },
};

const SEC_ASN1Template NSSCMSReceiptRequestGeneralNameTemplate[] = {
    { SEC_ASN1_ANY | SEC_ASN1_MAY_STREAM, 0, NULL, sizeof(SECItem) }
};

static const SEC_ASN1Template NSSCMSReceiptRequestGeneralNamesTemplate[] = {
    { SEC_ASN1_SEQUENCE_OF, 0, NSSCMSReceiptRequestGeneralNameTemplate },
};

static const SEC_ASN1Template NSSCMSReceiptRequestTemplate[] = {
    { SEC_ASN1_SEQUENCE, 0, NULL, sizeof(NSSCMSReceiptRequest) },
    { SEC_ASN1_OCTET_STRING, offsetof(NSSCMSReceiptRequest, signedContentIdentifier) },
    { SEC_ASN1_CONTEXT_SPECIFIC | 0, offsetof(NSSCMSReceiptRequest, receiptsFrom), NSSCMSReceiptRequestReceiptsFromTemplate },
    { SEC_ASN1_SEQUENCE_OF, offsetof(NSSCMSReceiptRequest, receiptsTo), NSSCMSReceiptRequestGeneralNamesTemplate },
    { 0 }
};

/* ESS Signed Receipt */
static const SEC_ASN1Template NSSCMSReceiptTemplate[] = {
    { SEC_ASN1_SEQUENCE, 0, NULL, sizeof(NSSCMSReceipt) },
    { SEC_ASN1_INTEGER, offsetof(NSSCMSReceipt, version) },
    { SEC_ASN1_OBJECT_ID, offsetof(NSSCMSReceipt, contentType) },
    { SEC_ASN1_OCTET_STRING, offsetof(NSSCMSReceipt, signedContentIdentifier) },
    { SEC_ASN1_OCTET_STRING, offsetof(NSSCMSReceipt, originatorSignatureValue) },
    { 0 }
};

static const SEC_ASN1Template NSSCMSReceiptOctetStringTemplate[] = {
    { SEC_ASN1_OCTET_STRING | SEC_ASN1_MAY_STREAM, 0, NULL, sizeof(SECItem) }
};


/* smime_cipher_map - map of SMIME symmetric "ciphers" to algtag & parameters */
typedef struct {
    unsigned long cipher;
    SECOidTag algtag;
    SECItem *parms;
    PRBool enabled;	/* in the user's preferences */
    PRBool allowed;	/* per export policy */
} smime_cipher_map_entry;

/* global: list of supported SMIME symmetric ciphers, ordered roughly by increasing strength */
static smime_cipher_map_entry smime_cipher_map[] = {
/*    cipher			algtag			parms		enabled  allowed */
/*    ---------------------------------------------------------------------------------- */
    { SMIME_RC2_CBC_40,		SEC_OID_RC2_CBC,	&param_int40,	PR_TRUE, PR_TRUE },
    { SMIME_DES_CBC_56,		SEC_OID_DES_CBC,	NULL,		PR_TRUE, PR_TRUE },
    { SMIME_RC2_CBC_64,		SEC_OID_RC2_CBC,	&param_int64,	PR_TRUE, PR_TRUE },
    { SMIME_RC2_CBC_128,	SEC_OID_RC2_CBC,	&param_int128,	PR_TRUE, PR_TRUE },
    { SMIME_DES_EDE3_168,	SEC_OID_DES_EDE3_CBC,	NULL,		PR_TRUE, PR_TRUE },
    { SMIME_AES_CBC_128,	SEC_OID_AES_128_CBC,	NULL,		PR_TRUE, PR_TRUE },
    { SMIME_FORTEZZA,		SEC_OID_FORTEZZA_SKIPJACK, NULL,	PR_TRUE, PR_TRUE }
};
static const int smime_cipher_map_count = sizeof(smime_cipher_map) / sizeof(smime_cipher_map_entry);

/*
 * smime_mapi_by_cipher - find index into smime_cipher_map by cipher
 */
static int
smime_mapi_by_cipher(unsigned long cipher)
{
    int i;

    for (i = 0; i < smime_cipher_map_count; i++) {
	if (smime_cipher_map[i].cipher == cipher)
	    return i;	/* bingo */
    }
    return -1;		/* should not happen if we're consistent, right? */
}

/*
 * NSS_SMIME_EnableCipher - this function locally records the user's preference
 */
SECStatus 
NSS_SMIMEUtil_EnableCipher(unsigned long which, PRBool on)
{
    unsigned long mask;
    int mapi;

    mask = which & CIPHER_FAMILYID_MASK;

    PORT_Assert (mask == CIPHER_FAMILYID_SMIME);
    if (mask != CIPHER_FAMILYID_SMIME)
	/* XXX set an error! */
    	return SECFailure;

    mapi = smime_mapi_by_cipher(which);
    if (mapi < 0)
	/* XXX set an error */
	return SECFailure;

    /* do we try to turn on a forbidden cipher? */
    if (!smime_cipher_map[mapi].allowed && on) {
	PORT_SetError (SEC_ERROR_BAD_EXPORT_ALGORITHM);
	return SECFailure;
    }

    if (smime_cipher_map[mapi].enabled != on)
	smime_cipher_map[mapi].enabled = on;

    return SECSuccess;
}


/*
 * this function locally records the export policy
 */
SECStatus 
NSS_SMIMEUtil_AllowCipher(unsigned long which, PRBool on)
{
    unsigned long mask;
    int mapi;

    mask = which & CIPHER_FAMILYID_MASK;

    PORT_Assert (mask == CIPHER_FAMILYID_SMIME);
    if (mask != CIPHER_FAMILYID_SMIME)
	/* XXX set an error! */
    	return SECFailure;

    mapi = smime_mapi_by_cipher(which);
    if (mapi < 0)
	/* XXX set an error */
	return SECFailure;

    if (smime_cipher_map[mapi].allowed != on)
	smime_cipher_map[mapi].allowed = on;

    return SECSuccess;
}

/*
 * Based on the given algorithm (including its parameters, in some cases!)
 * and the given key (may or may not be inspected, depending on the
 * algorithm), find the appropriate policy algorithm specification
 * and return it.  If no match can be made, -1 is returned.
 */
static SECStatus
nss_smime_get_cipher_for_alg_and_key(SECAlgorithmID *algid, PK11SymKey *key, unsigned long *cipher)
{
    SECOidTag algtag;
    unsigned int keylen_bits;
    unsigned long c;

    algtag = SECOID_GetAlgorithmTag(algid);
    switch (algtag) {
    case SEC_OID_RC2_CBC:
	keylen_bits = PK11_GetKeyStrength(key, algid);
	switch (keylen_bits) {
	case 40:
	    c = SMIME_RC2_CBC_40;
	    break;
	case 64:
	    c = SMIME_RC2_CBC_64;
	    break;
	case 128:
	    c = SMIME_RC2_CBC_128;
	    break;
	default:
	    return SECFailure;
	}
	break;
    case SEC_OID_DES_CBC:
	c = SMIME_DES_CBC_56;
	break;
    case SEC_OID_DES_EDE3_CBC:
	c = SMIME_DES_EDE3_168;
	break;
    case SEC_OID_AES_128_CBC:
	c = SMIME_AES_CBC_128;
	break;
    case SEC_OID_FORTEZZA_SKIPJACK:
	c = SMIME_FORTEZZA;
	break;
    default:
	return SECFailure;
    }
    *cipher = c;
    return SECSuccess;
}

static PRBool
nss_smime_cipher_allowed(unsigned long which)
{
    int mapi;

    mapi = smime_mapi_by_cipher(which);
    if (mapi < 0)
	return PR_FALSE;
    return smime_cipher_map[mapi].allowed;
}

PRBool
NSS_SMIMEUtil_DecryptionAllowed(SECAlgorithmID *algid, PK11SymKey *key)
{
    unsigned long which;

    if (nss_smime_get_cipher_for_alg_and_key(algid, key, &which) != SECSuccess)
	return PR_FALSE;

    return nss_smime_cipher_allowed(which);
}


/*
 * NSS_SMIME_EncryptionPossible - check if any encryption is allowed
 *
 * This tells whether or not *any* S/MIME encryption can be done,
 * according to policy.  Callers may use this to do nicer user interface
 * (say, greying out a checkbox so a user does not even try to encrypt
 * a message when they are not allowed to) or for any reason they want
 * to check whether S/MIME encryption (or decryption, for that matter)
 * may be done.
 *
 * It takes no arguments.  The return value is a simple boolean:
 *   PR_TRUE means encryption (or decryption) is *possible*
 *	(but may still fail due to other reasons, like because we cannot
 *	find all the necessary certs, etc.; PR_TRUE is *not* a guarantee)
 *   PR_FALSE means encryption (or decryption) is not permitted
 *
 * There are no errors from this routine.
 */
PRBool
NSS_SMIMEUtil_EncryptionPossible(void)
{
    int i;

    for (i = 0; i < smime_cipher_map_count; i++) {
	if (smime_cipher_map[i].allowed)
	    return PR_TRUE;
    }
    return PR_FALSE;
}


static int
nss_SMIME_FindCipherForSMIMECap(NSSSMIMECapability *cap)
{
    int i;
    SECOidTag capIDTag;

    /* we need the OIDTag here */
    capIDTag = SECOID_FindOIDTag(&(cap->capabilityID));

    /* go over all the SMIME ciphers we know and see if we find a match */
    for (i = 0; i < smime_cipher_map_count; i++) {
	if (smime_cipher_map[i].algtag != capIDTag)
	    continue;
	/*
	 * XXX If SECITEM_CompareItem allowed NULLs as arguments (comparing
	 * 2 NULLs as equal and NULL and non-NULL as not equal), we could
	 * use that here instead of all of the following comparison code.
	 */
	if (!smime_cipher_map[i].parms) { 
	    if (!cap->parameters.data || !cap->parameters.len)
		break;	/* both empty: bingo */
	    if (cap->parameters.len     == 2  &&
	        cap->parameters.data[0] == SEC_ASN1_NULL &&
		cap->parameters.data[1] == 0) 
		break;  /* DER NULL == NULL, bingo */
	} else if (cap->parameters.data != NULL && 
	    cap->parameters.len == smime_cipher_map[i].parms->len &&
	    PORT_Memcmp (cap->parameters.data, smime_cipher_map[i].parms->data,
			     cap->parameters.len) == 0)
	{
	    break;	/* both not empty, same length & equal content: bingo */
	}
    }

    if (i == smime_cipher_map_count)
	return 0;				/* no match found */
    return smime_cipher_map[i].cipher;	/* match found, point to cipher */
}

/*
 * smime_choose_cipher - choose a cipher that works for all the recipients
 *
 * "scert"  - sender's certificate
 * "rcerts" - recipient's certificates
 */
static long
smime_choose_cipher(CERTCertificate *scert, CERTCertificate **rcerts)
{
    PRArenaPool *poolp;
    long cipher;
    long chosen_cipher;
    int *cipher_abilities;
    int *cipher_votes;
    int weak_mapi;
    int strong_mapi;
    int rcount, mapi, max, i;
    PRBool scert_is_fortezza = (scert == NULL) ? PR_FALSE : PK11_FortezzaHasKEA(scert);

    chosen_cipher = SMIME_RC2_CBC_40;		/* the default, LCD */
    weak_mapi = smime_mapi_by_cipher(chosen_cipher);

    poolp = PORT_NewArena (1024);		/* XXX what is right value? */
    if (poolp == NULL)
	goto done;

    cipher_abilities = (int *)PORT_ArenaZAlloc(poolp, smime_cipher_map_count * sizeof(int));
    cipher_votes     = (int *)PORT_ArenaZAlloc(poolp, smime_cipher_map_count * sizeof(int));
    if (cipher_votes == NULL || cipher_abilities == NULL)
	goto done;

    /* If the user has the Fortezza preference turned on, make
     *  that the strong cipher. Otherwise, use triple-DES. */
    strong_mapi = smime_mapi_by_cipher (SMIME_DES_EDE3_168);
    if (scert_is_fortezza) {
	mapi = smime_mapi_by_cipher(SMIME_FORTEZZA);
	if (mapi >= 0 && smime_cipher_map[mapi].enabled)
	    strong_mapi = mapi;
    }

    /* walk all the recipient's certs */
    for (rcount = 0; rcerts[rcount] != NULL; rcount++) {
	SECItem *profile;
	NSSSMIMECapability **caps;
	int pref;

	/* the first cipher that matches in the user's SMIME profile gets
	 * "smime_cipher_map_count" votes; the next one gets "smime_cipher_map_count" - 1
	 * and so on. If every cipher matches, the last one gets 1 (one) vote */
	pref = smime_cipher_map_count;

	/* find recipient's SMIME profile */
	profile = CERT_FindSMimeProfile(rcerts[rcount]);

	if (profile != NULL && profile->data != NULL && profile->len > 0) {
	    /* we have a profile (still DER-encoded) */
	    caps = NULL;
	    /* decode it */
	    if (SEC_QuickDERDecodeItem(poolp, &caps,
                    NSSSMIMECapabilitiesTemplate, profile) == SECSuccess &&
		    caps != NULL)
	    {
		/* walk the SMIME capabilities for this recipient */
		for (i = 0; caps[i] != NULL; i++) {
		    cipher = nss_SMIME_FindCipherForSMIMECap(caps[i]);
		    mapi = smime_mapi_by_cipher(cipher);
		    if (mapi >= 0) {
			/* found the cipher */
			cipher_abilities[mapi]++;
			cipher_votes[mapi] += pref;
			--pref;
		    }
		}
	    }
	} else {
	    /* no profile found - so we can only assume that the user can do
	     * the mandatory algorithms which is RC2-40 (weak crypto) and 3DES (strong crypto) */
	    SECKEYPublicKey *key;
	    unsigned int pklen_bits;

	    /*
	     * if recipient's public key length is > 512, vote for a strong cipher
	     * please not that the side effect of this is that if only one recipient
	     * has an export-level public key, the strong cipher is disabled.
	     *
	     * XXX This is probably only good for RSA keys.  What I would
	     * really like is a function to just say;  Is the public key in
	     * this cert an export-length key?  Then I would not have to
	     * know things like the value 512, or the kind of key, or what
	     * a subjectPublicKeyInfo is, etc.
	     */
	    key = CERT_ExtractPublicKey(rcerts[rcount]);
	    pklen_bits = 0;
	    if (key != NULL) {
		pklen_bits = SECKEY_PublicKeyStrength (key) * 8;
		SECKEY_DestroyPublicKey (key);
	    }

	    if (pklen_bits > 512) {
		/* cast votes for the strong algorithm */
		cipher_abilities[strong_mapi]++;
		cipher_votes[strong_mapi] += pref;
		pref--;
	    } 

	    /* always cast (possibly less) votes for the weak algorithm */
	    cipher_abilities[weak_mapi]++;
	    cipher_votes[weak_mapi] += pref;
	}
	if (profile != NULL)
	    SECITEM_FreeItem(profile, PR_TRUE);
    }

    /* find cipher that is agreeable by all recipients and that has the most votes */
    max = 0;
    for (mapi = 0; mapi < smime_cipher_map_count; mapi++) {
	/* if not all of the recipients can do this, forget it */
	if (cipher_abilities[mapi] != rcount)
	    continue;
	/* if cipher is not enabled or not allowed by policy, forget it */
	if (!smime_cipher_map[mapi].enabled || !smime_cipher_map[mapi].allowed)
	    continue;
	/* if we're not doing fortezza, but the cipher is fortezza, forget it */
	if (!scert_is_fortezza  && (smime_cipher_map[mapi].cipher == SMIME_FORTEZZA))
	    continue;
	/* now see if this one has more votes than the last best one */
	if (cipher_votes[mapi] >= max) {
	    /* if equal number of votes, prefer the ones further down in the list */
	    /* with the expectation that these are higher rated ciphers */
	    chosen_cipher = smime_cipher_map[mapi].cipher;
	    max = cipher_votes[mapi];
	}
    }
    /* if no common cipher was found, chosen_cipher stays at the default */

done:
    if (poolp != NULL)
	PORT_FreeArena (poolp, PR_FALSE);

    return chosen_cipher;
}

/*
 * XXX This is a hack for now to satisfy our current interface.
 * Eventually, with more parameters needing to be specified, just
 * looking up the keysize is not going to be sufficient.
 */
static int
smime_keysize_by_cipher (unsigned long which)
{
    int keysize;

    switch (which) {
      case SMIME_RC2_CBC_40:
	keysize = 40;
	break;
      case SMIME_RC2_CBC_64:
	keysize = 64;
	break;
      case SMIME_RC2_CBC_128:
      case SMIME_AES_CBC_128:
	keysize = 128;
	break;
      case SMIME_DES_CBC_56:
      case SMIME_DES_EDE3_168:
      case SMIME_FORTEZZA:
	/*
	 * These are special; since the key size is fixed, we actually
	 * want to *avoid* specifying a key size.
	 */
	keysize = 0;
	break;
      default:
	keysize = -1;
	break;
    }

    return keysize;
}

/*
 * NSS_SMIMEUtil_FindBulkAlgForRecipients - find bulk algorithm suitable for all recipients
 *
 * it would be great for UI purposes if there would be a way to find out which recipients
 * prevented a strong cipher from being used...
 */
SECStatus
NSS_SMIMEUtil_FindBulkAlgForRecipients(CERTCertificate **rcerts, SECOidTag *bulkalgtag, int *keysize)
{
    unsigned long cipher;
    int mapi;

    cipher = smime_choose_cipher(NULL, rcerts);
    mapi = smime_mapi_by_cipher(cipher);

    *bulkalgtag = smime_cipher_map[mapi].algtag;
    *keysize = smime_keysize_by_cipher(smime_cipher_map[mapi].cipher);

    return SECSuccess;
}

/*
 * NSS_SMIMEUtil_CreateSMIMECapabilities - get S/MIME capabilities for this instance of NSS
 *
 * scans the list of allowed and enabled ciphers and construct a PKCS9-compliant
 * S/MIME capabilities attribute value.
 *
 * XXX Please note that, in contradiction to RFC2633 2.5.2, the capabilities only include
 * symmetric ciphers, NO signature algorithms or key encipherment algorithms.
 *
 * "poolp" - arena pool to create the S/MIME capabilities data on
 * "dest" - SECItem to put the data in
 * "includeFortezzaCiphers" - PR_TRUE if fortezza ciphers should be included
 */
SECStatus
NSS_SMIMEUtil_CreateSMIMECapabilities(PLArenaPool *poolp, SECItem *dest, PRBool includeFortezzaCiphers)
{
    NSSSMIMECapability *cap;
    NSSSMIMECapability **smime_capabilities;
    smime_cipher_map_entry *map;
    SECOidData *oiddata;
    SECItem *dummy;
    int i, capIndex;

    /* if we have an old NSSSMIMECapability array, we'll reuse it (has the right size) */
    /* smime_cipher_map_count + 1 is an upper bound - we might end up with less */
    smime_capabilities = (NSSSMIMECapability **)PORT_ZAlloc((smime_cipher_map_count + 1)
				      * sizeof(NSSSMIMECapability *));
    if (smime_capabilities == NULL)
	return SECFailure;

    capIndex = 0;

    /* Add all the symmetric ciphers
     * We walk the cipher list backwards, as it is ordered by increasing strength,
     * we prefer the stronger cipher over a weaker one, and we have to list the
     * preferred algorithm first */
    for (i = smime_cipher_map_count - 1; i >= 0; i--) {
	/* Find the corresponding entry in the cipher map. */
	map = &(smime_cipher_map[i]);
	if (!map->enabled)
	    continue;

	/* If we're using a non-Fortezza cert, only advertise non-Fortezza
	   capabilities. (We advertise all capabilities if we have a 
	   Fortezza cert.) */
	if ((!includeFortezzaCiphers) && (map->cipher == SMIME_FORTEZZA))
	    continue;

	/* get next SMIME capability */
	cap = (NSSSMIMECapability *)PORT_ZAlloc(sizeof(NSSSMIMECapability));
	if (cap == NULL)
	    break;
	smime_capabilities[capIndex++] = cap;

	oiddata = SECOID_FindOIDByTag(map->algtag);
	if (oiddata == NULL)
	    break;

	cap->capabilityID.data = oiddata->oid.data;
	cap->capabilityID.len = oiddata->oid.len;
	cap->parameters.data = map->parms ? map->parms->data : NULL;
	cap->parameters.len = map->parms ? map->parms->len : 0;
	cap->cipher = smime_cipher_map[i].cipher;
    }

    /* XXX add signature algorithms */
    /* XXX add key encipherment algorithms */

    smime_capabilities[capIndex] = NULL;	/* last one - now encode */
    dummy = SEC_ASN1EncodeItem(poolp, dest, &smime_capabilities, NSSSMIMECapabilitiesTemplate);

    /* now that we have the proper encoded SMIMECapabilities (or not),
     * free the work data */
    for (i = 0; smime_capabilities[i] != NULL; i++)
	PORT_Free(smime_capabilities[i]);
    PORT_Free(smime_capabilities);

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_CreateSMIMEEncKeyPrefs - create S/MIME encryption key preferences attr value
 *
 * "poolp" - arena pool to create the attr value on
 * "dest" - SECItem to put the data in
 * "cert" - certificate that should be marked as preferred encryption key
 *          cert is expected to have been verified for EmailRecipient usage.
 */
SECStatus
NSS_SMIMEUtil_CreateSMIMEEncKeyPrefs(PLArenaPool *poolp, SECItem *dest, CERTCertificate *cert)
{
    NSSSMIMEEncryptionKeyPreference ekp;
    SECItem *dummy = NULL;
    PLArenaPool *tmppoolp = NULL;

    if (cert == NULL)
	goto loser;

    tmppoolp = PORT_NewArena(1024);
    if (tmppoolp == NULL)
	goto loser;

    /* XXX hardcoded IssuerSN choice for now */
    ekp.selector = NSSSMIMEEncryptionKeyPref_IssuerSN;
    ekp.id.issuerAndSN = CERT_GetCertIssuerAndSN(tmppoolp, cert);
    if (ekp.id.issuerAndSN == NULL)
	goto loser;

    dummy = SEC_ASN1EncodeItem(poolp, dest, &ekp, smime_encryptionkeypref_template);

loser:
    if (tmppoolp) PORT_FreeArena(tmppoolp, PR_FALSE);

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_CreateSMIMEEncKeyPrefs - create S/MIME encryption key preferences attr value using MS oid
 *
 * "poolp" - arena pool to create the attr value on
 * "dest" - SECItem to put the data in
 * "cert" - certificate that should be marked as preferred encryption key
 *          cert is expected to have been verified for EmailRecipient usage.
 */
SECStatus
NSS_SMIMEUtil_CreateMSSMIMEEncKeyPrefs(PLArenaPool *poolp, SECItem *dest, CERTCertificate *cert)
{
    SECItem *dummy = NULL;
    PLArenaPool *tmppoolp = NULL;
    CERTIssuerAndSN *isn;

    if (cert == NULL)
	goto loser;

    tmppoolp = PORT_NewArena(1024);
    if (tmppoolp == NULL)
	goto loser;

    isn = CERT_GetCertIssuerAndSN(tmppoolp, cert);
    if (isn == NULL)
	goto loser;

    dummy = SEC_ASN1EncodeItem(poolp, dest, isn, SEC_ASN1_GET(CERT_IssuerAndSNTemplate));

loser:
    if (tmppoolp) PORT_FreeArena(tmppoolp, PR_FALSE);

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/**
 * Encode in DER a dot-separated string of integers
 * @param in data Dot-separated string of integers
 * @param in len Length of data
 * @param out output Pointer to a DER-encoded string which will be allocated - caller will have to PORT_Free() it
 * @param out outputLen Length of returned output Buffer
 * @return *output or NULL if encoding failed
 */
void *
NSS_SMIMEUtil_EncodeOid(const char *data, const unsigned int len, unsigned char **output, unsigned int *outputLen)
{
    unsigned int i;
    unsigned int k;
    unsigned int dotCount;
    unsigned int *oid;
    unsigned int n;
    unsigned int itemCount;
    unsigned char tempDER[5];

    *outputLen = 0;

    /* Count number of dot in the string */
    dotCount = 0;
    for (i = 0; i < len; i++)
        if (data[i] == '.')
            dotCount++;

    if (dotCount == 0)
        return NULL;

    /* Allocate OID array of integers */
    oid = PORT_Alloc((dotCount + 1) * sizeof(unsigned int));
    if (oid == NULL)
        return NULL;

    /* Convert decimal, dot-separated OID string to an array of integers */
    n = 0;
    itemCount = 0;
    for (i = 0; i <= len; i++) { /* Analyze all characters + 1 loop at the end */
        if (i == len || data[i] == '.') {
            /* Store number */
            oid[itemCount++] = n;
            n = 0;
        } else if (data[i] >= '0' && data[i] <= '9') {
            /* Add digit to number */
            n *= 10;
            n += data[i] - '0';
        } else {
            /* Unknown character */
            PORT_Free(oid);
            return NULL;
        }
    }

    /* Error if less than 2 items */
    if (itemCount < 2) {
        PORT_Free(oid);
        return SECFailure;
    }

    /* Check range of first 2 items */
    if ((oid[0] < 2 && oid[1] > 39) ||
        (oid[0] == 2 && oid[1] > 47) ||
        (oid[0] > 2)) {
        PORT_Free(oid);
        return NULL;
    }

    /* Allocate DER-encoded buffer: 5 bytes by item maximum */
    *output = PORT_Alloc((itemCount * 5) * sizeof(unsigned char));
    if (*output == NULL) {
        PORT_Free(oid);
        return NULL;
    }

    /* DER encode the array of integers */
    /* First byte contains first and second items */
    (*output)[(*outputLen)++] = oid[0] * 40 + oid[1];
    /* Next bytes */
    for (i = 2; i < itemCount; i++) {
        n = 0;
        do {
            if (n == 5) {/* 5 bytes by item maximum */
                PORT_Free(oid);
                return NULL;
            }
            tempDER[n] = oid[i] & 0x7F;
            if (n != 0)
                tempDER[n] |= 0x80;
            oid[i] >>= 7;
            n++;
        } while (oid[i] > 0);
        for (k = 0; k < n; k++)
            (*output)[(*outputLen)++] = tempDER[n - 1 - k];
    }

    PORT_Free(oid);

    return *output;
}

/**
 * Decode a DER encoded OID to a dot-separated string of integers
 * @param in data DER encoded buffer
 * @param in len Length of data
 * @param out output Pointer to a string which will be allocated - caller will have to PORT_Free() it
 * @return SECSuccess or SECFailure if decoding failed
 */
SECStatus
NSS_SMIMEUtil_DecodeOid(const unsigned char *data, const unsigned int len, char **output)
{
    unsigned int itemCount;
    unsigned int outputCount;
    unsigned int i;
    unsigned int n;
    unsigned int *oid;

    if (len == 0 || data[0] >= 128)
        return SECFailure;

    /* Convert DER encoded OID to an array of integers (number of values is less than 'len + 1') */
    oid = PORT_Alloc((len + 1) * sizeof(unsigned int));
    if (oid == NULL)
        return SECFailure;

    itemCount = 0;
    /* Range of second item is 0-39 if first item is 0 or 1
     * and 0-47 if first item is 2 */
    if (data[0] < 120) {
        oid[itemCount++] = data[0] / 40;
        oid[itemCount++] = data[0] % 40;
    } else {
        oid[itemCount++] = 2;
        oid[itemCount++] = data[0] - (2 * 40);
    }

    n = 0;
    for (i = 1; i < len; i++) {
        n = n * 128 + (data[i] & 0x7F);
        if ((data[i] & 0x80) != 0x80) {
            oid[itemCount++] = n;
            n = 0;
        }
    }

    /* Allocate output string: max 7 characters by number + '.' */
    *output = PORT_Alloc(itemCount * (7 + 1) * sizeof(char));
    if (*output == NULL) {
        PORT_Free(oid);
        return SECFailure;
    }

    outputCount = 0;
    for (i = 0; i < itemCount; i++) {
        if (i != 0) {
            (*output)[outputCount] = '.';
            outputCount++;
        }
        outputCount += sprintf(&((*output)[outputCount]), "%d", oid[i]);
    }
    (*output)[outputCount] = '\0';

    PORT_Free(oid);

    return SECSuccess;
}

/*
 * NSS_SMIMEUtil_CreateSecurityLabel - create S/MIME SecurityLabel attr value
 */
SECStatus
NSS_SMIMEUtil_CreateSecurityLabel(PLArenaPool *poolp, SECItem *dest, const char *securityPolicyIdentifier, PRInt32 securityClassification, const char *privacyMark, const char *securityCategories)
{
    NSSCMSSecurityLabelElement **securityLabel;
    SECItem *dummy = NULL;
    unsigned int len;
    unsigned int i;
    unsigned int k;
    unsigned int separatorCount;
    unsigned int categoryCount;
    unsigned int startPosition;
    unsigned int fieldLen;
    const char securityCategoriesSeparator = '|';
    unsigned int securityLabelItem;
    SECItem tempSecurityCategoryValue;
    unsigned int tempSecurityCategoryValueType;
    unsigned char *tempSecurityCategoryValueString;
    unsigned int tempSecurityCategoryValueInteger;

    /* Array of 4 elements max + 1 NULL at the end = 5 elements */
    securityLabel = PORT_Alloc(5 * sizeof(NSSCMSSecurityLabelElement*));
    for (i = 0; i < 5; i++)
        securityLabel[i] = NULL;

    securityLabelItem = 0;

    /*
     * securityPolicyIdentifier
     */
    securityLabel[securityLabelItem] = PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
    securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityPolicyIdentifier;
    if (NSS_SMIMEUtil_EncodeOid(securityPolicyIdentifier, PORT_Strlen(securityPolicyIdentifier), &(securityLabel[securityLabelItem]->id.securityPolicyIdentifier.data), &(securityLabel[securityLabelItem]->id.securityPolicyIdentifier.len)) == NULL)
        goto loser;
    securityLabelItem++;


    /*
     * securityClassification
     */
    if (securityClassification != -1) {
        securityLabel[securityLabelItem] = PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
        securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityClassification;

        if (SEC_ASN1EncodeInteger(poolp, &(securityLabel[securityLabelItem]->id.securityClassification), securityClassification) == NULL)
            goto loser;
        securityLabelItem++;
    }


    /*
     * privacyMark
     */
    len = PORT_Strlen(privacyMark);
    if (len > 0) {
        securityLabel[securityLabelItem] = PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
        securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_privacyMarkUTF8;

        securityLabel[securityLabelItem]->id.privacyMarkUTF8.len = 0;
        securityLabel[securityLabelItem]->id.privacyMarkUTF8.data = PORT_Alloc(len * sizeof(unsigned char));
        if (securityLabel[securityLabelItem]->id.privacyMarkUTF8.data == NULL)
            goto loser;
        PORT_Memcpy(securityLabel[securityLabelItem]->id.privacyMarkUTF8.data, privacyMark, len);
        securityLabel[securityLabelItem]->id.privacyMarkUTF8.len = len;
        securityLabelItem++;
    }


    /*
     * securityCategories
     * format: cat1_OID|cat1_type|cat1_value|cat2_OID|cat2_type|cat2_value|cat3_OID|cat3_type|cat3_value
     *
     *   catX_type: 1 (UTF-8)
     *              2 (integer)
     */
    len = PORT_Strlen(securityCategories);
    if (len > 0) {
        separatorCount = 0;

        /* Count number of separator character */
        for (i = 0; i < len; i++)
            if (securityCategories[i] == securityCategoriesSeparator)
                separatorCount++;


        /* Separator count must be correct */
        if (separatorCount < 2 || (((separatorCount - 2 ) % 3) != 0))
            goto loser;
        categoryCount = ((separatorCount - 2 ) / 3) + 1;

        /* Create object */
        securityLabel[securityLabelItem] = PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
        securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityCategories;

        /* Allocate categoryCount + 1 NULL securityCategories */
        securityLabel[securityLabelItem]->id.securityCategories = PORT_Alloc((categoryCount + 1) * sizeof(NSSCMSSecurityLabelSecurityCategory*));
        if (securityLabel[securityLabelItem]->id.securityCategories == NULL)
            goto loser;
        for (i = 0; i < categoryCount; i++) {
            securityLabel[securityLabelItem]->id.securityCategories[i] = PORT_Alloc(sizeof(NSSCMSSecurityLabelSecurityCategory));
            if (securityLabel[securityLabelItem]->id.securityCategories[i] == NULL)
                goto loser;
            securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryIdentifier.len = 0;
            securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryValue.len = 0;
        }
        /* Last one is NULL */
        securityLabel[securityLabelItem]->id.securityCategories[categoryCount] = NULL;


        startPosition = 0;

        for (i = 0; i < categoryCount; i++) {
            /* Search and copy securityCategoryIdentifier */
            fieldLen = 0;
            for (k = startPosition; k < len; k++) {
                if (securityCategories[k] == securityCategoriesSeparator) {
                    fieldLen = k - startPosition;
                    break;
                }
            }

            if (fieldLen > 0) {
                if (NSS_SMIMEUtil_EncodeOid(securityCategories + startPosition, fieldLen, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryIdentifier.data), &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryIdentifier.len)) == NULL)
                    goto loser;
                startPosition += fieldLen + 1;
            } else
                goto loser;

            /* Search type */
            fieldLen = 0;
            for (k = startPosition; k < len; k++) {
                if (securityCategories[k] == securityCategoriesSeparator) {
                    fieldLen = k - startPosition;
                    break;
                }
            }

            if (fieldLen == 1) {
                tempSecurityCategoryValueType = 0;
                if (securityCategories[startPosition] >= '0' && securityCategories[startPosition] <= '9')
                    tempSecurityCategoryValueType = securityCategories[startPosition] - '0';

                startPosition += fieldLen + 1;
            } else
                goto loser;

            /* Search and copy securityCategoryValue */
            fieldLen = 0;
            for (k = startPosition; k < len; k++) {
                if (securityCategories[k] == securityCategoriesSeparator) {
                    fieldLen = k - startPosition;
                    break;
                }
                if (k == len - 1) { /* Last char */
                    fieldLen = k - startPosition + 1;
                    break;
                }
            }

            if (fieldLen > 0) {
                switch (tempSecurityCategoryValueType) {
                    case SECURITY_CATEGORY_VALUE_TYPE_UTF8:
                        tempSecurityCategoryValue.data = securityCategories + startPosition;
                        tempSecurityCategoryValue.len = fieldLen;
                        if (SEC_ASN1EncodeItem(poolp, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryValue), &tempSecurityCategoryValue, securityCategoryValueUTF8Template) == NULL)
                            goto loser;
                        break;
                    case SECURITY_CATEGORY_VALUE_TYPE_INTEGER:
                        tempSecurityCategoryValueString = PORT_Alloc((fieldLen + 1) * sizeof(unsigned char));
                        PORT_Memcpy(tempSecurityCategoryValueString, securityCategories + startPosition, fieldLen);
                        tempSecurityCategoryValueString[fieldLen] = '\0';
                        tempSecurityCategoryValueInteger = atoi(tempSecurityCategoryValueString);
                        PORT_Free(tempSecurityCategoryValueString);

                        if (SEC_ASN1EncodeInteger(poolp, &tempSecurityCategoryValue, tempSecurityCategoryValueInteger) == NULL)
                            goto loser;

                        if (SEC_ASN1EncodeItem(poolp, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryValue), &tempSecurityCategoryValue, securityCategoryValueIntegerTemplate) == NULL)
                            goto loser;
                        break;
                    default:
                        goto loser;
                        break;
                }


                startPosition += fieldLen + 1;
            } else
                goto loser;

        }
        securityLabelItem++;
    }


    /* Encode Security Label */
    dummy = SEC_ASN1EncodeItem(poolp, dest, &securityLabel, NSSCMSSecurityLabelTemplate);

loser:
    for (i = 0; securityLabel[i] != NULL; i++) {
        switch (securityLabel[i]->selector) {
            case NSSCMSSecurityLabelElement_securityPolicyIdentifier:
                if (securityLabel[i]->id.securityPolicyIdentifier.len > 0)
                    PORT_Free(securityLabel[i]->id.securityPolicyIdentifier.data);
                break;
            case NSSCMSSecurityLabelElement_securityClassification:
                break;
            case NSSCMSSecurityLabelElement_privacyMarkPrintableString:
                if (securityLabel[i]->id.privacyMarkPrintableString.len > 0)
                    PORT_Free(securityLabel[i]->id.privacyMarkPrintableString.data);
                break;
            case NSSCMSSecurityLabelElement_privacyMarkUTF8:
                if (securityLabel[i]->id.privacyMarkUTF8.len > 0)
                    PORT_Free(securityLabel[i]->id.privacyMarkUTF8.data);
                break;
            case NSSCMSSecurityLabelElement_securityCategories:
                if (securityLabel[i]->id.securityCategories != NULL) {
                    for (k = 0; securityLabel[i]->id.securityCategories[k] != NULL; k++) {
                        if (securityLabel[i]->id.securityCategories[k]->securityCategoryIdentifier.len > 0)
                            PORT_Free(securityLabel[i]->id.securityCategories[k]->securityCategoryIdentifier.data);
                        PORT_Free(securityLabel[i]->id.securityCategories[k]);
                    }
                    PORT_Free(securityLabel[i]->id.securityCategories);
                }
                break;
        }

        PORT_Free(securityLabel[i]);
    }
    PORT_Free(securityLabel);

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_GetSecurityLabel - get S/MIME SecurityLabel attr value
 */
SECStatus
NSS_SMIMEUtil_GetSecurityLabel(NSSCMSSignerInfo *aSignerinfo, char **aSecurityPolicyIdentifier, PRInt32 *aSecurityClassification, char **aPrivacyMark, char **aSecurityCategories)
{
    NSSCMSAttribute *attr;
    SECStatus rv = SECSuccess;

    PLArenaPool *poolp;
    void *mark;

    NSSCMSSecurityLabel securityLabel;
    NSSCMSSecurityLabelElement *securityLabelElement;
    unsigned int elementId;
    unsigned int len;
    char *tempBuffer;
    const char securityCategoriesSeparator = '|';
    unsigned int i;
    char *oid;
    char *tempSecurityCategories;
    unsigned int tempIntValue;
    SECItem tempSECItemValue;
    int ret;

    /* We have to check uniqueness of each element as we use a SET_OF CHOICE instead of a SET */
    PRBool securityPolicyIdentifierFound = PR_FALSE;
    PRBool securityClassificationFound = PR_FALSE;
    PRBool privacyMarkFound = PR_FALSE;
    PRBool securityCategoriesFound = PR_FALSE;

    poolp = aSignerinfo->cmsg->poolp;
    mark = PORT_ArenaMark(poolp);

    attr = NSS_CMSAttributeArray_FindAttrByOidTag(aSignerinfo->authAttr, SEC_OID_SMIME_SECURITY_LABEL, PR_TRUE);

    if (attr == NULL || attr->values == NULL || attr->values[0] == NULL) {
        rv = SECFailure;
        goto loser;
    }

    if ((rv = SEC_ASN1DecodeItem(poolp, &securityLabel, NSSCMSSecurityLabelTemplate, attr->values[0])) != SECSuccess)
        goto loser;

    for (elementId = 0; securityLabel.element[elementId] != NULL; elementId++) {

        securityLabelElement = securityLabel.element[elementId];

        switch (securityLabelElement->selector) {

            case NSSCMSSecurityLabelElement_securityPolicyIdentifier:
                /*
                 * securityPolicyIdentifier
                 */
                if (securityPolicyIdentifierFound) {
                    rv = SECFailure;
                    break;
                }
                securityPolicyIdentifierFound = PR_TRUE;

                if (securityLabelElement->id.securityPolicyIdentifier.len > 0 && securityLabelElement->id.securityPolicyIdentifier.data[0] < 128) {
                    tempBuffer = NULL;

                    if ((rv = NSS_SMIMEUtil_DecodeOid(securityLabelElement->id.securityPolicyIdentifier.data, securityLabelElement->id.securityPolicyIdentifier.len, &tempBuffer)) != SECSuccess)
                        break;

                    if (tempBuffer != NULL) {
                        len = PORT_Strlen(tempBuffer);
                        *aSecurityPolicyIdentifier = PORT_Alloc((len + 1) * sizeof(char));
                        PORT_Memcpy(*aSecurityPolicyIdentifier, tempBuffer, len + 1);
                        PORT_Free(tempBuffer);
                    }
                }
                break;

            case NSSCMSSecurityLabelElement_securityClassification:
                /*
                 * securityClassification
                 */
                if (securityClassificationFound) {
                    rv = SECFailure;
                    break;
                }
                securityClassificationFound = PR_TRUE;

                *aSecurityClassification = -1;
                if ((rv = SEC_ASN1DecodeInteger(&(securityLabelElement->id.securityClassification), aSecurityClassification)) != SECSuccess)
                    break;
                break;

            case NSSCMSSecurityLabelElement_privacyMarkPrintableString:
                /*
                 * privacyMark (PrintableString)
                 */
                if (privacyMarkFound) {
                    rv = SECFailure;
                    break;
                }
                privacyMarkFound = PR_TRUE;

                len = securityLabelElement->id.privacyMarkPrintableString.len;

                if (len > 0) {
                    tempBuffer = PORT_Alloc((len + 1) * sizeof(char));
                    if (tempBuffer == NULL) {
                        rv = SECFailure;
                        break;
                    }
                    PORT_Memcpy(tempBuffer, securityLabelElement->id.privacyMarkPrintableString.data, len);
                    tempBuffer[len] = '\0';

                    *aPrivacyMark = tempBuffer;
                }
                break;

            case NSSCMSSecurityLabelElement_privacyMarkUTF8:
                /*
                 * privacyMark (UTF8)
                 */
                if (privacyMarkFound) {
                    rv = SECFailure;
                    break;
                }
                privacyMarkFound = PR_TRUE;

                len = securityLabelElement->id.privacyMarkUTF8.len;

                if (len > 0) {
                    tempBuffer = PORT_Alloc((len + 1) * sizeof(char));
                    if (tempBuffer == NULL)
                        return SECFailure;
                    PORT_Memcpy(tempBuffer, securityLabelElement->id.privacyMarkUTF8.data, len);
                    tempBuffer[len] = '\0';

                    *aPrivacyMark = tempBuffer;
                }
                break;

            case NSSCMSSecurityLabelElement_securityCategories:
                /*
                 * securityCategories
                 */
                if (securityCategoriesFound) {
                    rv = SECFailure;
                    break;
                }
                securityCategoriesFound = PR_TRUE;

                if (securityLabelElement->id.securityCategories == NULL) {
                    rv = SECFailure;
                    break;
                }

                /* Compute size of buffer */
                len = 0;
                for (i = 0; securityLabelElement->id.securityCategories[i] != NULL; i++) {
                    oid = NULL;
                    if ((rv = NSS_SMIMEUtil_DecodeOid(securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.data, securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.len, &oid)) != SECSuccess)
                        break;

                    if (oid != NULL) {
                        /* Add size of securityCategoryIdentifier */
                        len += PORT_Strlen(oid);
                        PORT_Free(oid);

                        /* Add size of type field */
                        len += 1;

                        /* Add size of securityCategoryValue */
                        if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 2) {
                            if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0] == SEC_ASN1_INTEGER) /* Integer */
                                len += 10; /* 10 characters max for an integer */
                            else /* UTF-8 and other types */
                                len += securityLabelElement->id.securityCategories[i]->securityCategoryValue.len;
                        }

                        /* Add size of 3 separators */
                        len += 3;
                    }
                }

                if (len > 0) {
                    /* Create buffer */
                    tempSecurityCategories = PORT_Alloc(len * sizeof(char));
                    if (tempSecurityCategories == NULL) {
                        rv = SECFailure;
                        break;
                    }

                    /* Fill buffer */
                    len = 0;
                    for (i = 0; securityLabelElement->id.securityCategories[i] != NULL; i++) {
                        oid = NULL;
                        if ((rv = NSS_SMIMEUtil_DecodeOid(securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.data, securityLabelElement->id.securityCategories[i]->securityCategoryIdentifier.len, &oid)) != SECSuccess)
                            break;

                        if (oid != NULL) {
                            /* Add securityCategoryIdentifier OID */
                            PORT_Memcpy(tempSecurityCategories + len, oid, PORT_Strlen(oid));
                            len += PORT_Strlen(oid);
                            PORT_Free(oid);

                            /* Add separator */
                            tempSecurityCategories[len++] = securityCategoriesSeparator;

                            /* Add type field */
                            if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 0) {
                                switch (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0]) {
                                    case SEC_ASN1_UTF8_STRING: /* UTF-8 */
                                        tempSecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_UTF8;
                                        break;
                                    case SEC_ASN1_INTEGER: /* Integer */
                                        tempSecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_INTEGER;
                                        break;
                                    default: /* Other type */
                                        tempSecurityCategories[len++] = '0' + SECURITY_CATEGORY_VALUE_TYPE_UNKNOWN;
                                        break;
                                }
                            }

                            /* Add separator */
                            tempSecurityCategories[len++] = securityCategoriesSeparator;

                            /* Add securityCategoryValue */
                            if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.len > 2) {
                                if (securityLabelElement->id.securityCategories[i]->securityCategoryValue.data[0] == SEC_ASN1_INTEGER) { /* Integer: decode */

                                    if ((rv = SEC_ASN1DecodeItem(poolp, &tempSECItemValue, securityCategoryValueIntegerTemplate, &(securityLabelElement->id.securityCategories[i]->securityCategoryValue))) != SECSuccess)
                                        break;

                                    if ((rv = SEC_ASN1DecodeInteger(&tempSECItemValue, &tempIntValue)) != SECSuccess)
                                        break;

                                    ret = sprintf(tempSecurityCategories + len, "%d", tempIntValue);
                                    if (ret > 0) {
                                        len += ret;
                                    } else {
                                        rv = SECFailure;
                                        break;
                                    }
                                } else { /* UTF-8 and other types: direct copy */
                                    PORT_Memcpy(tempSecurityCategories + len, securityLabelElement->id.securityCategories[i]->securityCategoryValue.data + 2, securityLabelElement->id.securityCategories[i]->securityCategoryValue.len - 2);
                                    len += securityLabelElement->id.securityCategories[i]->securityCategoryValue.len - 2;
                                }
                            }

                            /* Add separator */
                            tempSecurityCategories[len++] = securityCategoriesSeparator;
                        }
                    }

                    /* Overwrite last separator with \0 */
                    tempSecurityCategories[len - 1] = '\0';

                    *aSecurityCategories = tempSecurityCategories;
                }
                break;
        }

        if (rv != SECSuccess)
            break;
    }

loser:
    /* If something failed, forget Security Label */
    if (rv != SECSuccess) {
        if (aSecurityPolicyIdentifier != NULL)
            PORT_Free(*aSecurityPolicyIdentifier);
        *aSecurityPolicyIdentifier = NULL;
    }

    PORT_ArenaUnmark (poolp, mark);
    return rv;
}

/*
 * NSS_SMIMEUtil_CreateReceiptRequest - create S/MIME ReceiptRequest attr value
 */
SECStatus
NSS_SMIMEUtil_CreateReceiptRequest(PLArenaPool *poolp, SECItem *dest, unsigned char *receiptsTo, unsigned char *uuid)
{
    NSSCMSReceiptRequest receiptRequest;
    CERTGeneralName generalName;
    SECItem *dummy = NULL;

    /* signedContentIdentifier */
    receiptRequest.signedContentIdentifier.data = uuid;
    receiptRequest.signedContentIdentifier.len = PORT_Strlen(uuid);

    /* receiptsFrom */
    SEC_ASN1EncodeInteger(poolp, &(receiptRequest.receiptsFrom), 0); /* 0 = allReceipts */

    /* receiptsTo */
    generalName.type = certRFC822Name;
    generalName.name.other.data = receiptsTo;
    generalName.name.other.len = PORT_Strlen(receiptsTo);
    receiptRequest.receiptsTo = PORT_Alloc(3 * sizeof(NSSCMSReceiptRequestGeneralNames*));
    if (receiptRequest.receiptsTo == NULL)
        goto loser;
    receiptRequest.receiptsTo[0] = PORT_Alloc(1 * sizeof(NSSCMSReceiptRequestGeneralNames));
    if (receiptRequest.receiptsTo[0] == NULL)
        goto loser;
    receiptRequest.receiptsTo[0]->generalNameSeq = PORT_Alloc(2 * sizeof(SECItem*));
    if (receiptRequest.receiptsTo[0]->generalNameSeq == NULL)
        goto loser;
    receiptRequest.receiptsTo[0]->generalNameSeq[0] = CERT_EncodeGeneralName(&generalName, NULL, poolp);
    if (receiptRequest.receiptsTo[0]->generalNameSeq[0] == NULL)
        goto loser;
    receiptRequest.receiptsTo[0]->generalNameSeq[1] = NULL;

    receiptRequest.receiptsTo[1] = NULL;

    /* Encode receipt request */
    dummy = SEC_ASN1EncodeItem(poolp, dest, &receiptRequest, NSSCMSReceiptRequestTemplate);

loser:
    if (receiptRequest.receiptsTo) {
        if (receiptRequest.receiptsTo[0]) {
            if (receiptRequest.receiptsTo[0]->generalNameSeq)
                PORT_Free(receiptRequest.receiptsTo[0]->generalNameSeq);
            PORT_Free(receiptRequest.receiptsTo[0]);
        }
        PORT_Free(receiptRequest.receiptsTo);
    }

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_GetReceiptRequest - get S/MIME ReceiptRequest values
 */
SECStatus
NSS_SMIMEUtil_GetReceiptRequest(
    NSSCMSSignerInfo *aSignerinfo,
    PRUint8 **aSignedContentIdentifier,
    PRUint32 *aSignedContentIdentifierLen,
    PRUint8 **aOriginatorSignatureValue,
    PRUint32 *aOriginatorSignatureValueLen,
    PRUint8 **aOriginatorContentType,
    PRUint32 *aOriginatorContentTypeLen,
    PRInt32 *aReceiptsFrom,
    char **aReceiptsTo)
{

    NSSCMSAttribute *attr;
    SECStatus rv = SECSuccess;

    PLArenaPool *poolp;
    void *mark;
    NSSCMSReceiptRequest receiptRequest;
    CERTGeneralName *generalName = NULL;
    unsigned int i, j, len;

    poolp = aSignerinfo->cmsg->poolp;
    mark = PORT_ArenaMark(poolp);

    attr = NSS_CMSAttributeArray_FindAttrByOidTag(aSignerinfo->authAttr, SEC_OID_SMIME_RECEIPT_REQUEST, PR_TRUE);

    if (attr == NULL || attr->values == NULL || attr->values[0] == NULL) {
        rv = SECFailure;
        goto loser;
    }

    if ((rv = SEC_ASN1DecodeItem(poolp, &receiptRequest, NSSCMSReceiptRequestTemplate, attr->values[0])) != SECSuccess)
        goto loser;

    /* signedContentIdentifier */
    len = receiptRequest.signedContentIdentifier.len;
    *aSignedContentIdentifier = PORT_Alloc(len);
    PORT_Memcpy(*aSignedContentIdentifier, receiptRequest.signedContentIdentifier.data, len);
    *aSignedContentIdentifierLen = len;

    /* receiptsFrom */
    if ((rv = SEC_ASN1DecodeInteger(&(receiptRequest.receiptsFrom), aReceiptsFrom)) != SECSuccess)
        goto loser;

    /* receiptsTo */
    if (receiptRequest.receiptsTo != NULL) {
        NSSCMSReceiptRequestGeneralNames **p = receiptRequest.receiptsTo;
        /* For each GeneralNames */
        for (i = 0; p[i] != NULL; i++) {
            if (p[i]->generalNameSeq != NULL) {
                /* For each GeneralName */
                for (j = 0; p[i]->generalNameSeq[j] != NULL; j++) {
                    generalName = CERT_DecodeGeneralName(poolp, p[i]->generalNameSeq[j], NULL);
                    if (generalName != NULL)
                        break;
                }
            }
            if (generalName != NULL)
                break;
        }
    }

    len = 0;
    if (generalName != NULL && generalName->type == certRFC822Name && generalName->name.other.len > 0)
        len = generalName->name.other.len;
    if (len > 0) {
        *aReceiptsTo = PORT_Alloc(len + 1);
        PORT_Memcpy(*aReceiptsTo, generalName->name.other.data, len);
        (*aReceiptsTo)[len] = '\0';
    } else
        rv = SECFailure;

    /* originatorSignatureValue */
    len = aSignerinfo->encDigest.len;
    *aOriginatorSignatureValue = PORT_Alloc(len);
    PORT_Memcpy(*aOriginatorSignatureValue, aSignerinfo->encDigest.data, len);
    *aOriginatorSignatureValueLen = len;

    /* originatorContentType */
    attr = NSS_CMSAttributeArray_FindAttrByOidTag(aSignerinfo->authAttr, SEC_OID_PKCS9_CONTENT_TYPE, PR_TRUE);
    if (attr == NULL || attr->values == NULL || attr->values[0] == NULL) {
        rv = SECFailure;
        goto loser;
    }
    len = attr->values[0]->len;
    *aOriginatorContentType = PORT_Alloc(len);
    PORT_Memcpy(*aOriginatorContentType, attr->values[0]->data, len);
    *aOriginatorContentTypeLen = len;

loser:

    PORT_ArenaUnmark(poolp, mark);
    return rv;
}

/*
 * NSS_SMIMEUtil_CreateReceipt - create S/MIME Receipt
 */
SECStatus
NSS_SMIMEUtil_CreateReceipt(
    PLArenaPool *poolp,
    SECItem *dest,
    const PRUint8 *signedContentIdentifier,
    const PRUint32 signedContentIdentifierLen,
    const PRUint8 *originatorSignatureValue,
    const PRUint32 originatorSignatureValueLen,
    const PRUint8 *originatorContentType,
    const PRUint32 originatorContentTypeLen)
{
    NSSCMSReceipt receipt;
    SECItem *dummy = NULL;
    SECItem *encodedReceipt = NULL;

    /* version */
    SEC_ASN1EncodeInteger(poolp, &(receipt.version), 1);

    /* contentType */
    receipt.contentType.data = originatorContentType;
    receipt.contentType.len = originatorContentTypeLen;

    /* signedContentIdentifier */
    receipt.signedContentIdentifier.data = signedContentIdentifier;
    receipt.signedContentIdentifier.len = signedContentIdentifierLen;

    /* originatorSignatureValue */
    receipt.originatorSignatureValue.data = originatorSignatureValue;
    receipt.originatorSignatureValue.len = originatorSignatureValueLen;

    /* Encode receipt */
    encodedReceipt = SEC_ASN1EncodeItem(poolp, encodedReceipt, &receipt, NSSCMSReceiptTemplate);
    if (encodedReceipt == NULL)
        goto loser;

    /* Encapsulate receipt in octet string */
    dummy = SEC_ASN1EncodeItem(poolp, dest, encodedReceipt, NSSCMSReceiptOctetStringTemplate);

loser:

    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_GetReceipt - get S/MIME Receipt values
 */
SECStatus
NSS_SMIMEUtil_GetReceipt(
    PLArenaPool *aPoolp,
    SECItem *aEncodedReceipt,
    PRUint8 **aSignedContentIdentifier,
    PRUint32 *aSignedContentIdentifierLen,
    PRUint8 **aOriginatorSignatureValue,
    PRUint32 *aOriginatorSignatureValueLen,
    PRUint8 **aOriginatorContentType,
    PRUint32 *aOriginatorContentTypeLen)
{

    SECStatus rv = SECSuccess;

    NSSCMSReceipt receipt;
    unsigned int len;
    void *mark;

    mark = PORT_ArenaMark(aPoolp);

    if ((rv = SEC_ASN1DecodeItem(aPoolp, &receipt, NSSCMSReceiptTemplate, aEncodedReceipt)) != SECSuccess)
        goto loser;

    /* contentType */
    len = receipt.contentType.len;
    *aOriginatorContentType = PORT_Alloc(len);
    PORT_Memcpy(*aOriginatorContentType, receipt.contentType.data, len);
    *aOriginatorContentTypeLen = len;

    /* signedContentIdentifier */
    len = receipt.signedContentIdentifier.len;
    *aSignedContentIdentifier = PORT_Alloc(len);
    PORT_Memcpy(*aSignedContentIdentifier, receipt.signedContentIdentifier.data, len);
    *aSignedContentIdentifierLen = len;

    /* originatorSignatureValue */
    len = receipt.originatorSignatureValue.len;
    *aOriginatorSignatureValue = PORT_Alloc(len);
    PORT_Memcpy(*aOriginatorSignatureValue, receipt.originatorSignatureValue.data, len);
    *aOriginatorSignatureValueLen = len;

loser:

    PORT_ArenaUnmark(aPoolp, mark);
    return rv;
}

/*
 * NSS_SMIMEUtil_GetCertFromEncryptionKeyPreference -
 *				find cert marked by EncryptionKeyPreference attribute
 *
 * "certdb" - handle for the cert database to look in
 * "DERekp" - DER-encoded value of S/MIME Encryption Key Preference attribute
 *
 * if certificate is supposed to be found among the message's included certificates,
 * they are assumed to have been imported already.
 */
CERTCertificate *
NSS_SMIMEUtil_GetCertFromEncryptionKeyPreference(CERTCertDBHandle *certdb, SECItem *DERekp)
{
    PLArenaPool *tmppoolp = NULL;
    CERTCertificate *cert = NULL;
    NSSSMIMEEncryptionKeyPreference ekp;

    tmppoolp = PORT_NewArena(1024);
    if (tmppoolp == NULL)
	return NULL;

    /* decode DERekp */
    if (SEC_QuickDERDecodeItem(tmppoolp, &ekp, smime_encryptionkeypref_template,
                               DERekp) != SECSuccess)
	goto loser;

    /* find cert */
    switch (ekp.selector) {
    case NSSSMIMEEncryptionKeyPref_IssuerSN:
	cert = CERT_FindCertByIssuerAndSN(certdb, ekp.id.issuerAndSN);
	break;
    case NSSSMIMEEncryptionKeyPref_RKeyID:
    case NSSSMIMEEncryptionKeyPref_SubjectKeyID:
	/* XXX not supported yet - we need to be able to look up certs by SubjectKeyID */
	break;
    default:
	PORT_Assert(0);
    }
loser:
    if (tmppoolp) PORT_FreeArena(tmppoolp, PR_FALSE);

    return cert;
}

extern const char __nss_smime_rcsid[];
extern const char __nss_smime_sccsid[];

PRBool
NSSSMIME_VersionCheck(const char *importedVersion)
{
    /*
     * This is the secret handshake algorithm.
     *
     * This release has a simple version compatibility
     * check algorithm.  This release is not backward
     * compatible with previous major releases.  It is
     * not compatible with future major, minor, or
     * patch releases.
     */
    volatile char c; /* force a reference that won't get optimized away */

    c = __nss_smime_rcsid[0] + __nss_smime_sccsid[0]; 

    return NSS_VersionCheck(importedVersion);
}

/*
 *
 *
 * NSS_SMIMEUtil_CreateSecureHeaders - create S/MIME Secure Headers attr value
 *
*/
SECStatus
NSS_SMIMEUtil_CreateSecureHeader(PLArenaPool *poolp, SECItem *dest, SecHeaderField * arrayHeaderField, const unsigned int nbHeaders, PRInt32 canonAlgo)
{
	NSSCMSSecureHeaderElement** secureHeader = NULL;
	SECItem * dummy = NULL;
	int	secureHeaderItem = 0;
	int i=0;
	int len=0;


	/* Alloc 2 elements max + 1 NULL at the end = 3 elements */
	secureHeader = (NSSCMSSecureHeaderElement**) PORT_Alloc(3 * sizeof(NSSCMSSecureHeaderElement*));
	for (i = 0; i < 3; ++i) secureHeader[i] = NULL;

	secureHeaderItem = 0;

	/* CanonAlgorithm */
	secureHeader[secureHeaderItem] = (NSSCMSSecureHeaderElement *) PORT_Alloc(sizeof(NSSCMSSecureHeaderElement));
	secureHeader[secureHeaderItem]->selector=NSSCMSSecureHeaderElement_canonAlgorithm;


	secureHeader[secureHeaderItem]->id.canonAlgorithm.data = (unsigned char*) PORT_Alloc(4 * sizeof(unsigned char));
	if (secureHeader[secureHeaderItem]->id.canonAlgorithm.data == NULL) goto loser;
	secureHeader[secureHeaderItem]->id.canonAlgorithm.data[0] = 0;
	secureHeader[secureHeaderItem]->id.canonAlgorithm.data[1] = 0;
	secureHeader[secureHeaderItem]->id.canonAlgorithm.data[2] = (unsigned char) (canonAlgo>>8 & 0xFF);
	secureHeader[secureHeaderItem]->id.canonAlgorithm.data[3] = (unsigned char) (canonAlgo & 0xFF);
	secureHeader[secureHeaderItem]->id.canonAlgorithm.len = 4;


	/* Secure Header Field Element */
	secureHeaderItem++;
	secureHeader[secureHeaderItem] = (NSSCMSSecureHeaderElement *) PORT_Alloc(sizeof(NSSCMSSecureHeaderElement));
	secureHeader[secureHeaderItem]->selector=NSSCMSSecureHeaderElement_secHeaderField;
	/* Alloc table which will contain the encode result of each header element */
	secureHeader[secureHeaderItem]->id.secHeaderFields = ( NSSCMSSecHeaderFieldElement** ) PORT_Alloc((nbHeaders + 1) * sizeof( NSSCMSSecHeaderFieldElement * ));

	/* init to NULL each header element */
	for(i=0;i<nbHeaders;++i)
	{
		secureHeader[secureHeaderItem]->id.secHeaderFields[i] = NULL;
	}

	/* the last must be null */
	secureHeader[secureHeaderItem]->id.secHeaderFields[nbHeaders] = NULL;

	for(i=0;i<nbHeaders;++i)
	{
		secureHeader[secureHeaderItem]->id.secHeaderFields[i] = (NSSCMSSecHeaderFieldElement *) PORT_Alloc(sizeof(NSSCMSSecHeaderFieldElement));

		if(secureHeader[secureHeaderItem]->id.secHeaderFields[i] == NULL) goto loser;

		/* init all *.data to null */
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data = NULL;
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data = NULL;
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data = NULL;
		/* secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data = NULL; */
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.len = 0;
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.len = 0;
		secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.len = 0;
		/* secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.len = 0; */

		/* headername */
		if(arrayHeaderField[i].headerName!=NULL)
		{
			len=PORT_Strlen((const char *)(arrayHeaderField[i].headerName));
			if(len>0){
				secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.len=len;
				secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data = (char *)PORT_Alloc(len * sizeof(char));
				if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data == NULL) goto loser;
				PORT_Memcpy(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data,arrayHeaderField[i].headerName,len);
			}
		}
		/* headervalue */
		if(arrayHeaderField[i].headerValue!=NULL)
		{
			len=PORT_Strlen((const char *)arrayHeaderField[i].headerValue);
			if(len>0){
				secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.len=len;
				secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data = (char *)PORT_Alloc(len * sizeof(char));
				if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data == NULL) goto loser;
				PORT_Memcpy(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data,arrayHeaderField[i].headerValue,len);
			}
		}
		/* headerstatus */
		if(arrayHeaderField[i].headerStatus!=-1)
		{
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data = (unsigned char*) PORT_Alloc(4 * sizeof(unsigned char));
			if (secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data == NULL) goto loser;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data[0] = 0;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data[1] = 0;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data[2] = (unsigned char) (arrayHeaderField[i].headerStatus>>8 & 0xFF);
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data[3] = (unsigned char) (arrayHeaderField[i].headerStatus & 0xFF);
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.len = 4;
		}

		/* headerEncrypted */
		/*if(arrayHeaderField[i].headerEncrypted!=-1)
		{
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data = (unsigned char*) PORT_Alloc(4 * sizeof(unsigned char));
			if (secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data == NULL) goto loser;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data[0] = 0;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data[1] = 0;
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data[2] = (unsigned char) (arrayHeaderField[i].headerEncrypted>>8 & 0xFF);
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data[3] = (unsigned char) (arrayHeaderField[i].headerEncrypted & 0xFF);
			secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.len = 4;
		}*/

	}

	/* Now encode */
	dummy = SEC_ASN1EncodeItem(poolp, dest, &secureHeader, NSSCMSSecureHeaderTemplate);

loser:
	/* Free memory */
	for(secureHeaderItem=0;secureHeader[secureHeaderItem]!=NULL;++secureHeaderItem)
	{

		switch (secureHeader[secureHeaderItem]->selector)
		{
			case NSSCMSSecureHeaderElement_canonAlgorithm:
				if(secureHeader[secureHeaderItem]->id.canonAlgorithm.data!=NULL)
				{
					PORT_Free((unsigned char *)secureHeader[secureHeaderItem]->id.canonAlgorithm.data);
				}
			break;
			case NSSCMSSecureHeaderElement_secHeaderField:
				for(i=0;secureHeader[secureHeaderItem]->id.secHeaderFields[i]!=NULL;++i)
				{
					if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data != NULL){
						PORT_Free((char *)(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data));
						secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldName.data=NULL;
					}

					if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data!=NULL){
						PORT_Free((char*) (secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data));
						secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldValue.data=NULL;
					}

					if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data!=NULL){
						PORT_Free((unsigned char*) (secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data));
						secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldStatus.data=NULL;
					}

					/*if(secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data!=NULL){
						PORT_Free((unsigned char*) (secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data));
						secureHeader[secureHeaderItem]->id.secHeaderFields[i]->HeaderFieldEncrypted.data=NULL;
					}*/

					PORT_Free((NSSCMSSecHeaderFieldElement *) (secureHeader[secureHeaderItem]->id.secHeaderFields[i]) );
					secureHeader[secureHeaderItem]->id.secHeaderFields[i] = NULL;
				}

				if(secureHeader[secureHeaderItem]->id.secHeaderFields!=NULL){
					PORT_Free(( NSSCMSSecHeaderFieldElement** )(secureHeader[secureHeaderItem]->id.secHeaderFields));
					secureHeader[secureHeaderItem]->id.secHeaderFields = NULL;
				}
			break;


		}

		if(secureHeader[secureHeaderItem]!=NULL){
			PORT_Free((NSSCMSSecureHeaderElement *) secureHeader[secureHeaderItem]);
			secureHeader[secureHeaderItem] = NULL;
		}

	}

	if(secureHeader!=NULL)
	{
		PORT_Free((NSSCMSSecureHeaderElement **) secureHeader);
		secureHeader = NULL;
	}

	return (dummy == NULL) ? SECFailure : SECSuccess;

}

SECStatus
NSS_SMIMEUtil_GetSecureHeader(NSSCMSSignerInfo *signerinfo, NSSCMSSecureHeader * secuHeaders)
{
	NSSCMSAttribute *attr;
    SECStatus rv;

    PLArenaPool *poolp;
    void *mark;

    poolp = signerinfo->cmsg->poolp;
    mark = PORT_ArenaMark(poolp);

    attr = NSS_CMSAttributeArray_FindAttrByOidTag(signerinfo->authAttr, SEC_OID_SMIME_SECURE_HEADERS, PR_TRUE);
    if (attr != NULL && attr->values != NULL && attr->values[0] != NULL)
    {
      rv = SEC_ASN1DecodeItem(poolp, secuHeaders, NSSCMSSecureHeaderTemplate, attr->values[0]);
    } else {
      rv = SECFailure;
    }

    PORT_ArenaUnmark (poolp, mark);
    return rv;

}
