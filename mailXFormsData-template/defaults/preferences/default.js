/* Form URL in current package (mandatory)
    Replace "myFormName" with the unique name of the form (a-z, A-Z, 0-9, without spaces)
    Replace "1" with the version of the form ("1", "2.3", ...)
    Replace "myForm.xul" with the file name of the form */
//pref("extensions.mailXFormsEngine.forms.myFormName.1.url", "chrome://mailXFormsData-MXD_PACKAGE_NAME/content/myForm.xul");

/* Form display name (default to the unique name of the form) */
//pref("extensions.mailXFormsEngine.forms.myFormName.1.title", "myFormName");

/* Should the form be available when composing a message (defaults to true) */
//pref("extensions.mailXFormsEngine.forms.myFormName.1.composeEnabled", true);
