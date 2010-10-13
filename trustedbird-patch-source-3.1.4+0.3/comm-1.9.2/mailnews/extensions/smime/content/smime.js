/* 
   Add any default pref values we want for smime
*/

pref("mail.identity.default.encryption_cert_name","");
pref("mail.identity.default.encryptionpolicy",  0);
pref("mail.identity.default.signing_cert_name", "");
pref("mail.identity.default.sign_mail", false);
pref("mail.identity.default.smime_receipt_request", false);
pref("mail.identity.default.smime_receipt_send_policy", 0); /* 0: ask  1: never  2: always */
