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
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Roland Mainz <roland.mainz@informatik.med.uni-giessen.de>
 *   Leon Sha <leon.sha@sun.com>
 *   Boris Zbarsky <bzbarsky@mit.edu>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#ifndef nsIRenderingContext_h___
#define nsIRenderingContext_h___

#include "nscore.h"
#include "nsISupports.h"
#include "nsColor.h"
#include "nsCoord.h"
#include "nsIDrawingSurface.h"
#include <stdio.h>

class nsIWidget;
class nsIFontMetrics;
class nsTransform2D;
class nsString;
class nsIDeviceContext;
class nsIRegion;
class nsIAtom;

struct nsFont;
struct nsPoint;
struct nsRect;
struct nsTextDimensions;
#ifdef MOZ_MATHML
struct nsBoundingMetrics;
#endif

/* gfx2 */
class imgIContainer;

//cliprect/region combination methods

typedef enum
{
  nsClipCombine_kIntersect = 0,
  nsClipCombine_kUnion = 1,
  nsClipCombine_kSubtract = 2,
  nsClipCombine_kReplace = 3
} nsClipCombine;

//linestyles
typedef enum
{
  nsLineStyle_kNone   = 0,
  nsLineStyle_kSolid  = 1,
  nsLineStyle_kDashed = 2,
  nsLineStyle_kDotted = 3
} nsLineStyle;

typedef enum
{
  nsPenMode_kNone   = 0,
  nsPenMode_kInvert = 1
} nsPenMode;


// IID for the nsIRenderingContext interface
#define NS_IRENDERING_CONTEXT_IID \
 { 0xd91f728b, 0xd7f4, 0x4e19,{0x8b, 0xdd, 0x98, 0x99, 0x3f, 0xdf, 0xec, 0xc6}}

//----------------------------------------------------------------------

// RenderingContext interface
class nsIRenderingContext : public nsISupports
{
public:
  NS_DEFINE_STATIC_IID_ACCESSOR(NS_IRENDERING_CONTEXT_IID)

  //TBD: bind/unbind, transformation of scalars (hacky), 
  //potential drawmode for selection, polygons. MMP

  /**
   * Initialize the RenderingContext
   * @param aContext the device context to use.
   * @param aWidget the widget to hook up to
   * @result The result of the initialization, NS_Ok if no errors
   */
  NS_IMETHOD Init(nsIDeviceContext* aContext, nsIWidget *aWidget) = 0;

  /**
   * Initialize the RenderingContext
   * @param aContext the device context to use for the drawing.
   * @param aSurface the surface to draw into
   * @result The result of the initialization, NS_Ok if no errors
   */
  NS_IMETHOD Init(nsIDeviceContext* aContext, nsIDrawingSurface* aSurface) = 0;

  /**
   * Reset the rendering context
   */
  NS_IMETHOD Reset(void) = 0;

  /**
   * Get the DeviceContext that this RenderingContext was initialized with
   * @result the device context
   */
  NS_IMETHOD GetDeviceContext(nsIDeviceContext *& aDeviceContext) = 0;

  /**
   * Lock a rect of the drawing surface associated with the
   * rendering context. do not attempt to use any of the Rendering Context
   * rendering or state management methods until the drawing surface has
   * been Unlock()ed. if a drawing surface is Lock()ed with this method,
   * it must be Unlock()ed by calling UnlockDrawingSurface() rather than
   * just calling the Unlock() method on the drawing surface directly.
   * see nsIDrawingSurface.h for more information
   * @return error status
   **/
  NS_IMETHOD LockDrawingSurface(PRInt32 aX, PRInt32 aY, PRUint32 aWidth, PRUint32 aHeight,
                                void **aBits, PRInt32 *aStride, PRInt32 *aWidthBytes,
                                PRUint32 aFlags) = 0;

  /**
   * Unlock a rect of the drawing surface associated with the rendering
   * context. see nsIDrawingSurface.h for more information.
   * @return error status
   **/
  NS_IMETHOD UnlockDrawingSurface(void) = 0;

  /**
   * Selects an offscreen drawing surface into the RenderingContext to draw to.
   * @param aSurface is the offscreen surface we are going to draw to.
   *        if nsnull, the original drawing surface obtained at initialization
   *        should be selected.
   */
  NS_IMETHOD SelectOffScreenDrawingSurface(nsIDrawingSurface* aSurface) = 0;

  /**
   * Get the currently selected drawing surface
   * @param aSurface out parameter for the current drawing surface
   */
  NS_IMETHOD GetDrawingSurface(nsIDrawingSurface* *aSurface) = 0;

  /**
   * Returns in aResult any rendering hints that the context has.
   * See below for the hints bits. Always returns NS_OK.
   */
  NS_IMETHOD GetHints(PRUint32& aResult) = 0;

  /**
   * Save a graphical state onto a stack.
   */
  NS_IMETHOD PushState(void) = 0;

  /**
   * Get and and set RenderingContext to this graphical state
   */
  NS_IMETHOD PopState(void) = 0;

  /**
   * Tells if a given rectangle is visible within the rendering context
   * @param aRect is the rectangle that will be checked for visiblity
   * @result If true, that rectanglular area is visable.
   */
  NS_IMETHOD IsVisibleRect(const nsRect& aRect, PRBool &aIsVisible) = 0;

  /**
   * Sets the clipping for the RenderingContext to the passed in rectangle.
   * The rectangle is in app units!
   * @param aRect The rectangle to set the clipping rectangle to
   * @param aCombine how to combine this rect with the current clip region.
   *        see the bottom of nsIRenderingContext.h
   */
  NS_IMETHOD SetClipRect(const nsRect& aRect, nsClipCombine aCombine) = 0;

  /**
   * Gets the bounds of the clip region of the RenderingContext. The bounds are returned
   * in device units!
   * @param aRect out parameter to contain the clip region bounds
   *        for the RenderingContext
   * @return PR_TRUE if the rendering context has a local cliprect set
   *         else aRect is undefined
   */
  NS_IMETHOD GetClipRect(nsRect &aRect, PRBool &aHasLocalClip) = 0;

  /**
   * Sets the line style for the RenderingContext 
   * @param aLineStyle The line style
   * @return NS_OK if the line style is correctly set
   */
  NS_IMETHOD SetLineStyle(nsLineStyle aLineStyle) = 0;

  /**
   * Gets the line style for the RenderingContext
   * @param aLineStyle The line style to be retrieved
   * @return NS_OK if the line style is correctly retrieved
   */
  NS_IMETHOD GetLineStyle(nsLineStyle &aLineStyle) = 0;

  /**
   * Gets the Pen Mode for the RenderingContext
   * @param aPenMode The Pen Mode to be retrieved
   * @return NS_OK if the Pen Mode is correctly retrieved
   */
  NS_IMETHOD GetPenMode(nsPenMode &aPenMode) =0;

  /**
   * Sets the Pen Mode for the RenderingContext 
   * @param aPenMode The Pen Mode
   * @return NS_OK if the Pen Mode is correctly set
   */
  NS_IMETHOD SetPenMode(nsPenMode aPenMode) =0;


  /**
   * Sets the clipping for the RenderingContext to the passed in region.
   * The region is in device coordinates!
   * @param aRegion The region to set the clipping area to, IN DEVICE COORDINATES
   * @param aCombine how to combine this region with the current clip region.
   *        see the bottom of nsIRenderingContext.h
   */
  NS_IMETHOD SetClipRegion(const nsIRegion& aRegion, nsClipCombine aCombine) = 0;

  /**
   * Gets a copy of the current clipping region for the RenderingContext
   * The region is in device coordinates!
   * @param aRegion inout parameter representing the clip region.
   *        if SetClipRegion() is called, do not assume that GetClipRegion()
   *        will return the same object.
   */
  NS_IMETHOD CopyClipRegion(nsIRegion &aRegion) = 0;

  /**
   * Gets the current clipping region for the RenderingContext
   * The region is in device coordinates!
   * @param aRegion out parameter representing the clip region.
   *        if SetClipRegion() is called, do not assume that GetClipRegion()
   *        will return the same object.
   */
  NS_IMETHOD GetClipRegion(nsIRegion **aRegion) = 0;

  /**
   * Sets the forground color for the RenderingContext
   * @param aColor The color to set the RenderingContext to
   */
  NS_IMETHOD SetColor(nscolor aColor) = 0;

  /**
   * Get the forground color for the RenderingContext
   * @return The current forground color of the RenderingContext
   */
  NS_IMETHOD GetColor(nscolor &aColor) const = 0;

  /**
   * Sets the font for the RenderingContext
   * @param aFont The font to use in the RenderingContext
   */
  NS_IMETHOD SetFont(const nsFont& aFont, nsIAtom* aLangGroup) = 0;

  /**
   * Sets the font for the RenderingContext
   * @param aFontMetric The font metrics representing the
   *        font to use in the RenderingContext
   */
  NS_IMETHOD SetFont(nsIFontMetrics *aFontMetrics) = 0;

  /**
   * Get the current fontmetrics for the RenderingContext
   * @return The current font of the RenderingContext
   */
  NS_IMETHOD GetFontMetrics(nsIFontMetrics *&aFontMetrics) = 0;

  /**
   *  Add in a translate to the RenderingContext's transformation matrix
   * @param aX The horizontal translation
   * @param aY The vertical translation
   */
  NS_IMETHOD Translate(nscoord aX, nscoord aY) = 0;

  /**
   *  Add in a scale to the RenderingContext's transformation matrix
   * @param aX The horizontal scale
   * @param aY The vertical scale
   */
  NS_IMETHOD Scale(float aSx, float aSy) = 0;

  struct PushedTranslation {
    float mSavedX, mSavedY;
  };

  class AutoPushTranslation {
    nsIRenderingContext* mCtx;
    PushedTranslation mPushed;
  public:
    AutoPushTranslation(nsIRenderingContext* aCtx, nscoord aX, nscoord aY)
      : mCtx(aCtx) {
      mCtx->PushTranslation(&mPushed);
      mCtx->Translate(aX, aY);
    }
    ~AutoPushTranslation() {
      mCtx->PopTranslation(&mPushed);
    }
  };

  NS_IMETHOD PushTranslation(PushedTranslation* aState) = 0;

  NS_IMETHOD PopTranslation(PushedTranslation* aState) = 0;

  /** 
   * Get the current transformation matrix for the RenderingContext
   * @return The transformation matrix for the RenderingContext
   */
  NS_IMETHOD GetCurrentTransform(nsTransform2D *&aTransform) = 0;

  /**
   * Create an offscreen drawing surface compatible with this RenderingContext.
   * The rect passed in is not affected by any transforms in the rendering
   * context and the values are in device units.
   * @param aBounds A rectangle representing the size for the drawing surface.
   *                if nsnull then a bitmap will not be created and associated
   *                with the new drawing surface
   * @param aSurfFlags see bottom of nsIRenderingContext.h
   * @return A nsIDrawingSurface*
   */
  NS_IMETHOD CreateDrawingSurface(const nsRect& aBounds, PRUint32 aSurfFlags, nsIDrawingSurface* &aSurface) = 0;

  /**
   * Destroy a drawing surface created by CreateDrawingSurface()
   * @param aDS A drawing surface to destroy
   */
  NS_IMETHOD DestroyDrawingSurface(nsIDrawingSurface* aDS) = 0;

  /**
   * Draw a line
   * @param aXO starting horiztonal coord in twips
   * @param aY0 starting vertical coord in twips
   * @param aX1 end horiztonal coord in twips
   * @param aY1 end vertical coord in twips
   */
  NS_IMETHOD DrawLine(nscoord aX0, nscoord aY0, nscoord aX1, nscoord aY1) = 0;

  /**
   * Draw a polyline
   * @param aPoints array of endpoints
   * @param aNumPonts number of points
   */
  NS_IMETHOD DrawPolyline(const nsPoint aPoints[], PRInt32 aNumPoints) = 0;

  /**
   * Draw a rectangle
   * @param aRect The rectangle to draw
   */
  NS_IMETHOD DrawRect(const nsRect& aRect) = 0;

  /**
   * Draw a rectangle
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of rectangle in twips
   * @param aHeight Height of rectangle in twips
   */
  NS_IMETHOD DrawRect(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;

  /**
   * Fill a rectangle in the current foreground color
   * @param aRect The rectangle to draw
   */
  NS_IMETHOD FillRect(const nsRect& aRect) = 0;

  /**
   * Fill a rectangle in the current foreground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of rectangle in twips
   * @param aHeight Height of rectangle in twips
   */
  NS_IMETHOD FillRect(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;

  /**
   * XOR Invert a rectangle in the current foreground color
   * @param aRect The rectangle to draw
   */
  NS_IMETHOD InvertRect(const nsRect& aRect) = 0;

  /**
   * XOR Invert a rectangle in the current foreground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of rectangle in twips
   * @param aHeight Height of rectangle in twips
   */
  NS_IMETHOD InvertRect(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;

  /**
   * For platforms (e.g., Cocoa) that implicitly double buffer, this call can be used
   * to force a buffer flush following the painting of a rectangle.  This
   * call needs to be used any time drawing of rects is being done "on the fly",
   * outside of the normal painting process.
   * Examples include the blinking caret and tabbing through subimages in an
   * image map.
   */
  NS_IMETHOD FlushRect(const nsRect& aRect) = 0;
  NS_IMETHOD FlushRect(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;
  
  /**
   * Draw a poly in the current foreground color
   * @param aPoints points to use for the drawing, last must equal first
   * @param aNumPonts number of points in the polygon
   */
  NS_IMETHOD DrawPolygon(const nsPoint aPoints[], PRInt32 aNumPoints) = 0;

  /**
   * Fill a poly in the current foreground color
   * @param aPoints points to use for the drawing, last must equal first
   * @param aNumPonts number of points in the polygon
   */
  NS_IMETHOD FillPolygon(const nsPoint aPoints[], PRInt32 aNumPoints) = 0;

  /**
   * Draw an ellipse in the current foreground color
   * @param aRect The rectangle define bounds of ellipse to draw
   */
  NS_IMETHOD DrawEllipse(const nsRect& aRect) = 0;

  /**
   * Draw an ellipse in the current foreground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of horizontal axis in twips
   * @param aHeight Height of vertical axis in twips
   */
  NS_IMETHOD DrawEllipse(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;

  /**
   * Fill an ellipse in the current foreground color
   * @param aRect The rectangle define bounds of ellipse to draw
   */
  NS_IMETHOD FillEllipse(const nsRect& aRect) = 0;

  /**
   * Fill an ellipse in the current foreground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of horizontal axis in twips
   * @param aHeight Height of vertical axis in twips
   */
  NS_IMETHOD FillEllipse(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight) = 0;

  /**
   * Draw an arc in the current forground color
   * @param aRect The rectangle define bounds of ellipse to use
   * @param aStartAngle the starting angle of the arc, in degrees
   * @param aEndAngle The ending angle of the arc, in degrees
   */
  NS_IMETHOD DrawArc(const nsRect& aRect,
                     float aStartAngle, float aEndAngle) = 0;

  /**
   * Draw an arc in the current forground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of horizontal axis in twips
   * @param aHeight Height of vertical axis in twips
   * @param aStartAngle the starting angle of the arc, in degrees
   * @param aEndAngle The ending angle of the arc, in degrees
   */
  NS_IMETHOD DrawArc(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight,
                     float aStartAngle, float aEndAngle) = 0;

  /**
   * Fill an arc in the current forground color
   * @param aRect The rectangle define bounds of ellipse to use
   * @param aStartAngle the starting angle of the arc, in degrees
   * @param aEndAngle The ending angle of the arc, in degrees
   */
  NS_IMETHOD FillArc(const nsRect& aRect,
                     float aStartAngle, float aEndAngle) = 0;

  /**
   * Fill an arc in the current forground color
   * @param aX Horizontal left Coordinate in twips
   * @param aY Vertical top Coordinate in twips
   * @param aWidth Width of horizontal axis in twips
   * @param aHeight Height of vertical axis in twips
   * @param aStartAngle the starting angle of the arc, in degrees
   * @param aEndAngle The ending angle of the arc, in degrees
   */
  NS_IMETHOD FillArc(nscoord aX, nscoord aY, nscoord aWidth, nscoord aHeight,
                     float aStartAngle, float aEndAngle) = 0;

  /**
   * Returns the width (in app units) of an 8-bit character
   * If no font has been Set, the results are undefined.
   * @param aC character to measure
   * @param aWidth out parameter for width
   * @return error status
   */
  NS_IMETHOD GetWidth(char aC, nscoord &aWidth) = 0;

  /**
   * Returns the width (in app units) of a unicode character
   * If no font has been Set, the results are undefined.
   * @param aC character to measure
   * @param aWidth out parameter for width
   * @param aFontID an optional out parameter used to store a
   *        font identifier that can be passed into the DrawString()
   *        methods to speed rendering
   * @return error status
   */
  NS_IMETHOD GetWidth(PRUnichar aC, nscoord &aWidth,
                      PRInt32 *aFontID = nsnull) = 0;

  /**
   * Returns the width (in app units) of an nsString
   * If no font has been Set, the results are undefined.
   * @param aString string to measure
   * @param aWidth out parameter for width
   * @param aFontID an optional out parameter used to store a
   *        font identifier that can be passed into the DrawString()
   *        methods to speed rendering
   * @return error status
   */
  NS_IMETHOD GetWidth(const nsString& aString, nscoord &aWidth,
                      PRInt32 *aFontID = nsnull) = 0;

  /**
   * Returns the width (in app units) of an 8-bit character string
   * If no font has been Set, the results are undefined.
   * @param aString string to measure
   * @param aWidth out parameter for width
   * @return error status
   */
  NS_IMETHOD GetWidth(const char* aString, nscoord& aWidth) = 0;

  /**
   * Returns the width (in app units) of an 8-bit character string
   * If no font has been Set, the results are undefined.
   * @param aString string to measure
   * @param aLength number of characters in string
   * @param aWidth out parameter for width
   * @return error status
   */
  NS_IMETHOD GetWidth(const char* aString, PRUint32 aLength,
                      nscoord& aWidth) = 0;

  /**
   * Returns the width (in app units) of a Unicode character string
   * If no font has been Set, the results are undefined.
   * @param aString string to measure
   * @param aLength number of characters in string
   * @param aWidth out parameter for width
   * @param aFontID an optional out parameter used to store a
   *        font identifier that can be passed into the DrawString()
   *        methods to speed rendering
   * @return error status
   */
  NS_IMETHOD GetWidth(const PRUnichar *aString, PRUint32 aLength,
                      nscoord &aWidth, PRInt32 *aFontID = nsnull) = 0;

  /**
   * Returns the dimensions of a string, i.e., the overall extent of a string
   * whose rendering may involve switching between different fonts that have
   * different metrics.
   * @param aString string to measure
   * @param aLength number of characters in string
   * @param aFontID an optional out parameter used to store a
   *        font identifier that can be passed into the DrawString()
   *        methods to speed measurements
   * @return aDimensions struct that contains the extent of the string (see below)
   */
  NS_IMETHOD GetTextDimensions(const char* aString, PRUint32 aLength,
                               nsTextDimensions& aDimensions) = 0;
  NS_IMETHOD GetTextDimensions(const PRUnichar* aString, PRUint32 aLength,
                               nsTextDimensions& aDimensions, PRInt32* aFontID = nsnull) = 0;

#if defined(_WIN32) || defined(XP_OS2) || defined(MOZ_X11) || defined(XP_BEOS)
  /**
   * Given an available width and an array of break points,
   * returns the dimensions (in app units) of the text that fit and
   * the number of characters that fit. The number of characters
   * corresponds to an entry in the break array.
   * If no font has been set, the results are undefined.
   * @param aString, string to measure
   * @param aLength, number of characters in string
   * @param aAvailWidth, the available space in which the text must fit
   * @param aBreaks, array of places to break. Specified as offsets from the
   *          start of the string
   * @param aNumBreaks, the number of entries in the break array. The last
   *          entry in the break array must equal the length of the string
   * @param aDimensions, out parameter for the dimensions, the ascent and descent
   *           of the last word are left out to allow possible line-breaking before
   *           the last word. However, the width of the last word is included.
   * @param aNumCharsFit, the number of characters that fit in the available space
   * @param aLastWordDimensions, dimensions of the last word, the width field,
   *             dimensions.width, should be -1 for an unknown width. But the 
   *             ascent and descent are expected to be known.
   * @param aFontID, an optional out parameter used to store a
   *        font identifier that can be passed into the DrawString()
   *        methods to speed rendering
   * @return error status
   */
  NS_IMETHOD GetTextDimensions(const char*       aString,
                               PRInt32           aLength,
                               PRInt32           aAvailWidth,
                               PRInt32*          aBreaks,
                               PRInt32           aNumBreaks,
                               nsTextDimensions& aDimensions,
                               PRInt32&          aNumCharsFit,
                               nsTextDimensions& aLastWordDimensions,
                               PRInt32*          aFontID = nsnull) = 0;

  NS_IMETHOD GetTextDimensions(const PRUnichar*  aString,
                               PRInt32           aLength,
                               PRInt32           aAvailWidth,
                               PRInt32*          aBreaks,
                               PRInt32           aNumBreaks,
                               nsTextDimensions& aDimensions,
                               PRInt32&          aNumCharsFit,
                               nsTextDimensions& aLastWordDimensions,
                               PRInt32*          aFontID = nsnull) = 0;
#endif

  /**
   * Draw a string in the RenderingContext
   * @param aString The string to draw
   * @param aLength The length of the aString
   * @param aX Horizontal starting point of baseline
   * @param aY Vertical starting point of baseline.
   * @param aSpacing inter-character spacing to apply
   */
  NS_IMETHOD DrawString(const char *aString, PRUint32 aLength,
                        nscoord aX, nscoord aY,
                        const nscoord* aSpacing = nsnull) = 0;

  /**
   * Draw a string in the RenderingContext
   * @param aString A PRUnichar of the string
   * @param aLength The length of the aString
   * @param aX Horizontal starting point of baseline
   * @param aY Vertical starting point of baseline.
   * @param aFontID an optional parameter used to speed font
   *        selection for complex unicode strings. the value
   *        passed is returned by the DrawString() methods.
   * @param aSpacing inter-character spacing to apply
   */
  NS_IMETHOD DrawString(const PRUnichar *aString, PRUint32 aLength,
                        nscoord aX, nscoord aY,
                        PRInt32 aFontID = -1,
                        const nscoord* aSpacing = nsnull) = 0;

  /**
   * Draw a string in the RenderingContext
   * @param aString A nsString of the string
   * @param aX Horizontal starting point of baseline
   * @param aY Vertical starting point of baseline.
   * @param aFontID an optional parameter used to speed font
   *        selection for complex unicode strings. the value
   *        passed is returned by the DrawString() methods.
   * @param aSpacing inter-character spacing to apply
   */
  NS_IMETHOD DrawString(const nsString& aString, nscoord aX, nscoord aY,
                        PRInt32 aFontID = -1,
                        const nscoord* aSpacing = nsnull) = 0;

  /**
   * Copy offscreen pixelmap to this RenderingContext.
   * @param aSrcSurf drawing surface to copy bits from
   * @param aSrcX x offset into source pixelmap to copy from
   * @param aSrcY y offset into source pixelmap to copy from
   * @param aDestBounds Destination rectangle to copy to
   * @param aCopyFlags see below
   */
  NS_IMETHOD CopyOffScreenBits(nsIDrawingSurface* aSrcSurf, PRInt32 aSrcX, PRInt32 aSrcY,
                               const nsRect &aDestBounds, PRUint32 aCopyFlags) = 0;
  //~~~
  NS_IMETHOD RetrieveCurrentNativeGraphicData(void** ngd) = 0;


  /**
   * Get a drawing surface used as a backbuffer.
   * Depending on the platform this will either cause a backbuffer surface to be allocated
   * or an existing cached backbuffer will be returned. If the backbuffer is being cached
   * asking for aMaxSize which is different from a previous request may cause the platform
   * to dump it's cached backbuffer and reallocate a backbuffer of a size which will allow aMaxSize 
   * buffer to be allocated.
   *
   * @param aRequestedSize size of the backbuffer area requested
   * @param aMaxSize maximum size that may be requested for the backbuffer
   * @param aForBlending parameter telling if the buffer will be used for blending
   * @param aBackbuffer drawing surface used as the backbuffer
   */
  NS_IMETHOD GetBackbuffer(const nsRect &aRequestedSize, const nsRect &aMaxSize, PRBool aForBlending, nsIDrawingSurface* &aBackbuffer) = 0;

  /**
   * Release a drawing surface used as the backbuffer
   * If the platform caches the backbuffer this call will destroy it.
   */
  NS_IMETHOD ReleaseBackbuffer(void) = 0;

  /**
   * Destroy the drawing surface used as the backbuffer. If the platform
   * does not maintain a cached backbuffer this call will do nothing.
   */
  NS_IMETHOD DestroyCachedBackbuffer(void) = 0;

  /**
   * Some platforms may not want a backbuffer at all. Returning false
   * here allows them to achieve that
   *
   * @param aUseBackbuffer PR_TRUE if we should use a backbuffer, PR_FALSE if not
   */
  NS_IMETHOD UseBackbuffer(PRBool* aUseBackbuffer) = 0;


#ifdef MOZ_MATHML
  /**
   * Returns bounding metrics (in app units) of an 8-bit character string
   * @param aString string to measure
   * @param aLength number of characters in string
   * @return aBoundingMetrics struct that contains various metrics (see below)
   * @return error status
   */
  NS_IMETHOD
  GetBoundingMetrics(const char*        aString,
                     PRUint32           aLength,
                     nsBoundingMetrics& aBoundingMetrics) = 0;
  /**
   * Returns bounding metrics (in app units) of an Unicode character string
   * @param aString string to measure
   * @param aLength number of characters in string
   * @param aFontID an optional out parameter used to store a
   *        font identifier that can be passed into the GetBoundingMetrics()
   *        methods to speed measurements
   * @return aBoundingMetrics struct that contains various metrics (see below)
   * @return error status
   */
  NS_IMETHOD
  GetBoundingMetrics(const PRUnichar*   aString,
                     PRUint32           aLength,
                     nsBoundingMetrics& aBoundingMetrics,
                     PRInt32*           aFontID = nsnull) = 0;
#endif


  /**
   * Let the device context know whether we want text reordered with
   * right-to-left base direction
   */
  NS_IMETHOD SetRightToLeftText(PRBool aIsRTL) = 0;

  /**
   *  Draw a portion of an image, scaling it to fit within a specified rect.
   *  @param aImage     The image to draw
   *  @param aSrcRect   The rect (in twips) of the image to draw.
   *                    [x,y] denotes the top left corner of the region.
   *  @param aDestRect  The device context rect (in twips) that the image
   *                    portion should occupy. [x,y] denotes the top left corner.
   *                    [height,width] denotes the desired image size.
   */
  NS_IMETHOD DrawImage(imgIContainer *aImage, const nsRect & aSrcRect, const nsRect & aDestRect) = 0;

  /*
   * Tiles an image over an area
   * @param aImage       Image to tile
   * @param aXImageStart x location where the origin (0,0) of the image starts
   * @param aYImageStart y location where the origin (0,0) of the image starts
   * @param aTargetRect  area to draw to
   */
  NS_IMETHOD DrawTile(imgIContainer *aImage,
                      nscoord aXImageStart, nscoord aYImageStart,
                      const nsRect * aTargetRect) = 0;


  /**
   * Get cluster details for a chunk of text.
   *
   * This will fill in the aClusterStarts array with information about
   * what characters are the start of clusters for display.  The
   * information is just a bitfield that is set to 1 if the character
   * is the start of a cluster.  aClusterStarts must already be
   * allocated to at least aLength items in length.  Array index zero
   * being set to one indicates that the first character is the
   * beginning of a cluster.
   *
   * @param aText Text on which to get details.
   * @param aLength Length of the text.
   * @param aClusterStarts Array of ints that will be populated
   *        with information about which characters are the starts
   *        of clusters.
   *
   */
  NS_IMETHOD GetClusterInfo(const PRUnichar *aText,
                            PRUint32 aLength,
                            PRUint8 *aClusterStarts) = 0;

  /**
   * Find the closest cursor position for a given x coordinate.
   *
   * This will find the closest byte index for a given x coordinate.
   * This takes into account grapheme clusters and bidi text.
   *
   * @param aText Text on which to operate.
   * @param aLength Length of the text.
   * @param aPt the x/y position in the string to check.
   *
   * @return Index where the cursor falls.  If the return is zero,
   *   it's before the first character, if it falls off the end of
   *   the string it's the length of the string + 1.
   *
   */
  virtual PRInt32 GetPosition(const PRUnichar *aText,
                              PRUint32 aLength,
                              nsPoint aPt) = 0;

  /**
   * Get the width for the specific range of a given string.
   *
   * This function is similar to other GetWidth functions, except that
   * it gets the width for a part of the string instead of the entire
   * string.  This is useful when you're interested in finding out the
   * length of a chunk in the middle of the string.  Lots of languages
   * require you to include surrounding information to accurately
   * determine the length of a substring.
   *
   * @param aText Text on which to operate
   * @param aLength Length of the text
   * @param aStart Start index into the string
   * @param aEnd End index into the string (inclusive)
   * @param aWidth Returned with in app coordinates
   *
   */
  NS_IMETHOD GetRangeWidth(const PRUnichar *aText,
                           PRUint32 aLength,
                           PRUint32 aStart,
                           PRUint32 aEnd,
                           PRUint32 &aWidth) = 0;

  /**
   * Get the width for the specific range of a given string.
   *
   * Same as GetRangeWidth for PRUnichar, but takes a char * as the
   * text argument.
   *
   */
  NS_IMETHOD GetRangeWidth(const char *aText,
                           PRUint32 aLength,
                           PRUint32 aStart,
                           PRUint32 aEnd,
                           PRUint32 &aWidth) = 0;

  /**
   * Render an encapsulated postscript object onto the current rendering
   * surface.
   *
   * The EPS object must conform to the EPSF standard. See Adobe
   * specification #5002, "Encapsulated PostScript File Format Specification"
   * at <http://partners.adobe.com/asn/developer/pdfs/tn/5002.EPSF_Spec.pdf>.
   * In particular, the EPS object must contain a BoundingBox comment.
   *
   * @param aRect  Rectangle in which to render the EPSF.
   * @param aDataFile - plugin data stored in a file
   * @return NS_OK for success, or a suitable error value.
   *         NS_ERROR_NOT_IMPLEMENTED is returned if the rendering context
   *         doesn't support rendering EPSF, 
   */
  NS_IMETHOD RenderEPS(const nsRect& aRect, FILE *aDataFile) = 0;
};

//modifiers for text rendering

#define NS_DRAWSTRING_NORMAL            0x0
#define NS_DRAWSTRING_UNDERLINE         0x1
#define NS_DRAWSTRING_OVERLINE          0x2
#define NS_DRAWSTRING_LINE_THROUGH      0x4

// Bit values for GetHints

/**
 * This bit, when set, indicates that the underlying rendering system
 * prefers 8 bit text rendering over PRUnichar text rendering. When this
 * bit is <b>not</b> set the opposite is true: the system prefers PRUnichar
 * rendering, not 8 bit rendering.
 */
#define NS_RENDERING_HINT_FAST_8BIT_TEXT   0x1

/**
 * This bit, when set, indicates that the rendering is being done
 * remotely.
 */
#define NS_RENDERING_HINT_REMOTE_RENDERING 0x2

/**
 * This bit, when set, indicates that the system provides support for
 * the reordering of bidirectional text
 */
#define NS_RENDERING_HINT_BIDI_REORDERING 0x4

/**
 * This bit, when set, indicates that the system provides support for
 * Arabic shaping
 */
#define NS_RENDERING_HINT_ARABIC_SHAPING 0x8

/**
 * This bit, when set, indicates that gfx supports GetTextDimensions()
 */
#define NS_RENDERING_HINT_FAST_MEASURE 0x10

/**
 * This bit, when set, indicates that the gfx supports describing
 * cluster information in a string
 */
#define NS_RENDERING_HINT_TEXT_CLUSTERS 0x20

/**
 * This bit, when set, indicates that gfx performs glyph reordering of complex
 * text after applying character or word spacing, and so expects to be passed
 * text in logical order. When this bit is not set, gfx must be passed text in
 * visual order if characters and word spacing are to be applied.
 */
#define NS_RENDERING_HINT_REORDER_SPACED_TEXT 0x40

//flags for copy CopyOffScreenBits

//when performing the blit, use the region, if any,
//that exists in the source drawingsurface as a
//blit mask.
#define NS_COPYBITS_USE_SOURCE_CLIP_REGION  0x0001

//transform the source offsets by the xform in the
//rendering context
#define NS_COPYBITS_XFORM_SOURCE_VALUES     0x0002

//transform the destination rect by the xform in the
//rendering context
#define NS_COPYBITS_XFORM_DEST_VALUES       0x0004

//this is basically a hack and is used by callers
//who have selected an alternate drawing surface and
//wish the copy to happen to that buffer rather than
//the "front" buffer. i'm not proud of this. MMP
//XXX: This is no longer needed by the XPCODE. It will
//be removed once all of the platform specific nsRenderingContext's
//stop using it.
#define NS_COPYBITS_TO_BACK_BUFFER          0x0008

/* Struct used to represent the overall extent of a string
   whose rendering may involve switching between different
   fonts that have different metrics.
*/
struct nsTextDimensions {
  // max ascent amongst all the fonts needed to represent the string
  nscoord ascent;

  // max descent amongst all the fonts needed to represent the string
  nscoord descent;

  // width of the string
  nscoord width;


  nsTextDimensions()
  {
    Clear();
  }

  /* Set all member data to zero */
  void 
  Clear() {
    ascent = descent = width = 0;
  }

  /* Sum with another dimension */
  void 
  Combine(const nsTextDimensions& aOther) {
    if (ascent < aOther.ascent) ascent = aOther.ascent;
    if (descent < aOther.descent) descent = aOther.descent;   
    width += aOther.width;
  }
};

#ifdef MOZ_MATHML
/* Struct used for accurate measurements of a string in order
   to allow precise positioning when processing MathML.
*/
struct nsBoundingMetrics {

  ///////////
  // Metrics that _exactly_ enclose the text:

  // The character coordinate system is the one used on X Windows:
  // 1. The origin is located at the intersection of the baseline
  //    with the left of the character's cell.
  // 2. All horizontal bearings are oriented from left to right.
  // 3. The ascent is oriented from bottom to top (being 0 at the orgin).
  // 4. The descent is oriented from top to bottom (being 0 at the origin).

  // Note that Win32/Mac/PostScript use a different convention for
  // the descent (all vertical measurements are oriented from bottom
  // to top on these palatforms). Make sure to flip the sign of the
  // descent on these platforms for cross-platform compatibility.

  // Any of the following member variables listed here can have 
  // positive or negative value.

  nscoord leftBearing;
       /* The horizontal distance from the origin of the drawing
          operation to the left-most part of the drawn string. */

  nscoord rightBearing;
       /* The horizontal distance from the origin of the drawing
          operation to the right-most part of the drawn string.
          The _exact_ width of the string is therefore:
          rightBearing - leftBearing */
  
  nscoord ascent;
       /* The vertical distance from the origin of the drawing 
          operation to the top-most part of the drawn string. */

  nscoord descent;
       /* The vertical distance from the origin of the drawing 
          operation to the bottom-most part of the drawn string.
          The _exact_ height of the string is therefore:
          ascent + descent */

  //////////
  // Metrics for placing other surrounding text:

  nscoord width;
       /* The horizontal distance from the origin of the drawing
          operation to the correct origin for drawing another string
          to follow the current one. Depending on the font, this
          could be greater than or less than the right bearing. */

  nsBoundingMetrics() {
    Clear();
  }

  //////////
  // Utility methods and operators:

  /* Set all member data to zero */
  void 
  Clear() {
    leftBearing = rightBearing = 0;
    ascent = descent = width = 0;
  }

  /* Append another bounding metrics */
  /* Notice that leftBearing is not set. The user must set leftBearing on 
     initialization and (repeatedly) use this operator to append 
     other bounding metrics on the right.
   */
  void 
  operator += (const nsBoundingMetrics& bm) {
    if (ascent < bm.ascent) ascent = bm.ascent;
    if (descent < bm.descent) descent = bm.descent;   
    rightBearing = PR_MAX(rightBearing, width + bm.rightBearing);
    width += bm.width;
  }
};
#endif // MOZ_MATHML

#endif /* nsIRenderingContext_h___ */
