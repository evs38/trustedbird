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
 *   Eric Ballet Baz BT Global Services / Etat francais Ministere de la Defense
 *   Olivier Brun BT Global Services / Etat francais Ministere de la Defense
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
 * $Id: smimeutil.c,v 1.16.28.5 2007/05/07 22:46:06 nelson%bolyard.com Exp $
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
static const SEC_ASN1Template NSSCMSReceiptRequestTemplate[] = {
    { SEC_ASN1_SEQUENCE, 0, NULL, sizeof(NSSCMSReceiptRequest) },
    { SEC_ASN1_OCTET_STRING, offsetof(NSSCMSReceiptRequest, signedContentIdentifier) },
    { SEC_ASN1_INTEGER, offsetof(NSSCMSReceiptRequest, receiptsFrom) },
    { SEC_ASN1_IA5_STRING, offsetof(NSSCMSReceiptRequest, receiptsTo)}, /* TODO : Handle SEQUENCE OF GeneralName */
    { 0 }
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
 * @return SECFailure if encoding failed
 */
SECStatus NSS_SMIMEUtil_CreateSecurityLabelEncodeOid(const char* data, const unsigned int len, unsigned char** output, unsigned int* outputLen)
{
	unsigned int i;
	unsigned int k;
	unsigned int dotCount;
	unsigned int* oid;
	unsigned int n;
	unsigned int itemCount;
	unsigned char tempDER[5];
	    
	/* Count number of dot in the string */
	dotCount = 0;
	for (i = 0; i < len; i++) {
		if (data[i] == '.') dotCount++;
	}
	if (dotCount == 0) return SECFailure;
	
	/* Allocate OID array of integers */
	oid = (unsigned int*) PORT_Alloc((dotCount + 1) * sizeof(unsigned int));
	if (oid == NULL) return SECFailure;
	
	/* Convert decimal, dot-separated OID string to an array of integers */
	n = 0;
	itemCount = 0;
	for (i = 0; i <= len; i++) { /* Analyze all characters + 1 loop at the end */
		if (i == len || data[i] == '.') {
			/* Store number */
			if (n != 0) {
				oid[itemCount++] = n;
				n = 0;
			} else {
				PORT_Free(oid);
				return SECFailure;
			}
		} else if (data[i] >= '0' && data[i] <= '9') {
			/* Add digit to number */
			n *= 10;
			n += data[i] - '0';
		} else {
			/* Unknown character */
			PORT_Free(oid);
			return SECFailure;
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
		return SECFailure;
	}
	
	/* Allocate DER-encoded buffer: 5 bytes by item maximum */
    *outputLen = 0;
    *output = (unsigned char*) PORT_Alloc((itemCount * 5) * sizeof(unsigned char));
    if (*output == NULL) {
    	PORT_Free(oid);
    	return SECFailure;
    }
    
	/* DER encode the array of integers */
    /* First byte contains first and second items */
	(*output)[(*outputLen)++] = oid[0] * 40 + oid[1];
	/* Next bytes */
	for (i = 2; i < itemCount; i++) {
		n = 0;
		while (oid[i] > 0) {
			if (n == 5) {/* 5 bytes by item maximum */
				PORT_Free(oid);
				return SECFailure;
			}
			tempDER[n] = oid[i] & 0x7F;
			if (n != 0) tempDER[n] |= 0x80;
			oid[i] >>= 7;
			n++;
		}
		for (k = 0; k < n; k++) {
			(*output)[(*outputLen)++] = tempDER[n - 1 - k];
		}
	}

	PORT_Free(oid);
	
	return SECSuccess;
}

/*
 * NSS_SMIMEUtil_CreateSecurityLabel - create S/MIME SecurityLabel attr value
 */
SECStatus
NSS_SMIMEUtil_CreateSecurityLabel(PLArenaPool *poolp, SECItem *dest, const char* securityPolicyIdentifier, PRInt32 securityClassification, const char* privacyMark, const char* securityCategories)
{
	NSSCMSSecurityLabelElement** securityLabel;
	SECItem* dummy = NULL;
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
	unsigned char* tempSecurityCategoryValueString;
	unsigned int tempSecurityCategoryValueInteger;
	
	
	/* 4 elements max + 1 NULL at the end = 5 elements */
	securityLabel = (NSSCMSSecurityLabelElement**) PORT_Alloc(5 * sizeof(NSSCMSSecurityLabelElement*));
	for (i = 0; i < 5; i++) securityLabel[i] = NULL;
	
	securityLabelItem = 0;
	
	/*
	 * securityPolicyIdentifier
	 */
	securityLabel[securityLabelItem] = (NSSCMSSecurityLabelElement*) PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
	securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityPolicyIdentifier;
	if (NSS_SMIMEUtil_CreateSecurityLabelEncodeOid(securityPolicyIdentifier, PORT_Strlen(securityPolicyIdentifier), &(securityLabel[securityLabelItem]->id.securityPolicyIdentifier.data), &(securityLabel[securityLabelItem]->id.securityPolicyIdentifier.len)) == SECFailure) goto loser;
	securityLabelItem++;
	
	
	/*
	 * securityClassification
	 */
	if (securityClassification != -1) {
		securityLabel[securityLabelItem] = (NSSCMSSecurityLabelElement*) PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
		securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityClassification;
		
		securityLabel[securityLabelItem]->id.securityClassification.data = (unsigned char*) PORT_Alloc(4 * sizeof(unsigned char));
		if (securityLabel[securityLabelItem]->id.securityClassification.data == NULL) goto loser;
		securityLabel[securityLabelItem]->id.securityClassification.data[0] = 0;
		securityLabel[securityLabelItem]->id.securityClassification.data[1] = 0;
		securityLabel[securityLabelItem]->id.securityClassification.data[2] = (unsigned char) (securityClassification>>8 & 0xFF);
		securityLabel[securityLabelItem]->id.securityClassification.data[3] = (unsigned char) (securityClassification & 0xFF);
		securityLabel[securityLabelItem]->id.securityClassification.len = 4;
		securityLabelItem++;
	}
	
	
	/*
	 * privacyMark
	 */
	len = PORT_Strlen(privacyMark);
	if (len > 0) {
		securityLabel[securityLabelItem] = (NSSCMSSecurityLabelElement*) PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
		securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_privacyMarkUTF8;
		
		securityLabel[securityLabelItem]->id.privacyMarkUTF8.data = (unsigned char*) PORT_Alloc(len * sizeof(unsigned char));
		if (securityLabel[securityLabelItem]->id.privacyMarkUTF8.data == NULL) goto loser;
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
		for (i = 0; i < len; i++) {
			if (securityCategories[i] == securityCategoriesSeparator) separatorCount++;
		}
		
		/* Separator count must be correct */
		if (separatorCount < 2 || (((separatorCount - 2 ) % 3) != 0)) goto loser;
		categoryCount = ((separatorCount - 2 ) / 3) + 1;
		
		/* Create object */
		securityLabel[securityLabelItem] = (NSSCMSSecurityLabelElement*) PORT_Alloc(sizeof(NSSCMSSecurityLabelElement));
		securityLabel[securityLabelItem]->selector = NSSCMSSecurityLabelElement_securityCategories;
		
		/* Allocate categoryCount + 1 NULL securityCategories */
		securityLabel[securityLabelItem]->id.securityCategories = (NSSCMSSecurityLabelSecurityCategory**) PORT_Alloc((categoryCount + 1) * sizeof(NSSCMSSecurityLabelSecurityCategory*));
		if (securityLabel[securityLabelItem]->id.securityCategories == NULL) goto loser;
		for (i = 0; i < categoryCount; i++) {
			securityLabel[securityLabelItem]->id.securityCategories[i] = (NSSCMSSecurityLabelSecurityCategory*) PORT_Alloc(sizeof(NSSCMSSecurityLabelSecurityCategory));
			if (securityLabel[securityLabelItem]->id.securityCategories[i] == NULL) goto loser;
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
				if (NSS_SMIMEUtil_CreateSecurityLabelEncodeOid(securityCategories + startPosition, fieldLen, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryIdentifier.data), &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryIdentifier.len)) == SECFailure) goto loser;
				startPosition += fieldLen + 1;
			} else {
				goto loser;
			}
			
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
				if (securityCategories[startPosition] >= '0' && securityCategories[startPosition] <= '9') {
					tempSecurityCategoryValueType = securityCategories[startPosition] - '0';
				}
				
				startPosition += fieldLen + 1;
			} else {
				goto loser;
			}
			
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
						dummy = SEC_ASN1EncodeItem(poolp, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryValue), &tempSecurityCategoryValue, SEC_UTF8StringTemplate);
						if (dummy == NULL) goto loser;
						break;
					case SECURITY_CATEGORY_VALUE_TYPE_INTEGER:
						tempSecurityCategoryValueString = (unsigned char*) PORT_Alloc((fieldLen + 1) * sizeof(unsigned char));
						PORT_Memcpy(tempSecurityCategoryValueString, securityCategories + startPosition, fieldLen);
						tempSecurityCategoryValueString[fieldLen] = '\0';
						tempSecurityCategoryValueInteger = atoi(tempSecurityCategoryValueString);
						PORT_Free(tempSecurityCategoryValueString);
						
						tempSecurityCategoryValue.data = (unsigned char*) PORT_Alloc(4 * sizeof(unsigned char));
						tempSecurityCategoryValue.data[0] = (unsigned char) (tempSecurityCategoryValueInteger>>24 & 0xFF);;
						tempSecurityCategoryValue.data[1] = (unsigned char) (tempSecurityCategoryValueInteger>>16 & 0xFF);;
						tempSecurityCategoryValue.data[2] = (unsigned char) (tempSecurityCategoryValueInteger>>8 & 0xFF);
						tempSecurityCategoryValue.data[3] = (unsigned char) (tempSecurityCategoryValueInteger & 0xFF);
						tempSecurityCategoryValue.len = 4;
						dummy = SEC_ASN1EncodeItem(poolp, &(securityLabel[securityLabelItem]->id.securityCategories[i]->securityCategoryValue), &tempSecurityCategoryValue, SEC_IntegerTemplate);
						PORT_Free(tempSecurityCategoryValue.data);
						if (dummy == NULL) goto loser;
						break;
					default:
						goto loser;
						break;
				}
					
					
				startPosition += fieldLen + 1;
			} else {
				goto loser;
			}
	
		}
		securityLabelItem++;
	}
	
	
	/* Now encode */
	dummy = SEC_ASN1EncodeItem(poolp, dest, &securityLabel, NSSCMSSecurityLabelTemplate);

loser:
    for (i = 0; securityLabel[i] != NULL; i++) {
		switch (securityLabel[i]->selector) {
			case NSSCMSSecurityLabelElement_securityPolicyIdentifier:
				if (securityLabel[i]->id.securityPolicyIdentifier.len > 0) PORT_Free(securityLabel[i]->id.securityPolicyIdentifier.data);
				break;
			case NSSCMSSecurityLabelElement_securityClassification:
				if (securityLabel[i]->id.securityClassification.len > 0) PORT_Free(securityLabel[i]->id.securityClassification.data);
				break;
			case NSSCMSSecurityLabelElement_privacyMarkPrintableString:
				if (securityLabel[i]->id.privacyMarkPrintableString.len > 0) PORT_Free(securityLabel[i]->id.privacyMarkPrintableString.data);
				break;
			case NSSCMSSecurityLabelElement_privacyMarkUTF8:
				if (securityLabel[i]->id.privacyMarkUTF8.len > 0) PORT_Free(securityLabel[i]->id.privacyMarkUTF8.data);
				break;
			case NSSCMSSecurityLabelElement_securityCategories:
				if (securityLabel[i]->id.securityCategories != NULL) {
					for (k = 0; securityLabel[i]->id.securityCategories[k] != NULL; k++) {
						if (securityLabel[i]->id.securityCategories[k]->securityCategoryIdentifier.len > 0) PORT_Free(securityLabel[i]->id.securityCategories[k]->securityCategoryIdentifier.data);
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
NSS_SMIMEUtil_GetSecurityLabel(NSSCMSSignerInfo *signerinfo, NSSCMSSecurityLabel *securityLabel)
{
    NSSCMSAttribute *attr;
    SECStatus rv;

    PLArenaPool *poolp;
    void *mark;

    poolp = signerinfo->cmsg->poolp;
    mark = PORT_ArenaMark(poolp);

    attr = NSS_CMSAttributeArray_FindAttrByOidTag(signerinfo->authAttr, SEC_OID_SMIME_SECURITY_LABEL, PR_TRUE);
    if (attr != NULL && attr->values != NULL && attr->values[0] != NULL)
    {
      rv = SEC_ASN1DecodeItem(poolp, securityLabel, NSSCMSSecurityLabelTemplate, attr->values[0]);
    } else {
      rv = SECFailure;
    }

    PORT_ArenaUnmark (poolp, mark);
    return rv;
}

/*
 * NSS_SMIMEUtil_CreateReceiptRequest - create S/MIME ReceiptRequest attr value
 */
SECStatus
NSS_SMIMEUtil_CreateReceiptRequest(PLArenaPool *poolp, SECItem *dest, unsigned char* receiptsTo, unsigned char* uuid)
{
    NSSCMSReceiptRequest receiptRequest;
    SECItem *dummy;

    /* signedContentIdentifier */
    receiptRequest.signedContentIdentifier.data = uuid;
    receiptRequest.signedContentIdentifier.len = PORT_Strlen(uuid);

    /* receiptsFrom */
    receiptRequest.receiptsFrom.data = (char *) PORT_Alloc(1 * sizeof(char));
    receiptRequest.receiptsFrom.data[0] = 0; /* TODO : handle other cases */
    receiptRequest.receiptsFrom.len = 1;

    /* receiptsTo */
    receiptRequest.receiptsTo.data = (unsigned char*) receiptsTo;
    receiptRequest.receiptsTo.len = PORT_Strlen(receiptsTo);

    /* Now encode */
    dummy = SEC_ASN1EncodeItem(poolp, dest, &receiptRequest, NSSCMSReceiptRequestTemplate);

    PORT_Free(receiptRequest.receiptsFrom.data);
    
    return (dummy == NULL) ? SECFailure : SECSuccess;
}

/*
 * NSS_SMIMEUtil_GetReceiptRequest - get S/MIME ReceiptRequest attr value
 */
SECStatus
NSS_SMIMEUtil_GetReceiptRequest(NSSCMSSignerInfo *signerinfo, NSSCMSReceiptRequest *receiptRequest) {

    NSSCMSAttribute *attr;
    SECStatus rv;

    PLArenaPool *poolp;
    void *mark;

    poolp = signerinfo->cmsg->poolp;
    mark = PORT_ArenaMark(poolp);

    attr = NSS_CMSAttributeArray_FindAttrByOidTag(signerinfo->authAttr, SEC_OID_SMIME_RECEIPT_REQUEST, PR_TRUE);
    if (attr != NULL && attr->values != NULL && attr->values[0] != NULL)
    {
      rv = SEC_ASN1DecodeItem(poolp, receiptRequest, NSSCMSReceiptRequestTemplate, attr->values[0]);

    } else {
      rv = SECFailure;
    }

    PORT_ArenaUnmark (poolp, mark);
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
