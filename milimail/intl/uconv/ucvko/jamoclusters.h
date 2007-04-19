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
 * The Original Code is Mozilla Communicator client code.
 *
 * The Initial Developer of the Original Code is
 * Jungshik Shin <jshin@mailaps.org>.
 * Portions created by the Initial Developer are Copyright (C) 2003
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
 * The mapping table converting a sequence of 'basic' jamos to a cluster jamo.
 * There are 4 groups in the table. Group 1 and Group 2 are obtained by the 
 * direct translation of  Hangul Jamo compatibility decomposition mapping 
 * found in  Unicode 2.0 data  table at 
 * ftp://ftp.unicode.org/Public/2.0-update  to  
 * JamoNormMap type struct.  Group 3 and Group 4 are derived from Group 1
 * entries mapping a sequence of three Jamos to a cluster Jamo. In Group 3 and
 * Group 4, the first two Jamos or the last two Jamos in Group 1 are combined
 * together, if possible, to form a new 'basic' Jamo that, in turn is mapped
 * along with the last Jamo (in case of Group 3) or the first Jamo (in Group 4)
 * to a cluster jamo. 
 *
 * The full list is available at http://jshin.net/i18n/korean/jamocomp.html.
 */

// To reduce memory footprint, array elements are shifted by 0x1100
// from their actual positions at 0x1100.
  
// group 1: cluster jamos made of three basic jamos sorted for binary search 

const static JamoNormMap gJamoClustersGroup1[] =
{
  {{0x07, 0x07, 0x0b}, 0x2c},
  {{0x07, 0x09, 0x00}, 0x22},
  {{0x07, 0x09, 0x03}, 0x23},
  {{0x07, 0x09, 0x07}, 0x24},
  {{0x07, 0x09, 0x09}, 0x25},
  {{0x07, 0x09, 0x0c}, 0x26},
  {{0x09, 0x07, 0x00}, 0x33},
  {{0x09, 0x09, 0x09}, 0x34},
  {{0x69, 0x61, 0x75}, 0x6b},
  {{0x69, 0x65, 0x75}, 0x80},
  {{0x69, 0x67, 0x75}, 0x81},
  {{0x6d, 0x63, 0x75}, 0x85},
  {{0x6e, 0x61, 0x75}, 0x8a},
  {{0x6e, 0x65, 0x73}, 0x8b},
  {{0x6e, 0x65, 0x75}, 0x70},
  {{0x6e, 0x67, 0x75}, 0x8c},
  {{0x72, 0x65, 0x75}, 0x90},
  {{0x72, 0x67, 0x75}, 0x92},
  {{0x73, 0x75, 0x6e}, 0x97},
  {{0xa8, 0xba, 0xa8}, 0xc4},
  {{0xaf, 0xa8, 0xba}, 0xcc},
  {{0xaf, 0xae, 0xc2}, 0xcf},
  {{0xaf, 0xb7, 0xa8}, 0xd1},
  {{0xaf, 0xb7, 0xba}, 0xd2},
  {{0xaf, 0xb8, 0xba}, 0xd3},
  {{0xaf, 0xb8, 0xbc}, 0xd5},
  {{0xaf, 0xb8, 0xc2}, 0xd4},
  {{0xaf, 0xba, 0xba}, 0xd6},
  {{0xb7, 0xba, 0xba}, 0xde},
  {{0xbc, 0xa8, 0xa8}, 0xed}
};

const static JamoNormMap gJamoClustersGroup234[] =
{
  {{0x00, 0x00,    0}, 0x01},
  {{0x02, 0x00,    0}, 0x13},
  {{0x02, 0x02,    0}, 0x14},
  {{0x02, 0x03,    0}, 0x15},
  {{0x02, 0x07,    0}, 0x16},
  {{0x03, 0x00,    0}, 0x17},
  {{0x03, 0x03,    0}, 0x04},
  {{0x05, 0x02,    0}, 0x18},
  {{0x05, 0x05,    0}, 0x19},
  {{0x05, 0x0b,    0}, 0x1b},
  {{0x05, 0x12,    0}, 0x1a},
  {{0x06, 0x07,    0}, 0x1c},
  {{0x06, 0x0b,    0}, 0x1d},
  {{0x07, 0x00,    0}, 0x1e},
  {{0x07, 0x02,    0}, 0x1f},
  {{0x07, 0x03,    0}, 0x20},
  {{0x07, 0x07,    0}, 0x08},
  {{0x07, 0x09,    0}, 0x21},
  {{0x07, 0x0a,    0}, 0x25},
  {{0x07, 0x0b,    0}, 0x2b},
  {{0x07, 0x0c,    0}, 0x27},
  {{0x07, 0x0e,    0}, 0x28},
  {{0x07, 0x10,    0}, 0x29},
  {{0x07, 0x11,    0}, 0x2a},
  {{0x07, 0x2b,    0}, 0x2c},
  {{0x07, 0x2d,    0}, 0x22},
  {{0x07, 0x2f,    0}, 0x23},
  {{0x07, 0x32,    0}, 0x24},
  {{0x07, 0x36,    0}, 0x26},
  {{0x08, 0x0b,    0}, 0x2c},
  {{0x09, 0x00,    0}, 0x2d},
  {{0x09, 0x02,    0}, 0x2e},
  {{0x09, 0x03,    0}, 0x2f},
  {{0x09, 0x05,    0}, 0x30},
  {{0x09, 0x06,    0}, 0x31},
  {{0x09, 0x07,    0}, 0x32},
  {{0x09, 0x09,    0}, 0x0a},
  {{0x09, 0x0a,    0}, 0x34},
  {{0x09, 0x0b,    0}, 0x35},
  {{0x09, 0x0c,    0}, 0x36},
  {{0x09, 0x0e,    0}, 0x37},
  {{0x09, 0x0f,    0}, 0x38},
  {{0x09, 0x10,    0}, 0x39},
  {{0x09, 0x11,    0}, 0x3a},
  {{0x09, 0x12,    0}, 0x3b},
  {{0x09, 0x1e,    0}, 0x33},
  {{0x0a, 0x09,    0}, 0x34},
  {{0x0b, 0x00,    0}, 0x41},
  {{0x0b, 0x03,    0}, 0x42},
  {{0x0b, 0x06,    0}, 0x43},
  {{0x0b, 0x07,    0}, 0x44},
  {{0x0b, 0x09,    0}, 0x45},
  {{0x0b, 0x0b,    0}, 0x47},
  {{0x0b, 0x0c,    0}, 0x48},
  {{0x0b, 0x0e,    0}, 0x49},
  {{0x0b, 0x10,    0}, 0x4a},
  {{0x0b, 0x11,    0}, 0x4b},
  {{0x0b, 0x40,    0}, 0x46},
  {{0x0c, 0x0b,    0}, 0x4d},
  {{0x0c, 0x0c,    0}, 0x0d},
  {{0x0e, 0x0f,    0}, 0x52},
  {{0x0e, 0x12,    0}, 0x53},
  {{0x11, 0x07,    0}, 0x56},
  {{0x11, 0x0b,    0}, 0x57},
  {{0x12, 0x12,    0}, 0x58},
  {{0x21, 0x00,    0}, 0x22},
  {{0x21, 0x03,    0}, 0x23},
  {{0x21, 0x07,    0}, 0x24},
  {{0x21, 0x09,    0}, 0x25},
  {{0x21, 0x0c,    0}, 0x26},
  {{0x32, 0x00,    0}, 0x33},
  {{0x3c, 0x3c,    0}, 0x3d},
  {{0x3e, 0x3e,    0}, 0x3f},
  {{0x4e, 0x4e,    0}, 0x4f},
  {{0x50, 0x50,    0}, 0x51},
  {{0x61, 0x69,    0}, 0x76},
  {{0x61, 0x6e,    0}, 0x77},
  {{0x61, 0x75,    0}, 0x62},
  {{0x63, 0x69,    0}, 0x78},
  {{0x63, 0x6d,    0}, 0x79},
  {{0x63, 0x75,    0}, 0x64},
  {{0x65, 0x69,    0}, 0x7a},
  {{0x65, 0x6e,    0}, 0x7b},
  {{0x65, 0x73,    0}, 0x7c},
  {{0x65, 0x75,    0}, 0x66},
  {{0x67, 0x69,    0}, 0x7d},
  {{0x67, 0x6e,    0}, 0x7e},
  {{0x67, 0x75,    0}, 0x68},
  {{0x69, 0x61,    0}, 0x6a},
  {{0x69, 0x62,    0}, 0x6b},
  {{0x69, 0x65,    0}, 0x7f},
  {{0x69, 0x66,    0}, 0x80},
  {{0x69, 0x68,    0}, 0x81},
  {{0x69, 0x69,    0}, 0x82},
  {{0x69, 0x6e,    0}, 0x83},
  {{0x69, 0x75,    0}, 0x6c},
  {{0x6a, 0x75,    0}, 0x6b},
  {{0x6d, 0x63,    0}, 0x84},
  {{0x6d, 0x64,    0}, 0x85},
  {{0x6d, 0x67,    0}, 0x86},
  {{0x6d, 0x69,    0}, 0x87},
  {{0x6d, 0x75,    0}, 0x88},
  {{0x6e, 0x61,    0}, 0x89},
  {{0x6e, 0x62,    0}, 0x8a},
  {{0x6e, 0x65,    0}, 0x6f},
  {{0x6e, 0x66,    0}, 0x70},
  {{0x6e, 0x68,    0}, 0x8c},
  {{0x6e, 0x6e,    0}, 0x8d},
  {{0x6e, 0x75,    0}, 0x71},
  {{0x6e, 0x7c,    0}, 0x8b},
  {{0x6f, 0x73,    0}, 0x8b},
  {{0x6f, 0x75,    0}, 0x70},
  {{0x72, 0x61,    0}, 0x8e},
  {{0x72, 0x65,    0}, 0x8f},
  {{0x72, 0x66,    0}, 0x90},
  {{0x72, 0x67,    0}, 0x91},
  {{0x72, 0x68,    0}, 0x92},
  {{0x72, 0x6e,    0}, 0x93},
  {{0x72, 0x75,    0}, 0x94},
  {{0x73, 0x6e,    0}, 0x95},
  {{0x73, 0x73,    0}, 0x96},
  {{0x73, 0x75,    0}, 0x74},
  {{0x73, 0x9b,    0}, 0x97},
  {{0x74, 0x6e,    0}, 0x97},
  {{0x75, 0x61,    0}, 0x98},
  {{0x75, 0x63,    0}, 0x99},
  {{0x75, 0x69,    0}, 0x9a},
  {{0x75, 0x6e,    0}, 0x9b},
  {{0x75, 0x73,    0}, 0x9c},
  {{0x75, 0x9e,    0}, 0x9d},
  {{0x7f, 0x75,    0}, 0x80},
  {{0x84, 0x75,    0}, 0x85},
  {{0x89, 0x75,    0}, 0x8a},
  {{0x8f, 0x75,    0}, 0x90},
  {{0x91, 0x75,    0}, 0x92},
  {{0x9e, 0x65,    0}, 0x9f},
  {{0x9e, 0x6e,    0}, 0xa0},
  {{0x9e, 0x75,    0}, 0xa1},
  {{0x9e, 0x9e,    0}, 0xa2},
  {{0xa8, 0xa8,    0}, 0xa9},
  {{0xa8, 0xaf,    0}, 0xc3},
  {{0xa8, 0xba,    0}, 0xaa},
  {{0xa8, 0xe7,    0}, 0xc4},
  {{0xaa, 0xa8,    0}, 0xc4},
  {{0xab, 0xa8,    0}, 0xc5},
  {{0xab, 0xae,    0}, 0xc6},
  {{0xab, 0xba,    0}, 0xc7},
  {{0xab, 0xbd,    0}, 0xac},
  {{0xab, 0xc0,    0}, 0xc9},
  {{0xab, 0xc2,    0}, 0xad},
  {{0xab, 0xeb,    0}, 0xc8},
  {{0xae, 0xa8,    0}, 0xca},
  {{0xae, 0xaf,    0}, 0xcb},
  {{0xaf, 0xa8,    0}, 0xb0},
  {{0xaf, 0xaa,    0}, 0xcc},
  {{0xaf, 0xab,    0}, 0xcd},
  {{0xaf, 0xae,    0}, 0xce},
  {{0xaf, 0xaf,    0}, 0xd0},
  {{0xaf, 0xb7,    0}, 0xb1},
  {{0xaf, 0xb8,    0}, 0xb2},
  {{0xaf, 0xb9,    0}, 0xd3},
  {{0xaf, 0xba,    0}, 0xb3},
  {{0xaf, 0xbb,    0}, 0xd6},
  {{0xaf, 0xbf,    0}, 0xd8},
  {{0xaf, 0xc0,    0}, 0xb4},
  {{0xaf, 0xc1,    0}, 0xb5},
  {{0xaf, 0xc2,    0}, 0xb6},
  {{0xaf, 0xda,    0}, 0xd1},
  {{0xaf, 0xdd,    0}, 0xd2},
  {{0xaf, 0xe5,    0}, 0xd4},
  {{0xaf, 0xe6,    0}, 0xd5},
  {{0xaf, 0xeb,    0}, 0xd7},
  {{0xaf, 0xf9,    0}, 0xd9},
  {{0xb0, 0xba,    0}, 0xcc},
  {{0xb1, 0xa8,    0}, 0xd1},
  {{0xb1, 0xba,    0}, 0xd2},
  {{0xb2, 0xba,    0}, 0xd3},
  {{0xb2, 0xbc,    0}, 0xd5},
  {{0xb2, 0xc2,    0}, 0xd4},
  {{0xb3, 0xba,    0}, 0xd6},
  {{0xb7, 0xa8,    0}, 0xda},
  {{0xb7, 0xaf,    0}, 0xdb},
  {{0xb7, 0xb8,    0}, 0xdc},
  {{0xb7, 0xba,    0}, 0xdd},
  {{0xb7, 0xbb,    0}, 0xde},
  {{0xb7, 0xbc,    0}, 0xe2},
  {{0xb7, 0xbe,    0}, 0xe0},
  {{0xb7, 0xc2,    0}, 0xe1},
  {{0xb7, 0xeb,    0}, 0xdf},
  {{0xb8, 0xaf,    0}, 0xe3},
  {{0xb8, 0xba,    0}, 0xb9},
  {{0xb8, 0xbc,    0}, 0xe6},
  {{0xb8, 0xc1,    0}, 0xe4},
  {{0xb8, 0xc2,    0}, 0xe5},
  {{0xba, 0xa8,    0}, 0xe7},
  {{0xba, 0xae,    0}, 0xe8},
  {{0xba, 0xaf,    0}, 0xe9},
  {{0xba, 0xb8,    0}, 0xea},
  {{0xba, 0xba,    0}, 0xbb},
  {{0xbc, 0xa8,    0}, 0xec},
  {{0xbc, 0xa9,    0}, 0xed},
  {{0xbc, 0xbc,    0}, 0xee},
  {{0xbc, 0xbf,    0}, 0xef},
  {{0xc1, 0xb8,    0}, 0xf3},
  {{0xc1, 0xbc,    0}, 0xf4},
  {{0xc2, 0xab,    0}, 0xf5},
  {{0xc2, 0xaf,    0}, 0xf6},
  {{0xc2, 0xb7,    0}, 0xf7},
  {{0xc2, 0xb8,    0}, 0xf8},
  {{0xce, 0xc2,    0}, 0xcf},
  {{0xdd, 0xba,    0}, 0xde},
  {{0xec, 0xa8,    0}, 0xed},
  {{0xf0, 0xba,    0}, 0xf1},
  {{0xf0, 0xeb,    0}, 0xf2}
};

/**
 * Extended  Jamo clusters included below were identified by Korean linguists
 * consulted by Microsoft Korea and the list is available at
 * http://www.microsoft.com/typography/otfntdev/hangulot/appen.htm
 * as well as obtainable from  truetype fonts supporting them.
 */

/**
 * The map from sequences of leading consonants forming consonant clusters
 * not encoded in U+1100 block to  temporary code points in the 0xf000 block.
 * To reduce memory footprint, array elements are shifted by 0xf000
 * from their actual positions.
 */

const static JamoNormMap gExtLcClustersGroup1[]=
{
  {{0x05, 0x00, 0x00}, 0x6a}, // U+1105 U+1100 U+1100 => lc # 0x6a
  {{0x05, 0x03, 0x03}, 0x6c}, // U+1105 U+1103 U+1103 => lc # 0x6c
  {{0x05, 0x07, 0x07}, 0x6f}, // U+1105 U+1107 U+1107 => lc # 0x6f
  {{0x05, 0x07, 0x0b}, 0x70}, // U+1105 U+1107 U+110b => lc # 0x70
  {{0x07, 0x09, 0x10}, 0x77}, // U+1107 U+1109 U+1110 => lc # 0x77
  {{0x09, 0x09, 0x07}, 0x7a}, // U+1109 U+1109 U+1107 => lc # 0x7a
  {{0x0c, 0x0c, 0x12}, 0x7d}, // U+110c U+110c U+1112 => lc # 0x7d
};

const static JamoNormMap gExtLcClustersGroup2[]=
{
  {{0x00, 0x03,    0}, 0x60}, // U+1100 U+1103        => lc # 0x60
  {{0x02, 0x09,    0}, 0x61}, // U+1102 U+1109        => lc # 0x61
  {{0x02, 0x0c,    0}, 0x62}, // U+1102 U+110c        => lc # 0x62
  {{0x02, 0x12,    0}, 0x63}, // U+1102 U+1112        => lc # 0x63
  {{0x03, 0x05,    0}, 0x64}, // U+1103 U+1105        => lc # 0x64
  {{0x03, 0x06,    0}, 0x65}, // U+1103 U+1106        => lc # 0x65
  {{0x03, 0x07,    0}, 0x66}, // U+1103 U+1107        => lc # 0x66
  {{0x03, 0x09,    0}, 0x67}, // U+1103 U+1109        => lc # 0x67
  {{0x03, 0x0c,    0}, 0x68}, // U+1103 U+110c        => lc # 0x68
  {{0x05, 0x00,    0}, 0x69}, // U+1105 U+1100        => lc # 0x69
  {{0x05, 0x01,    0}, 0x6a}, // U+1105 U+1101        => lc # 0x6a
  {{0x05, 0x03,    0}, 0x6b}, // U+1105 U+1103        => lc # 0x6b
  {{0x05, 0x04,    0}, 0x6c}, // U+1105 U+1104        => lc # 0x6c
  {{0x05, 0x06,    0}, 0x6d}, // U+1105 U+1106        => lc # 0x6d
  {{0x05, 0x07,    0}, 0x6e}, // U+1105 U+1107        => lc # 0x6e
  {{0x05, 0x08,    0}, 0x6f}, // U+1105 U+1108        => lc # 0x6f
  {{0x05, 0x09,    0}, 0x71}, // U+1105 U+1109        => lc # 0x71
  {{0x05, 0x0c,    0}, 0x72}, // U+1105 U+110c        => lc # 0x72
  {{0x05, 0x0f,    0}, 0x73}, // U+1105 U+110f        => lc # 0x73
  {{0x05, 0x2b,    0}, 0x70}, // U+1105 U+112b        => lc # 0x70
  {{0x06, 0x00,    0}, 0x74}, // U+1106 U+1100        => lc # 0x74
  {{0x06, 0x03,    0}, 0x75}, // U+1106 U+1103        => lc # 0x75
  {{0x06, 0x09,    0}, 0x76}, // U+1106 U+1109        => lc # 0x76
  {{0x07, 0x0f,    0}, 0x78}, // U+1107 U+110f        => lc # 0x78
  {{0x07, 0x12,    0}, 0x79}, // U+1107 U+1112        => lc # 0x79
  {{0x0a, 0x07,    0}, 0x7a}, // U+110a U+1107        => lc # 0x7a
  {{0x0b, 0x05,    0}, 0x7b}, // U+110b U+1105        => lc # 0x7b
  {{0x0b, 0x12,    0}, 0x7c}, // U+110b U+1112        => lc # 0x7c
  {{0x0d, 0x12,    0}, 0x7d}, // U+110d U+1112        => lc # 0x7d
  {{0x10, 0x10,    0}, 0x7e}, // U+1110 U+1110        => lc # 0x7e
  {{0x11, 0x12,    0}, 0x7f}, // U+1111 U+1112        => lc # 0x7f
  {{0x12, 0x09,    0}, 0x80}, // U+1112 U+1109        => lc # 0x80
  {{0x59, 0x59,    0}, 0x81}, // U+1159 U+1159        => lc # 0x81
};

/**
 * The map from sequences of vowels  forming vowels clusters
 * not encoded in U+1100 block to  temporary code points in the 0xf100 block.
 * To reduce memory footprint, array elements are shifted by 0xf100
 * from their actual positions.
 */

const static JamoNormMap gExtVoClustersGroup1[]=
{
  {{0x09, 0x03, 0x15}, 0x47}, // U+1169 U+1163 U+1175 => vowel # 0x47
  {{0x09, 0x0e, 0x3e}, 0x49}, // U+1169 U+116e U+119e => vowel # 0x49
  {{0x0d, 0x01, 0x15}, 0x4b}, // U+116d U+1161 U+1175 => vowel # 0x4b
  {{0x0e, 0x15, 0x15}, 0x4e}, // U+116e U+1175 U+1175 => vowel # 0x4e
  {{0x12, 0x01, 0x15}, 0x4f}, // U+1172 U+1161 U+1175 => vowel # 0x4f
  {{0x13, 0x05, 0x15}, 0x53}, // U+1173 U+1165 U+1175 => vowel # 0x53
  {{0x15, 0x03, 0x09}, 0x55}, // U+1175 U+1163 U+1169 => vowel # 0x55
  {{0x15, 0x03, 0x15}, 0x56}, // U+1175 U+1163 U+1175 => vowel # 0x56
  {{0x15, 0x07, 0x15}, 0x58}, // U+1175 U+1167 U+1175 => vowel # 0x58
  {{0x15, 0x09, 0x3e}, 0x59}, // U+1175 U+1169 U+119e => vowel # 0x59
  {{0x3e, 0x05, 0x15}, 0x5e}, // U+119e U+1165 U+1175 => vowel # 0x5e
};

const static JamoNormMap gExtVoClustersGroup2[]=
{
  {{0x01, 0x13,    0}, 0x43}, // U+1161 U+1173        => vowel # 0x43
  {{0x03, 0x0e,    0}, 0x44}, // U+1163 U+116e        => vowel # 0x44
  {{0x07, 0x03,    0}, 0x45}, // U+1167 U+1163        => vowel # 0x45
  {{0x09, 0x03,    0}, 0x46}, // U+1169 U+1163        => vowel # 0x46
  {{0x09, 0x04,    0}, 0x47}, // U+1169 U+1164        => vowel # 0x47
  {{0x09, 0x07,    0}, 0x48}, // U+1169 U+1167        => vowel # 0x48
  {{0x0d, 0x01,    0}, 0x4a}, // U+116d U+1161        => vowel # 0x4a
  {{0x0d, 0x02,    0}, 0x4b}, // U+116d U+1162        => vowel # 0x4b
  {{0x0d, 0x05,    0}, 0x4c}, // U+116d U+1165        => vowel # 0x4c
  {{0x0e, 0x07,    0}, 0x4d}, // U+116e U+1167        => vowel # 0x4d
  {{0x11, 0x15,    0}, 0x4e}, // U+1171 U+1175        => vowel # 0x4e
  {{0x12, 0x02,    0}, 0x4f}, // U+1172 U+1162        => vowel # 0x4f
  {{0x12, 0x09,    0}, 0x50}, // U+1172 U+1169        => vowel # 0x50
  {{0x13, 0x01,    0}, 0x51}, // U+1173 U+1161        => vowel # 0x51
  {{0x13, 0x05,    0}, 0x52}, // U+1173 U+1165        => vowel # 0x52
  {{0x13, 0x06,    0}, 0x53}, // U+1173 U+1166        => vowel # 0x53
  {{0x13, 0x09,    0}, 0x54}, // U+1173 U+1169        => vowel # 0x54
  {{0x15, 0x04,    0}, 0x56}, // U+1175 U+1164        => vowel # 0x56
  {{0x15, 0x07,    0}, 0x57}, // U+1175 U+1167        => vowel # 0x57
  {{0x15, 0x08,    0}, 0x58}, // U+1175 U+1168        => vowel # 0x58
  {{0x15, 0x0d,    0}, 0x5a}, // U+1175 U+116d        => vowel # 0x5a
  {{0x15, 0x12,    0}, 0x5b}, // U+1175 U+1172        => vowel # 0x5b
  {{0x15, 0x15,    0}, 0x5c}, // U+1175 U+1175        => vowel # 0x5c
  {{0x23, 0x3e,    0}, 0x49}, // U+1183 U+119e        => vowel # 0x49
  {{0x2e, 0x15,    0}, 0x4f}, // U+118e U+1175        => vowel # 0x4f
  {{0x3a, 0x3e,    0}, 0x59}, // U+119a U+119e        => vowel # 0x59
  {{0x3e, 0x01,    0}, 0x5d}, // U+119e U+1161        => vowel # 0x5d
  {{0x3e, 0x06,    0}, 0x5e}, // U+119e U+1166        => vowel # 0x5e
  {{0x3f, 0x15,    0}, 0x5e}, // U+119f U+1175        => vowel # 0x5e
};

/**
 * The map from sequences of trailing consonants  forming consonant clusters
 * not encoded in U+1100 block to  temporary code points in the 0xf200 block.
 * To reduce memory footprint, array elements are shifted by 0xf200
 * from their actual positions.
 */

const static JamoNormMap gExtTcClustersGroup1[]=
{
  {{0x06, 0x06, 0x10}, 0x5b}, // U+11ae U+11ae U+11b8 => tc # 0x5b
  {{0x06, 0x12, 0x00}, 0x5e}, // U+11ae U+11ba U+11a8 => tc # 0x5e
  {{0x07, 0x00, 0x00}, 0x62}, // U+11af U+11a8 U+11a8 => tc # 0x62
  {{0x07, 0x00, 0x1a}, 0x63}, // U+11af U+11a8 U+11c2 => tc # 0x63
  {{0x07, 0x07, 0x17}, 0x64}, // U+11af U+11af U+11bf => tc # 0x64
  {{0x07, 0x0f, 0x1a}, 0x65}, // U+11af U+11b7 U+11c2 => tc # 0x65
  {{0x07, 0x10, 0x06}, 0x66}, // U+11af U+11b8 U+11ae => tc # 0x66
  {{0x07, 0x10, 0x19}, 0x67}, // U+11af U+11b8 U+11c1 => tc # 0x67
  {{0x07, 0x51, 0x1a}, 0x69}, // U+11af U+11f9 U+11c2 => tc # 0x69
  {{0x0f, 0x03, 0x03}, 0x6c}, // U+11b7 U+11ab U+11ab => tc # 0x6c
  {{0x0f, 0x10, 0x12}, 0x6e}, // U+11b7 U+11b8 U+11ba => tc # 0x6e
  {{0x10, 0x07, 0x19}, 0x71}, // U+11b8 U+11af U+11c1 => tc # 0x71
  {{0x10, 0x12, 0x06}, 0x74}, // U+11b8 U+11ba U+11ae => tc # 0x74
  {{0x12, 0x10, 0x14}, 0x78}, // U+11ba U+11b8 U+11bc => tc # 0x78
  {{0x12, 0x12, 0x00}, 0x79}, // U+11ba U+11ba U+11a8 => tc # 0x79
  {{0x12, 0x12, 0x06}, 0x7a}, // U+11ba U+11ba U+11ae => tc # 0x7a
  {{0x15, 0x10, 0x10}, 0x89}, // U+11bd U+11b8 U+11b8 => tc # 0x89
  {{0x43, 0x10, 0x14}, 0x81}, // U+11eb U+11b8 U+11bc => tc # 0x81
};

const static JamoNormMap gExtTcClustersGroup2[]=
{
  {{0x00, 0x03,    0}, 0x52}, // U+11a8 U+11ab        => tc # 0x52
  {{0x00, 0x10,    0}, 0x53}, // U+11a8 U+11b8        => tc # 0x53
  {{0x00, 0x16,    0}, 0x54}, // U+11a8 U+11be        => tc # 0x54
  {{0x00, 0x17,    0}, 0x55}, // U+11a8 U+11bf        => tc # 0x55
  {{0x00, 0x1a,    0}, 0x56}, // U+11a8 U+11c2        => tc # 0x56
  {{0x03, 0x03,    0}, 0x57}, // U+11ab U+11ab        => tc # 0x57
  {{0x03, 0x07,    0}, 0x58}, // U+11ab U+11af        => tc # 0x58
  {{0x03, 0x16,    0}, 0x59}, // U+11ab U+11be        => tc # 0x59
  {{0x06, 0x06,    0}, 0x5a}, // U+11ae U+11ae        => tc # 0x5a
  {{0x06, 0x10,    0}, 0x5c}, // U+11ae U+11b8        => tc # 0x5c
  {{0x06, 0x12,    0}, 0x5d}, // U+11ae U+11ba        => tc # 0x5d
  {{0x06, 0x15,    0}, 0x5f}, // U+11ae U+11bd        => tc # 0x5f
  {{0x06, 0x16,    0}, 0x60}, // U+11ae U+11be        => tc # 0x60
  {{0x06, 0x18,    0}, 0x61}, // U+11ae U+11c0        => tc # 0x61
  {{0x06, 0x3f,    0}, 0x5e}, // U+11ae U+11e7        => tc # 0x5e
  {{0x07, 0x01,    0}, 0x62}, // U+11af U+11a9        => tc # 0x62
  {{0x07, 0x14,    0}, 0x6a}, // U+11af U+11bc        => tc # 0x6a
  {{0x07, 0x30,    0}, 0x64}, // U+11af U+11d8        => tc # 0x64
  {{0x07, 0x39,    0}, 0x65}, // U+11af U+11e1        => tc # 0x65
  {{0x07, 0x3c,    0}, 0x67}, // U+11af U+11e4        => tc # 0x67
  {{0x07, 0x48,    0}, 0x68}, // U+11af U+11f0        => tc # 0x68
  {{0x08, 0x00,    0}, 0x62}, // U+11b0 U+11a8        => tc # 0x62
  {{0x08, 0x1a,    0}, 0x63}, // U+11b0 U+11c2        => tc # 0x63
  {{0x09, 0x1a,    0}, 0x65}, // U+11b1 U+11c2        => tc # 0x65
  {{0x0a, 0x06,    0}, 0x66}, // U+11b2 U+11ae        => tc # 0x66
  {{0x0a, 0x19,    0}, 0x67}, // U+11b2 U+11c1        => tc # 0x67
  {{0x0f, 0x03,    0}, 0x6b}, // U+11b7 U+11ab        => tc # 0x6b
  {{0x0f, 0x0f,    0}, 0x6d}, // U+11b7 U+11b7        => tc # 0x6d
  {{0x0f, 0x11,    0}, 0x6e}, // U+11b7 U+11b9        => tc # 0x6e
  {{0x0f, 0x15,    0}, 0x6f}, // U+11b7 U+11bd        => tc # 0x6f
  {{0x10, 0x06,    0}, 0x70}, // U+11b8 U+11ae        => tc # 0x70
  {{0x10, 0x0f,    0}, 0x72}, // U+11b8 U+11b7        => tc # 0x72
  {{0x10, 0x10,    0}, 0x73}, // U+11b8 U+11b8        => tc # 0x73
  {{0x10, 0x15,    0}, 0x75}, // U+11b8 U+11bd        => tc # 0x75
  {{0x10, 0x16,    0}, 0x76}, // U+11b8 U+11be        => tc # 0x76
  {{0x10, 0x40,    0}, 0x74}, // U+11b8 U+11e8        => tc # 0x74
  {{0x11, 0x06,    0}, 0x74}, // U+11b9 U+11ae        => tc # 0x74
  {{0x12, 0x0f,    0}, 0x77}, // U+11ba U+11b7        => tc # 0x77
  {{0x12, 0x15,    0}, 0x7c}, // U+11ba U+11bd        => tc # 0x7c
  {{0x12, 0x16,    0}, 0x7d}, // U+11ba U+11be        => tc # 0x7d
  {{0x12, 0x18,    0}, 0x7e}, // U+11ba U+11c0        => tc # 0x7e
  {{0x12, 0x1a,    0}, 0x7f}, // U+11ba U+11c2        => tc # 0x7f
  {{0x12, 0x3e,    0}, 0x78}, // U+11ba U+11e6        => tc # 0x78
  {{0x12, 0x3f,    0}, 0x79}, // U+11ba U+11e7        => tc # 0x79
  {{0x12, 0x40,    0}, 0x7a}, // U+11ba U+11e8        => tc # 0x7a
  {{0x12, 0x43,    0}, 0x7b}, // U+11ba U+11eb        => tc # 0x7b
  {{0x13, 0x00,    0}, 0x79}, // U+11bb U+11a8        => tc # 0x79
  {{0x13, 0x06,    0}, 0x7a}, // U+11bb U+11ae        => tc # 0x7a
  {{0x14, 0x0f,    0}, 0x82}, // U+11bc U+11b7        => tc # 0x82
  {{0x14, 0x12,    0}, 0x83}, // U+11bc U+11ba        => tc # 0x83
  {{0x14, 0x1a,    0}, 0x84}, // U+11bc U+11c2        => tc # 0x84
  {{0x15, 0x10,    0}, 0x88}, // U+11bd U+11b8        => tc # 0x88
  {{0x15, 0x15,    0}, 0x8a}, // U+11bd U+11bd        => tc # 0x8a
  {{0x19, 0x14,    0}, 0x8c}, // U+11c1 U+11bc        => tc # 0x8c
  {{0x19, 0x18,    0}, 0x8b}, // U+11c1 U+11c0        => tc # 0x8b
  {{0x28, 0x17,    0}, 0x64}, // U+11d0 U+11bf        => tc # 0x64
  {{0x31, 0x1a,    0}, 0x69}, // U+11d9 U+11c2        => tc # 0x69
  {{0x34, 0x12,    0}, 0x6e}, // U+11dc U+11ba        => tc # 0x6e
  {{0x3b, 0x19,    0}, 0x71}, // U+11e3 U+11c1        => tc # 0x71
  {{0x42, 0x14,    0}, 0x78}, // U+11ea U+11bc        => tc # 0x78
  {{0x43, 0x10,    0}, 0x80}, // U+11eb U+11b8        => tc # 0x80
  {{0x43, 0x3e,    0}, 0x81}, // U+11eb U+11e6        => tc # 0x81
  {{0x48, 0x00,    0}, 0x85}, // U+11f0 U+11a8        => tc # 0x85
  {{0x48, 0x17,    0}, 0x86}, // U+11f0 U+11bf        => tc # 0x86
  {{0x48, 0x1a,    0}, 0x87}, // U+11f0 U+11c2        => tc # 0x87
};
