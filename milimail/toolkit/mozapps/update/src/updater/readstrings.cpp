/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et cindent: */
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
 * The Initial Developer of the Original Code is Google Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Darin Fisher <darin@meer.net>
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

#include <limits.h>
#include <string.h>
#include <stdio.h>
#include "readstrings.h"
#include "errors.h"

// stack based FILE wrapper to ensure that fclose is called.
class AutoFILE {
public:
  AutoFILE(FILE *fp) : fp_(fp) {}
  ~AutoFILE() { if (fp_) fclose(fp_); }
  operator FILE *() { return fp_; }
private:
  FILE *fp_;
};

// very basic parser for updater.ini
int
ReadStrings(const char *path, StringTable *results)
{
  AutoFILE fp = fopen(path, "r");
  if (!fp)
    return READ_ERROR;

  // Trim leading junk -- this is a hack!
  if (!fgets(results->title, MAX_TEXT_LEN, fp))
    return READ_ERROR;
  if (!fgets(results->title, MAX_TEXT_LEN, fp))
    return READ_ERROR;

  // Now, read the values we care about.
  if (!fgets(results->title, MAX_TEXT_LEN, fp))
    return READ_ERROR;
  if (!fgets(results->info, MAX_TEXT_LEN, fp))
    return READ_ERROR;

  // Trim trailing newline character and leading 'key='
  char *strings[] = {
    results->title, results->info, NULL
  };
  for (char **p = strings; *p; ++p) {
    int len = strlen(*p);
    if (len)
      (*p)[len - 1] = '\0';

    char *eq = strchr(*p, '=');
    if (!eq)
      return PARSE_ERROR;
    memmove(*p, eq + 1, len - (eq - *p + 1));
  }

  return OK;
}