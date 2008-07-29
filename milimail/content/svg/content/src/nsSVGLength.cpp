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
 * The Original Code is the Mozilla SVG project.
 *
 * The Initial Developer of the Original Code is
 * Crocodile Clips Ltd..
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Alex Fritze <alex.fritze@crocodile-clips.com> (original author)
 *   Jonathan Watt <jonathan.watt@strath.ac.uk>
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

#include "nsSVGLength.h"
#include "nsIDOMSVGMatrix.h"
#include "nsSVGAtoms.h"
#include "nsSVGValue.h"
#include "nsTextFormatter.h"
#include "prdtoa.h"
#include "nsCRT.h"
#include "nsSVGCoordCtx.h"
#include "nsIDOMSVGNumber.h"
#include "nsISVGValueUtils.h"
#include "nsWeakReference.h"
#include "nsContentUtils.h"

////////////////////////////////////////////////////////////////////////
// nsSVGLength class

class nsSVGLength : public nsISVGLength,
                    public nsSVGValue,
                    public nsISVGValueObserver,
                    public nsSupportsWeakReference
{
protected:
  friend nsresult NS_NewSVGLength(nsISVGLength** result,
                                  float value,
                                  PRUint16 unit);

  friend nsresult NS_NewSVGLength(nsISVGLength** result,
                                  const nsAString &value);
  
  nsSVGLength(float value, PRUint16 unit);
  nsSVGLength();
  virtual ~nsSVGLength();

public:
  // nsISupports interface:
  NS_DECL_ISUPPORTS

  // nsIDOMSVGLength interface:
  NS_DECL_NSIDOMSVGLENGTH

  // nsISVGLength interface:
  NS_IMETHOD SetContext(nsSVGCoordCtx* context);
  
  // nsISVGValue interface:
  NS_IMETHOD SetValueString(const nsAString& aValue);
  NS_IMETHOD GetValueString(nsAString& aValue);
  
  // nsISVGValueObserver interface:
  NS_IMETHOD WillModifySVGObservable(nsISVGValue* observable,
                                     modificationType aModType);
  NS_IMETHOD DidModifySVGObservable (nsISVGValue* observable,
                                     modificationType aModType);

  // nsISupportsWeakReference
  // implementation inherited from nsSupportsWeakReference
  
protected:
  // implementation helpers:
  float mmPerPixel();
  float AxisLength();
  PRBool IsValidUnitType(PRUint16 unit);
  void MaybeAddAsObserver();
  void MaybeRemoveAsObserver();
  
  float mValueInSpecifiedUnits;
  PRUint16 mSpecifiedUnitType;
  nsRefPtr<nsSVGCoordCtx> mContext;
};


//----------------------------------------------------------------------
// Implementation

nsresult
NS_NewSVGLength(nsISVGLength** result,
                float value,
                PRUint16 unit)
{
  *result = new nsSVGLength(value, unit);
  if (!*result)
    return NS_ERROR_OUT_OF_MEMORY;
  NS_ADDREF(*result);
  return NS_OK;
}

nsresult
NS_NewSVGLength(nsISVGLength** result,
                const nsAString &value)
{
  *result = nsnull;
  nsSVGLength *pl = new nsSVGLength();
  if (!pl)
    return NS_ERROR_OUT_OF_MEMORY;
  NS_ADDREF(pl);
  nsresult rv = pl->SetValueAsString(value);
  if (NS_FAILED(rv)) {
    NS_RELEASE(pl);
    return rv;
  }
  *result = pl;
  return NS_OK;
}  


nsSVGLength::nsSVGLength(float value,
                         PRUint16 unit)
    : mValueInSpecifiedUnits(value),
      mSpecifiedUnitType(unit)
{
  // we don't have a context yet, so we don't call MaybeAddAsObserver()
}

nsSVGLength::nsSVGLength()
{
}

nsSVGLength::~nsSVGLength()
{
  MaybeRemoveAsObserver();
}

//----------------------------------------------------------------------
// nsISupports methods:

NS_IMPL_ADDREF(nsSVGLength)
NS_IMPL_RELEASE(nsSVGLength)

NS_INTERFACE_MAP_BEGIN(nsSVGLength)
  NS_INTERFACE_MAP_ENTRY(nsISVGValue)
  NS_INTERFACE_MAP_ENTRY(nsISVGValueObserver)
  NS_INTERFACE_MAP_ENTRY(nsISVGLength)
  NS_INTERFACE_MAP_ENTRY(nsIDOMSVGLength)
  NS_INTERFACE_MAP_ENTRY(nsISupportsWeakReference)
  NS_INTERFACE_MAP_ENTRY_CONTENT_CLASSINFO(SVGLength)
  NS_INTERFACE_MAP_ENTRY_AMBIGUOUS(nsISupports, nsISVGValue)
NS_INTERFACE_MAP_END

//----------------------------------------------------------------------
// nsISVGValue methods:

NS_IMETHODIMP
nsSVGLength::SetValueString(const nsAString& aValue)
{
  return SetValueAsString(aValue);
}

NS_IMETHODIMP
nsSVGLength::GetValueString(nsAString& aValue)
{
  return GetValueAsString(aValue);
}

//----------------------------------------------------------------------
// nsISVGValueObserver methods

NS_IMETHODIMP
nsSVGLength::WillModifySVGObservable(nsISVGValue* observable,
                                     modificationType aModType)
{
  WillModify(aModType);
  return NS_OK;
}

NS_IMETHODIMP
nsSVGLength::DidModifySVGObservable(nsISVGValue* observable,
                                    modificationType aModType)
{
  DidModify(aModType);
  return NS_OK;
}

//----------------------------------------------------------------------
// nsIDOMSVGLength methods:

/* readonly attribute unsigned short unitType; */
NS_IMETHODIMP
nsSVGLength::GetUnitType(PRUint16 *aUnitType)
{
  *aUnitType = mSpecifiedUnitType;
  return NS_OK;
}

/* attribute float value; */
NS_IMETHODIMP
nsSVGLength::GetValue(float *aValue)
{
  switch (mSpecifiedUnitType) {
    case SVG_LENGTHTYPE_NUMBER:
    case SVG_LENGTHTYPE_PX:
      *aValue = mValueInSpecifiedUnits;
      break;
    case SVG_LENGTHTYPE_MM:
      *aValue = mValueInSpecifiedUnits / mmPerPixel();
      break;
    case SVG_LENGTHTYPE_CM:
      *aValue = mValueInSpecifiedUnits * 10.0f / mmPerPixel();
      break;
    case SVG_LENGTHTYPE_IN:
      *aValue = mValueInSpecifiedUnits * 25.4f / mmPerPixel();
      break;
    case SVG_LENGTHTYPE_PT:
      *aValue = mValueInSpecifiedUnits * 25.4f / 72.0f / mmPerPixel();
      break;
    case SVG_LENGTHTYPE_PC:
      *aValue = mValueInSpecifiedUnits * 25.4f * 12.0f / 72.0f / mmPerPixel();
      break;
    case SVG_LENGTHTYPE_PERCENTAGE:
      *aValue = mValueInSpecifiedUnits * AxisLength() / 100.0f;
      break;
    case SVG_LENGTHTYPE_EMS:
    case SVG_LENGTHTYPE_EXS:
      NS_NOTYETIMPLEMENTED("SVG_LENGTHTYPE_EXS");
      *aValue = 0;
      return NS_ERROR_NOT_IMPLEMENTED;
    default:
      NS_NOTREACHED("Unknown unit type");
      *aValue = 0;
      return NS_ERROR_UNEXPECTED;
  }
  return NS_OK;
}

NS_IMETHODIMP
nsSVGLength::SetValue(float aValue)
{
  nsresult rv = NS_OK;

  WillModify();

  switch (mSpecifiedUnitType) {
    case SVG_LENGTHTYPE_NUMBER:
    case SVG_LENGTHTYPE_PX:
      mValueInSpecifiedUnits = aValue;
      break;
    case SVG_LENGTHTYPE_MM:
      mValueInSpecifiedUnits = aValue * mmPerPixel();
      break;
    case SVG_LENGTHTYPE_CM:
      mValueInSpecifiedUnits = aValue * mmPerPixel() / 10.0f;
      break;
    case SVG_LENGTHTYPE_IN:
      mValueInSpecifiedUnits = aValue * mmPerPixel() / 25.4f;
      break;
    case SVG_LENGTHTYPE_PT:
      mValueInSpecifiedUnits = aValue * mmPerPixel() * 72.0f / 25.4f;
      break;
    case SVG_LENGTHTYPE_PC:
      mValueInSpecifiedUnits = aValue * mmPerPixel() * 72.0f / 24.4f / 12.0f;
      break;
    case SVG_LENGTHTYPE_PERCENTAGE:
      mValueInSpecifiedUnits = aValue * 100.0f / AxisLength();
      break;
    case SVG_LENGTHTYPE_EMS:
    case SVG_LENGTHTYPE_EXS:
      NS_NOTYETIMPLEMENTED("SVG_LENGTHTYPE_EXS");
      mValueInSpecifiedUnits = 0;
      rv = NS_ERROR_NOT_IMPLEMENTED;
      break;
    default:
      NS_NOTREACHED("Unknown unit type");
      mValueInSpecifiedUnits = 0;
      rv = NS_ERROR_UNEXPECTED;
      break;
  }

  DidModify();
  return rv;
}

/* attribute float valueInSpecifiedUnits; */
NS_IMETHODIMP
nsSVGLength::GetValueInSpecifiedUnits(float *aValueInSpecifiedUnits)
{
  *aValueInSpecifiedUnits = mValueInSpecifiedUnits;
  return NS_OK;
}
NS_IMETHODIMP
nsSVGLength::SetValueInSpecifiedUnits(float aValueInSpecifiedUnits)
{
  WillModify();
  mValueInSpecifiedUnits = aValueInSpecifiedUnits;
  DidModify();
  return NS_OK;
}

/* attribute DOMString valueAsString; */
NS_IMETHODIMP
nsSVGLength::GetValueAsString(nsAString & aValueAsString)
{
  PRUnichar buf[24];
  nsTextFormatter::snprintf(buf, sizeof(buf)/sizeof(PRUnichar),
                            NS_LITERAL_STRING("%g").get(),
                            (double)mValueInSpecifiedUnits);
  aValueAsString.Assign(buf);

  nsIAtom* UnitAtom = nsnull;

  switch (mSpecifiedUnitType) {
    case SVG_LENGTHTYPE_NUMBER:
      return NS_OK;
    case SVG_LENGTHTYPE_PX:
      UnitAtom = nsSVGAtoms::px;
      break;
    case SVG_LENGTHTYPE_MM:
      UnitAtom = nsSVGAtoms::mm;
      break;
    case SVG_LENGTHTYPE_CM:
      UnitAtom = nsSVGAtoms::cm;
      break;
    case SVG_LENGTHTYPE_IN:
      UnitAtom = nsSVGAtoms::in;
      break;
    case SVG_LENGTHTYPE_PT:
      UnitAtom = nsSVGAtoms::pt;
      break;
    case SVG_LENGTHTYPE_PC:
      UnitAtom = nsSVGAtoms::pc;
      break;
    case SVG_LENGTHTYPE_EMS:
      UnitAtom = nsSVGAtoms::ems;
      break;
    case SVG_LENGTHTYPE_EXS:
      UnitAtom = nsSVGAtoms::exs;
      break;
    case SVG_LENGTHTYPE_PERCENTAGE:
      UnitAtom = nsSVGAtoms::percentage;
      break;
    default:
      NS_NOTREACHED("Unknown unit");
      return NS_ERROR_UNEXPECTED;
  }

  nsAutoString unitString;
  UnitAtom->ToString(unitString);
  aValueAsString.Append(unitString);

  return NS_OK;
}

NS_IMETHODIMP
nsSVGLength::SetValueAsString(const nsAString & aValueAsString)
{
  nsresult rv = NS_OK;
  
  char *str = ToNewCString(aValueAsString);

  char* number = str;
  while (*number && isspace(*number))
    ++number;

  if (*number) {
    char *rest;
    double value = PR_strtod(number, &rest);
    if (rest!=number) {
      const char* unitStr = nsCRT::strtok(rest, "\x20\x9\xD\xA", &rest);
      PRUint16 unitType = SVG_LENGTHTYPE_UNKNOWN;
      if (!unitStr || *unitStr=='\0') {
        unitType = SVG_LENGTHTYPE_NUMBER;
      }
      else {
        nsCOMPtr<nsIAtom> unitAtom = do_GetAtom(unitStr);
        if (unitAtom == nsSVGAtoms::px)
          unitType = SVG_LENGTHTYPE_PX;
        else if (unitAtom == nsSVGAtoms::mm)
          unitType = SVG_LENGTHTYPE_MM;
        else if (unitAtom == nsSVGAtoms::cm)
          unitType = SVG_LENGTHTYPE_CM;
        else if (unitAtom == nsSVGAtoms::in)
          unitType = SVG_LENGTHTYPE_IN;
        else if (unitAtom == nsSVGAtoms::pt)
          unitType = SVG_LENGTHTYPE_PT;
        else if (unitAtom == nsSVGAtoms::pc)
          unitType = SVG_LENGTHTYPE_PC;
        else if (unitAtom == nsSVGAtoms::ems)
          unitType = SVG_LENGTHTYPE_EMS;
        else if (unitAtom == nsSVGAtoms::exs)
          unitType = SVG_LENGTHTYPE_EXS;
        else if (unitAtom == nsSVGAtoms::percentage)
          unitType = SVG_LENGTHTYPE_PERCENTAGE;
      }
      if (IsValidUnitType(unitType)){
        WillModify();
        mValueInSpecifiedUnits = (float)value;
        mSpecifiedUnitType     = unitType;
        DidModify();
      }
      else { // parse error
        // not a valid unit type
        rv = NS_ERROR_FAILURE;
        NS_ERROR("invalid length type");
      }
    }
    else { // parse error
      // no number
      rv = NS_ERROR_FAILURE;
    }
  }
  
  nsMemory::Free(str);
    
  return rv;
}

/* void newValueSpecifiedUnits (in unsigned short unitType, in float valueInSpecifiedUnits); */
NS_IMETHODIMP
nsSVGLength::NewValueSpecifiedUnits(PRUint16 unitType, float valueInSpecifiedUnits)
{
  if (!IsValidUnitType(unitType))
    return NS_ERROR_FAILURE;

  PRBool observer_change = (unitType != mSpecifiedUnitType);

  WillModify();
  if (observer_change)
    MaybeRemoveAsObserver();
  mValueInSpecifiedUnits = valueInSpecifiedUnits;
  mSpecifiedUnitType     = unitType;
  if (observer_change)
    MaybeAddAsObserver();
  DidModify();
  
  return NS_OK;
}

/* void convertToSpecifiedUnits (in unsigned short unitType); */
NS_IMETHODIMP
nsSVGLength::ConvertToSpecifiedUnits(PRUint16 unitType)
{
  if (!IsValidUnitType(unitType))
    return NS_ERROR_FAILURE;

  PRBool observer_change = (unitType != mSpecifiedUnitType);

  WillModify();
  if (observer_change)
    MaybeRemoveAsObserver();
  float valueInUserUnits;
  GetValue(&valueInUserUnits);
  mSpecifiedUnitType = unitType;
  SetValue(valueInUserUnits);
  if (observer_change)
    MaybeAddAsObserver();
  DidModify();
  
  return NS_OK;
}

/* float getTransformedValue (in nsIDOMSVGMatrix matrix); */
NS_IMETHODIMP
nsSVGLength::GetTransformedValue(nsIDOMSVGMatrix *matrix,
                                 float *_retval)
{
// XXX we don't have enough information here. is it the length part of
// a coordinate pair (in which case it should transform like a point)
// or is it used like a vector-component (in which case it doesn't
// translate)

  // maybe we should remove this method since it isn't part of the spec?
  // if not, null check when implementing - this method can be used by scripts!
  // if (!matrix)
  //   return NS_ERROR_DOM_SVG_WRONG_TYPE_ERR;

  NS_NOTYETIMPLEMENTED("nsSVGLength::GetTransformedValue");
  return NS_ERROR_NOT_IMPLEMENTED;
}


//----------------------------------------------------------------------
// nsISVGLength methods:
NS_IMETHODIMP
nsSVGLength::SetContext(nsSVGCoordCtx* context)
{
  /* Unless our unit type is SVG_LENGTHTYPE_NUMBER or SVG_LENGTHTYPE_PX, our
     user unit value is determined by our context and we must notify our
     observers that we have changed. */

  if (mSpecifiedUnitType != SVG_LENGTHTYPE_NUMBER &&
      mSpecifiedUnitType != SVG_LENGTHTYPE_PX) {
    WillModify(mod_context);
    MaybeRemoveAsObserver();
  }

  mContext = context;

  if (mSpecifiedUnitType != SVG_LENGTHTYPE_NUMBER &&
      mSpecifiedUnitType != SVG_LENGTHTYPE_PX) {
    MaybeAddAsObserver();
    DidModify(mod_context);
  }
  return NS_OK;
}


//----------------------------------------------------------------------
// Implementation helpers:

float nsSVGLength::mmPerPixel()
{
  if (!mContext) {
    NS_WARNING("no context in mmPerPixel()");
    return 1.0f;
  }
  
  float mmPerPx = mContext->GetMillimeterPerPixel();

  if (mmPerPx == 0.0f) {
    NS_ASSERTION(mmPerPx != 0.0f, "invalid mm/pixels");
    mmPerPx = 1e-4f; // some small value
  }
  
  return mmPerPx;
}

float nsSVGLength::AxisLength()
{
  if (!mContext) {
    NS_WARNING("no context in AxisLength()");
    return 1.0f;
  }

  nsCOMPtr<nsIDOMSVGNumber> num = mContext->GetLength();
  NS_ASSERTION(num != nsnull, "null interface");
  float d;
  num->GetValue(&d);

  if (d == 0.0f) {
    NS_WARNING("zero axis length");
    d = 1e-20f;
  }

  return d;
}

PRBool nsSVGLength::IsValidUnitType(PRUint16 unit)
{
  if (unit > SVG_LENGTHTYPE_UNKNOWN && unit <= SVG_LENGTHTYPE_PC)
    return PR_TRUE;

  return PR_FALSE;
}

void nsSVGLength::MaybeAddAsObserver()
{
  if ((mSpecifiedUnitType==SVG_LENGTHTYPE_PERCENTAGE) &&
      mContext) {
    nsCOMPtr<nsIDOMSVGNumber> num = mContext->GetLength();
    NS_ADD_SVGVALUE_OBSERVER(num);
  }
}

void nsSVGLength::MaybeRemoveAsObserver()
{
  if ((mSpecifiedUnitType==SVG_LENGTHTYPE_PERCENTAGE) &&
      mContext) {
    nsCOMPtr<nsIDOMSVGNumber> num = mContext->GetLength();
    NS_REMOVE_SVGVALUE_OBSERVER(num);
  }
}

