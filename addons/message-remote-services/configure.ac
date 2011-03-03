#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

#! /bin/sh
#
# The contents of this file are subject to the Netscape Public
# License Version 1.1 (the "License"); you may not use this file
# except in compliance with the License. You may obtain a copy of
# the License at http://www.mozilla.org/NPL/
#
# Software distributed under the License is distributed on an "AS
# IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
# implied. See the License for the specific language governing
# rights and limitations under the License.
#
# The Original Code is BT Global Services / Etat francais Ministere de la Defense
#
# The Initial Developer of the Original Code is Netscape
# Communications Corporation.  Portions created by Netscape are
# Copyright (C) 1999 Netscape Communications Corporation. All
# Rights Reserved.

AC_PREREQ(2.61)
AC_INIT([MilimailMRS], [0.2], olivier.parniere@gmail.com)
AM_INIT_AUTOMAKE([-Wall -Werror foreign])
AC_CONFIG_HEADER([config.h])

# Checks for programs.
AC_PROG_CXX
AC_PROG_LIBTOOL

AC_ARG_WITH(mozilla-sdk,
    [  --with-mozilla-sdk=DIR		include mozilla thunderbird sdk in DIR],
    mozilla_sdk=$withval,
    [  AC_MSG_ERROR([--with-mozilla-sdk=DIR is mandatory])])
AC_SUBST(mozilla_sdk)

AC_MSG_CHECKING(whether to enable dsn)
dsn_default="no"
AC_ARG_ENABLE(dsn, [  --enable-dsn		turn on dsn
                       [default=$dsn_default]],
                       [ case "$enableval" in yes|no) : ;; *) AC_MSG_ERROR(bad value for --enable-dsn must be yes or no or empty which means yes)                ;; esac ],
                       enable_dsn=$dsn_default)

if test "x$enable_dsn" = "xyes"; then
         CXXFLAGS="$CXXFLAGS -DDSN"
AC_MSG_RESULT(yes)
else
AC_MSG_RESULT(no)
fi

AC_MSG_CHECKING(whether to disable logging)
log_default="no"
AC_ARG_ENABLE(log, [  --disable-log		turn off log
                       [default=$log_default]],
                       [ case "$enableval" in yes|no) : ;; *) AC_MSG_ERROR(bad value for --enable-log must be yes or no or empty which means yes)                ;; esac ],
                       disable_log=$log_default)

if test "x$disable_log" = "xno"; then
         CXXFLAGS="$CXXFLAGS -DMRS_LOG"
AC_MSG_RESULT(no)
else
AC_MSG_RESULT(yes)
fi

AC_CONFIG_FILES([Makefile src/Makefile src/corba/Makefile src/xpcom/Makefile])
AC_OUTPUT
