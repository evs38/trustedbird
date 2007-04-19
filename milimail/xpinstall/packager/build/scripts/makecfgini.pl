#!c:\perl\bin\perl
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
# The Original Code is Mozilla Communicator client code, released
# March 31, 1998.
#
# The Initial Developer of the Original Code is
# Netscape Communications Corporation.
# Portions created by the Initial Developer are Copyright (C) 1998-1999
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Sean Su <ssu@netscape.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either of the GNU General Public License Version 2 or later (the "GPL"),
# or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#
# This perl script parses the input file for special variables
# in the format of $Variable$ and replace it with the appropriate
# value(s).
#
# Input: .it file
#             - name of the .ini template
#
#        .it file path
#             - where the .ini template is located
#
#        version
#             - version to display on the blue background
#
#        Path to staging area
#             - path on where the seamonkey built bits are staged to
#
#        xpi path
#             - path on where xpi files will be located at
#
#        redirect file url
#             - url to where the redirect.ini file will be staged at.
#               Either ftp:// or http:// can be used
#               ie: ftp://ftp.netscape.com/pub/seamonkey
#
#        xpi url
#             - url to where the .xpi files will be staged at.
#               Either ftp:// or http:// can be used
#               ie: ftp://ftp.netscape.com/pub/seamonkey/xpi
#
#   ie: perl makecfgini.pl config.it 6.0.0.1999120608 z:\exposed\windows\32bit\en\5.0 d:\builds\ns\dist\win32_o.obj\install\xpi ftp://sweetlou.mcom.com/products/client/seamonkey/windows/32bit/x86/1999-09-113-10-M10 ftp://sweetlou.mcom.com/products/client/seamonkey/windows/32bit/x86/1999-09-13-10-M10/xpi
#

# Make sure there are at least two arguments
if($#ARGV < 5)
{
  die "usage: $0 <.it file> <version> <staging path> <.xpi path> <redirect file url> <xpi url>

       .it file      : input ini template file

       .it file dir  : directory where the template file is located.

       version       : version to be shown in setup.  Typically the same version
                       as show in mozilla.exe.

       staging path  : path to where the components are staged at

       .xpi path     : path to where the .xpi files have been built to
                       ie: d:\\builds\\ns\\dist\\win32_o.obj\\install\\xpi

       redirect file : url to where the redirect.ini file will be staged at.
       url             Either ftp:// or http:// can be used
                       ie: ftp://ftp.netscape.com/pub/seamonkey
       xpi url       : url to where the .xpi files will be staged at.
                       Either ftp:// or http:// can be used
                       ie: ftp://ftp.netscape.com/pub/seamonkey/xpi
       \n";
}

$inItFile         = $ARGV[0];
$inItFileDir      = $ARGV[1];
$inVersion        = $ARGV[2];
$inStagePath      = $ARGV[3];
$inXpiPath        = $ARGV[4];
$inRedirIniUrl    = $ARGV[5];
$inUrl            = $ARGV[6];

# get environment vars
$userAgent        = $ENV{WIZ_userAgent};
$userAgentShort   = $ENV{WIZ_userAgentShort};
$xpinstallVersion = $ENV{WIZ_xpinstallVersion};
$nameCompany      = $ENV{WIZ_nameCompany};
$nameProduct      = $ENV{WIZ_nameProduct};
$nameProductNoVersion = $ENV{WIZ_nameProductNoVersion};
$nameProductInternal = $ENV{WIZ_nameProductInternal};
$descShortcut     = $ENV{WIZ_descShortcut};
$fileMainExe      = $ENV{WIZ_fileMainExe};
$fileUninstall    = $ENV{WIZ_fileUninstall};
$fileUninstallZip = $ENV{WIZ_fileUninstallZip};
$fileJavaPatchZip = $ENV{WIZ_fileJavaPatchZip};

$inDomain;
$inRedirDomain;
$inServerPath;
$inRedirServerPath;

($inDomain, $inServerPath)           = ParseDomainAndPath($inUrl);
($inRedirDomain, $inRedirServerPath) = ParseDomainAndPath($inRedirIniUrl);

# Get the name of the file replacing the .it extension with a .ini extension
@inItFileSplit    = split(/\./,$inItFile);
$outIniFile       = $inItFileSplit[0];
$outIniFile      .= ".ini";

# Open the input file
open(fpInIt, "$inItFileDir\\$inItFile") || die "\ncould not open $ARGV[0]: $!\n";

# Open the output file
open(fpOutIni, ">$inItFileDir\\$outIniFile") || die "\nCould not open $outIniFile: $!\n";

print "\n Making $inItFileDir\\$outIniFile...\n";

# While loop to read each line from input file
while($line = <fpInIt>)
{
  # For each line read, search and replace $InstallSize$ with the calculated size
  if($line =~ /\$InstallSize\$/i)
  {
    $installSize          = 0;
    $installSizeSystem    = 0;

    # split read line by ":" deliminator
    @colonSplit = split(/:/, $line);
    if($#colonSplit >= 0)
    {
      $componentName    = $colonSplit[1];
      chop($componentName);

      if($componentName =~ /\$UninstallFileZip\$/i)
      {
        $installSize = OutputInstallSizeArchive("$inXpiPath\\$fileUninstallZip") * 2;
      }
      else
      {
        $installSize = OutputInstallSize("$inStagePath\\$componentName");

        # special oji consideration here.  Since it's an installer that 
        # seamonkey installer will be calling, the disk space allocation
        # needs to be adjusted by an expansion factor of 3.62.
        if($componentName =~ /oji/i)
        {
          $installSize = int($installSize * 3.62 + $installSize);
        }
        # special realplayer8 consideration here.  Since it's an installer that 
        # seamonkey installer will be calling, the disk space allocation
        # needs to be adjusted by an expansion factor of 1.83.
        if($componentName =~ /realplay/i)
        {
          $installSize = int($installSize * 1.83 + $installSize);
        }
        # special winamp consideration here.  Since it's an installer that 
        # seamonkey installer will be calling, the disk space allocation
        # needs to be adjusted by an expansion factor of 2.57.
        if($componentName =~ /winamp/i)
        {
          $installSize = int($installSize * 2.57 + $installSize);
        }
        if($componentName =~ /n2p/i)
        {
          # net2phone files get initially installed into the temp dir, then *their* installer is run,
          # so double the disk space required just for installation purposes.
          $installSize = int($installSize * 2.1);
        }
        if($componentName =~ /psm/i)
        {
          # take into account the size of ren8dot3.ini file created (not installed) at installation time
          $installSize = int($installSize + 32);
        }
      }
    }

    # Read the next line to calculate for the "Install Size System="
    if($line = <fpInIt>)
    {
      if($line =~ /\$InstallSizeSystem\$/i)
      {
        $installSizeSystem = OutputInstallSizeSystem($line, "$inStagePath\\$componentName");
      }
    }

    $installSize -= $installSizeSystem;
    print fpOutIni "Install Size=$installSize\n";
    print fpOutIni "Install Size System=$installSizeSystem\n";
  }
  elsif($line =~ /\$InstallSizeArchive\$/i)
  {
    $installSizeArchive = 0;

    # split read line by ":" deliminator
    @colonSplit = split(/:/, $line);
    if($#colonSplit >= 0)
    {
      $componentName = $colonSplit[1];
      chop($componentName);
      $componentName      =~ s/\$UninstallFileZip\$/$fileUninstallZip/gi;
      $installSizeArchive = OutputInstallSizeArchive("$inXpiPath\\$componentName");
    }

    print fpOutIni "Install Size Archive=$installSizeArchive\n";
  }
  else
  {
    # For each line read, search and replace $Version$ with the version passed in
    $line =~ s/\$Version\$/$inVersion/gi;
    $line =~ s/\$Domain\$/$inDomain/gi;
    $line =~ s/\$ServerPath\$/$inServerPath/gi;
    $line =~ s/\$RedirIniUrl\$/$inRedirIniUrl/gi;
    $line =~ s/\$ArchiveServerPath\$/$inServerPath/gi;
    $line =~ s/\$ArchiveUrl\$/$inUrl/gi;
    $line =~ s/\$RedirectServerPath\$/$inRedirServerPath/gi;
    $line =~ s/\$RedirectUrl\$/$inRedirUrl/gi;
    $line =~ s/\$UserAgent\$/$userAgent/gi;
    $line =~ s/\$UserAgentShort\$/$userAgentShort/gi;
    $line =~ s/\$XPInstallVersion\$/$xpinstallVersion/gi;
    $line =~ s/\$CompanyName\$/$nameCompany/gi;
    $line =~ s/\$ProductName\$/$nameProduct/gi;
    $line =~ s/\$ProductNameNoVersion\$/$nameProductNoVersion/gi;
    $line =~ s/\$ProductNameInternal\$/$nameProductInternal/gi;
    $line =~ s/\$ShortcutDesc\$/$descShortcut/gi;
    $line =~ s/\$MainExeFile\$/$fileMainExe/gi;
    $line =~ s/\$UninstallFile\$/$fileUninstall/gi;
    $line =~ s/\$UninstallFileZip\$/$fileUninstallZip/gi;
    $line =~ s/\$JavaPatchFileZip\$/$fileJavaPatchZip/gi;
    print fpOutIni $line;
  }

}

print " done!\n";

# end of script
exit(0);

sub ParseDomainAndPath()
{
  my($aUrl) = @_;
  my($aDomain, $aServerPath);

  @slashSplit = split(/\//, $aUrl);
  if($#slashSplit >= 0)
  {
    for($i = 0; $i <= $#slashSplit; $i++)
    {
      if($i <= 2)
      {
        if($aDomain eq "")
        {
          $aDomain = "$slashSplit[$i]";
        }
        else
        {
          $aDomain = "$aDomain/$slashSplit[$i]";
        }
      }
      else
      {
        if($aServerPath eq "")
        {
          $aServerPath = "/$slashSplit[$i]";
        }
        else
        {
          $aServerPath = "$aServerPath/$slashSplit[$i]";
        }
      }
    }
  }

  return($aDomain, $aServerPath);
}

sub OutputInstallSize()
{
  my($inPath) = @_;
  my($installSize);

  print "   calculating size for $inPath\n";
  $installSize    = `$ENV{MOZ_TOOLS}\\bin\\ds32.exe /D /L0 /A /S /C 32768 $inPath`;
  $installSize   += 32768; # take into account install.js
  $installSize    = int($installSize / 1024);
  $installSize   += 1;
  return($installSize);
}

sub OutputInstallSizeArchive()
{
  my($inPath) = @_;
  my($installSizeArchive);
  my($dev, $ino, $mode, $nlink, $uid, $gui, $rdev, $size, $atime, $mtime, $ctime, $blksize, $blocks);

  print "   calculating size for $inPath\n";
  ($dev, $ino, $mode, $nlink, $uid, $gui, $rdev, $size, $atime, $mtime, $ctime, $blksize, $blocks) = stat $inPath;
  $installSizeArchive   += 32768; # take into account install.js
  $installSizeArchive    = int($size / 1024);
  $installSizeArchive   += 1;
  return($installSizeArchive);
}

sub OutputInstallSizeSystem()
{
  my($inLine, $inPath) = @_;
  my($installSizeSystem) = 0;

  # split read line by ":" deliminator
  @colonSplit = split(/:/, $inLine);
  if($#colonSplit >= 0)
  {
    # split line by "," deliminator
    @commaSplit = split(/\,/, $colonSplit[1]);
    if($#commaSplit >= 0)
    {
      foreach(@commaSplit)
      {
        # calculate the size of component installed using ds32.exe in Kbytes
        print "   calculating size for $inPath\\$_";
        $installSizeSystem += `$ENV{MOZ_TOOLS}\\bin\\ds32.exe /D /L0 /A /S /C 32768 $inPath\\$_`;
      }
    }
  }

  $installSizeSystem  = int($installSizeSystem / 1024);
  $installSizeSystem += 1;
  return($installSizeSystem);
}

sub ParseUserAgentShort()
{
  my($aUserAgent) = @_;
  my($aUserAgentShort);

  @spaceSplit = split(/ /, $aUserAgent);
  if($#spaceSplit >= 0)
  {
    $aUserAgentShort = $spaceSplit[0];
  }

  return($aUserAgentShort);
}

