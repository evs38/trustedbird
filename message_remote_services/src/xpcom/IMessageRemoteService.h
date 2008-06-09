/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM ../src/xpcom/IMessageRemoteService.idl
 */

#ifndef __gen_IMessageRemoteService_h__
#define __gen_IMessageRemoteService_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    IMessageRemoteService */
#define IMESSAGEREMOTESERVICE_IID_STR "f9b41dae-2b80-47ac-bfbc-feead1aaef5b"

#define IMESSAGEREMOTESERVICE_IID \
  {0xf9b41dae, 0x2b80, 0x47ac, \
    { 0xbf, 0xbc, 0xfe, 0xea, 0xd1, 0xaa, 0xef, 0x5b }}

class NS_NO_VTABLE IMessageRemoteService : public nsISupports {
 public: 

  NS_DEFINE_STATIC_IID_ACCESSOR(IMESSAGEREMOTESERVICE_IID)

  /* void Start (); */
  NS_IMETHOD Start(void) = 0;

  /* void Stop (); */
  NS_IMETHOD Stop(void) = 0;

  /* boolean IsStarted (); */
  NS_IMETHOD IsStarted(PRBool *_retval) = 0;

};

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IMESSAGEREMOTESERVICE \
  NS_IMETHOD Start(void); \
  NS_IMETHOD Stop(void); \
  NS_IMETHOD IsStarted(PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IMESSAGEREMOTESERVICE(_to) \
  NS_IMETHOD Start(void) { return _to Start(); } \
  NS_IMETHOD Stop(void) { return _to Stop(); } \
  NS_IMETHOD IsStarted(PRBool *_retval) { return _to IsStarted(_retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IMESSAGEREMOTESERVICE(_to) \
  NS_IMETHOD Start(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Start(); } \
  NS_IMETHOD Stop(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Stop(); } \
  NS_IMETHOD IsStarted(PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->IsStarted(_retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IMessageRemoteService
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IMESSAGEREMOTESERVICE

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IMessageRemoteService)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void Start (); */
NS_IMETHODIMP _MYCLASS_::Start()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void Stop (); */
NS_IMETHODIMP _MYCLASS_::Stop()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* boolean IsStarted (); */
NS_IMETHODIMP _MYCLASS_::IsStarted(PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IMessageRemoteService_h__ */
