#!/usr/bin/perl 
#
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is mozilla.org code.
#
# The Initial Developer of the Original Code is
# Netscape Communications Corporation.
# Portions created by the Initial Developer are Copyright (C) 1999
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Jungshik Shin <jshin@i18nl10n.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

######################################################################
#
# Initial global variable
#
######################################################################

%gcount = ();
%pat = ();

%map = (
  "M" => "1",
  "N" => "2",
  "Z" => "3",
  "C" => "4",
  "L" => "5",
  "P" => "6",
  "S" => "7"
);

%special = ();

######################################################################
#
# Open the unicode database file
#
######################################################################
open ( UNICODATA , "< UnicodeData-Latest.txt") 
   || die "cannot find UnicodeData-Latest.txt";

######################################################################
#
# Open the output file
#
######################################################################
open ( OUT , "> ../src/cattable.h") 
  || die "cannot open output ../src/cattable.h file";

######################################################################
#
# Generate license and header
#
######################################################################
$mpl = <<END_OF_MPL;
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
 * Portions created by the Initial Developer are Copyright (C) 1999
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
/* 
    DO NOT EDIT THIS DOCUMENT !!! THIS DOCUMENT IS GENERATED BY
    mozilla/intl/unicharutil/tools/gencattable.pl
 */
END_OF_MPL

print OUT $mpl;

print OUT "#include \"nscore.h\" \n\n";


%category = ();
%sh = ();
%sl = ();
%sc = ();

$prevcjkcomp = 0;
$cjkcompidx = 0;

######################################################################
#
# Process the file line by line
#
######################################################################
while(<UNICODATA>) {
   chop;
   ######################################################################
   #
   # Get value from fields
   #
   ######################################################################
   @f = split(/;/ , $_); 
   $c = $f[0];   # The unicode value
   $n = $f[1];   # The unicode name
   $g = $f[2];   # The General Category 

   $cat = substr($g, 0, 1);
   # All CJK Compatibility ideographs belong to Lo
   if ($n =~ /^CJK COMPATIBILITY IDEOGRAPH/) 
   {
     $catnum = $map{$cat};
     if ($cat ne "L") {
       print "WARNING !!!! " . "
             error in handling CJK Compatibility Ideograph block\n\n";
     }
     if (hex($prevcjkcomp) + 1 != hex($c))
     {
       if (hex($prevcjkcomp) != 0)
       {
         $sh{$cjkcompkey} = $prevcjkcomp;
       }
       $cjkcompkey = sprintf("CJK Compatibility #%d", ++$cjkcompidx);
       $sl{$cjkcompkey} = $c;
       $sc{$cjkcompkey} = $catnum;
       push @special, $cjkcompkey; 
     }
     $prevcjkcomp = $c;
   }
   elsif(( substr($n, 0, 1) ne "<")  || ($n eq "<control>"))
   {
      #
      # print $g;
      # 
     
      $gcount{$g}++;
      $gcount{$cat}++;
      $category{$c} = $cat;
      # print $g . " = " . $gcount{$g} . "\n";
   } else {

      # Handle special block
      @pair=split(/, /,  $n );
      $catnum = $map{$cat};
      $pair[0] =~ s/^<//; 

      # printf "[%s][%s] => %d\n", $pair[0], $pair[1], $catnum;
      if( $pair[1] eq "First>") {
         $sl{$pair[0]} = $c;
         $sc{$pair[0]} = $catnum;
         push @special, $pair[0];
      } elsif ( $pair[1] eq "Last>") {
         $sh{$pair[0]} = $c;
         if($sc{$pair[0]} ne $catnum)
         {
            print "WARNING !!!! error in handling special block\n\n";
         }
      } else {
         print "WARNING !!!! error in handling special block\n\n";
      }
   }
}

# take care of the last CJK Compatibility block 
$sh{$cjkcompkey} = $prevcjkcomp;

# @cats = keys(%gcount);
# foreach $cat ( sort(@cats) ) {
#    $count = $gcount{$cat};
#    print "$cat ==> $count\n";
# }


# We treat characters < U+1D00 as "plane 0" and all the rest of planes 0 and 1
# as "plane 1". This gives a relatively even distribution of patterns between
# planes. If you change the value of $planeSplit, make sure that none of the
# ranges below straddles the new value!
$planeSplit = 0x1d00;

@range = (
  0x0000, 0x07ff, 
  0x0900, 0x1b7f,
  0x1d00, 0x33ff,
  0x4dc0, 0x4dff,
  0xa000, 0xa87f,
  0xfb00, 0xffff,
  0x10000, 0x104af,
  0x10800, 0x1083f,
  0x10900, 0x1091f,
  0x10a00, 0x10a5f,
  0x12000, 0x1247f,
  0x1d000, 0x1d7ff
);


$totaldata = 0;

$tt=($#range+1) / 2;
@newidx = (0); 
@patarray = ();
$oldplane = -1; 
@planes = ();

for($t = 1; $t <= $tt; $t++)
{
   $tl = $range[($t-1) * 2];
   $th = $range[($t-1) * 2 + 1];
   $ts = ( $th - $tl ) >> 3;
   $totaldata += $ts + 1;
   if ($planeSplit > $tl && $planeSplit < $th) {
     printf STDERR "plane split %04X falls within range %04X - %04X\n",
                   $planeSplit, $tl, $th;
     die "This program is now broken!!!\n\n\n";
   }
   if ($tl < $planeSplit) {
     $plane = 0;
   } else {
     $plane = 1;
   }
   if ($oldplane != $plane) {
     if ($oldplane != -1) {
       printf STDERR  "Plane %d has %d patterns\n", $oldplane, $newidx[$oldplane]; 
       if ($newidx[$oldplane] > 256) {
         printf STDERR  "We have more than 256 patterns for plane %d\n", $oldplane; 
         die "This program is now broken!!!\n\n\n";      
       }
     }
     $newidx[$plane] = 0;
     push @planes, $plane; 
   }
   $oldplane = $plane; 

   printf OUT "static const PRUint8 gGenCatIdx%d[%d] = {\n", $t, $ts + 1;
   for($i = ($tl >> 3); $i <= ($th >> 3) ; $i ++ )
   {
      $data = 0;
      for($j = 0; $j < 8 ; $j++)
      {
         $k =  sprintf("%04X", (($i << 3) + $j));
      
         $cat =  $category{$k};
         if( $cat ne "")
         {
             $data = $data +  ($map{$cat} << (4*$j));
         }
      }
      $pattern = sprintf("0x%08X", $data);

   
      $idx = $pat[$plane]{$pattern};
      unless( exists($pat[$plane]{$pattern})){
         $idx = $newidx[$plane]++;
         $patarray[$plane][$idx] = $pattern;
         $pat[$plane]{$pattern} = $idx;
      }

      printf OUT "    %3d,  // U+%06X - U+%06X : %s\n" , 
                 $idx, ($i << 3),((($i +1)<< 3)-1), $pattern ;

   
   }
   printf OUT "};\n\n";

   if($t ne $tt)
   {
       $tl = $range[($t-1) * 2 + 1] + 1;
       $th = $range[$t * 2] - 1;
       for($i = ($tl >> 3); $i <= ($th >> 3) ; $i ++ )
       {
          $data = 0;
          for($j = 0; $j < 8 ; $j++)
          {
             $k =  sprintf("%04X", (($i << 3) + $j));
      
             $cat =  $category{$k};
             if( $cat ne "")
             {
                 $data = $data +  ($map{$cat} << (4*$j));
             }
          }
          $pattern = sprintf("0x%08X", $data);
          if($data ne 0)
          {
             print "WARNING, Unicode Database now contain characters " .
                   "which we have not considered. change this program !!!\n\n";
             printf "Problem- U+%06X - U+%06X range\n", ($i << 3),((($i +1)<< 3)-1);
          }
       }
   }
}

printf STDERR  "Plane %d has %d patterns\n", $plane, $newidx[$plane]; 
if ($newidx[$plane] > 256) {
  printf STDERR  "We have more than 256 patterns for plane %d\n", $plane;
  die "This program is now broken!!!\n\n\n";      
}

for $plane (@planes) {
  printf OUT "static const PRUint32 gGenCatPatPl%d[$newidx] = {\n", $plane;
  for($i = 0 ; $i < $newidx[$plane]; $i++)
  {
     printf OUT "    %s,  // $i \n", $patarray[$plane][$i] ;
  }
  printf OUT "}; \n\n";
  $totaldata += $newidx[$plane] * 4;
}

printf OUT "static PRUint8 GetCat(PRUint32 u)\n{\n";
printf OUT "    PRUint32 pat;\n";
printf OUT "    //\n";
printf OUT "    //  Handle block which use index table mapping    \n";
printf OUT "    //\n";
for($t = 1; $t <= $tt; $t++)
{
   $tl = $range[($t-1) * 2];
   $th = $range[($t-1) * 2 + 1];
   if ($tl < $planeSplit) {
     $plane = 0;
   } else {
     $plane = 1;
   }
   printf OUT "    // Handle U+%06X to U+%06X\n", $tl, $th;
   printf OUT "    if(0x%06X <= u && u <= 0x%06X) {\n", $tl, $th;
   printf OUT "        pat = " .
              "gGenCatPatPl%d[gGenCatIdx%d [( u - 0x%06X ) / 8]];\n",
              $plane, $t, $tl;
   printf OUT "        return (pat  >> ((u % 8) * 4)) & 0x0F;\n";
   printf OUT "    }\n\n";
}

printf OUT "    //\n";
printf OUT "    //  Handle blocks which share the same category \n";
printf OUT "    //\n";


#@special = keys(%sh);
foreach $s ( @special ) {
   printf OUT "    // Handle %s block \n", $s; 
   printf OUT "    if(0x%s <= u && u <= 0x%s) \n", $sl{$s}, $sh{$s};
   printf OUT "        return $sc{$s}; \n\n";
}



printf OUT "    return 0; // UNDEFINE \n}\n";

printf OUT "// total data size = $totaldata\n";
#$total = 0;
#@pats = keys(%pat);
#foreach $pattern ( sort(@pats) ) {
#   $count = $pat{$pattern};
#   # print "$cat ==> $count\n";
#   $total++;
#}
print "total = $totaldata\n";

######################################################################
#
# Close files
#
######################################################################
close(UNIDATA);
close(OUT);

