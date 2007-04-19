/*
 * Simple test driver for MPI library
 *
 * Test 2: Basic addition and subtraction test
 *
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
 * The Original Code is the MPI Arbitrary Precision Integer Arithmetic library.
 *
 * The Initial Developer of the Original Code is
 * Michael J. Fromberger.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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
/* $Id: mptest-2.c,v 1.3 2004/04/27 23:04:37 gerv%gerv.net Exp $ */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>

#include "mpi.h"

int main(int argc, char *argv[])
{
  mp_int a, b, c;

  if(argc < 3) {
    fprintf(stderr, "Usage: %s <a> <b>\n", argv[0]);
    return 1;
  }

  printf("Test 2: Basic addition and subtraction\n\n");

  mp_init(&a);
  mp_init(&b);

  mp_read_radix(&a, argv[1], 10);
  mp_read_radix(&b, argv[2], 10);
  printf("a = "); mp_print(&a, stdout); fputc('\n', stdout);
  printf("b = "); mp_print(&b, stdout); fputc('\n', stdout);
  
  mp_init(&c);
  printf("c = a + b\n");

  mp_add(&a, &b, &c);
  printf("c = "); mp_print(&c, stdout); fputc('\n', stdout);
  
  printf("c = a - b\n");
  
  mp_sub(&a, &b, &c);
  printf("c = "); mp_print(&c, stdout); fputc('\n', stdout);  

  mp_clear(&c);
  mp_clear(&b);
  mp_clear(&a);

  return 0;
}
