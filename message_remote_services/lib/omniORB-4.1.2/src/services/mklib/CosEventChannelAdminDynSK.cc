// This file is generated by omniidl (C++ backend) - omniORB_4_1. Do not edit.

#include "CosEventChannelAdmin.hh"

OMNI_USING_NAMESPACE(omni)

static const char* _0RL_dyn_library_version = omniORB_4_1_dyn;

static ::CORBA::TypeCode::_Tracker _0RL_tcTrack(__FILE__);


static CORBA::TypeCode_ptr _0RL_tc_CosEventChannelAdmin_mAlreadyConnected = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosEventChannelAdmin/AlreadyConnected:1.0", "AlreadyConnected", (CORBA::PR_structMember*) 0, 0, &_0RL_tcTrack);
#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_AlreadyConnected = _0RL_tc_CosEventChannelAdmin_mAlreadyConnected;
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_AlreadyConnected = _0RL_tc_CosEventChannelAdmin_mAlreadyConnected;
#endif



static CORBA::TypeCode_ptr _0RL_tc_CosEventChannelAdmin_mTypeError = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosEventChannelAdmin/TypeError:1.0", "TypeError", (CORBA::PR_structMember*) 0, 0, &_0RL_tcTrack);
#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_TypeError = _0RL_tc_CosEventChannelAdmin_mTypeError;
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_TypeError = _0RL_tc_CosEventChannelAdmin_mTypeError;
#endif


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_ProxyPushConsumer = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPushConsumer:1.0", "ProxyPushConsumer", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_ProxyPushConsumer = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPushConsumer:1.0", "ProxyPushConsumer", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_ProxyPullSupplier = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPullSupplier:1.0", "ProxyPullSupplier", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_ProxyPullSupplier = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPullSupplier:1.0", "ProxyPullSupplier", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_ProxyPullConsumer = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPullConsumer:1.0", "ProxyPullConsumer", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_ProxyPullConsumer = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPullConsumer:1.0", "ProxyPullConsumer", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_ProxyPushSupplier = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPushSupplier:1.0", "ProxyPushSupplier", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_ProxyPushSupplier = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ProxyPushSupplier:1.0", "ProxyPushSupplier", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_ConsumerAdmin = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ConsumerAdmin:1.0", "ConsumerAdmin", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_ConsumerAdmin = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/ConsumerAdmin:1.0", "ConsumerAdmin", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_SupplierAdmin = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/SupplierAdmin:1.0", "SupplierAdmin", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_SupplierAdmin = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/SupplierAdmin:1.0", "SupplierAdmin", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosEventChannelAdmin { 
  const ::CORBA::TypeCode_ptr _tc_EventChannel = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/EventChannel:1.0", "EventChannel", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosEventChannelAdmin::_tc_EventChannel = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosEventChannelAdmin/EventChannel:1.0", "EventChannel", &_0RL_tcTrack);
#endif


static void _0RL_CosEventChannelAdmin_mAlreadyConnected_marshal_fn(cdrStream& _s, void* _v)
{
  const CosEventChannelAdmin::AlreadyConnected* _p = (const CosEventChannelAdmin::AlreadyConnected*)_v;
  *_p >>= _s;
}
static void _0RL_CosEventChannelAdmin_mAlreadyConnected_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosEventChannelAdmin::AlreadyConnected* _p = new CosEventChannelAdmin::AlreadyConnected;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosEventChannelAdmin_mAlreadyConnected_destructor_fn(void* _v)
{
  CosEventChannelAdmin::AlreadyConnected* _p = (CosEventChannelAdmin::AlreadyConnected*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosEventChannelAdmin::AlreadyConnected& _s)
{
  CosEventChannelAdmin::AlreadyConnected* _p = new CosEventChannelAdmin::AlreadyConnected(_s);
  _a.PR_insert(_0RL_tc_CosEventChannelAdmin_mAlreadyConnected,
               _0RL_CosEventChannelAdmin_mAlreadyConnected_marshal_fn,
               _0RL_CosEventChannelAdmin_mAlreadyConnected_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosEventChannelAdmin::AlreadyConnected* _sp)
{
  _a.PR_insert(_0RL_tc_CosEventChannelAdmin_mAlreadyConnected,
               _0RL_CosEventChannelAdmin_mAlreadyConnected_marshal_fn,
               _0RL_CosEventChannelAdmin_mAlreadyConnected_destructor_fn,
               (CosEventChannelAdmin::AlreadyConnected*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosEventChannelAdmin::AlreadyConnected*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosEventChannelAdmin_mAlreadyConnected,
                    _0RL_CosEventChannelAdmin_mAlreadyConnected_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mAlreadyConnected_marshal_fn,
                    _0RL_CosEventChannelAdmin_mAlreadyConnected_destructor_fn,
                    _v)) {
    _sp = (const CosEventChannelAdmin::AlreadyConnected*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosEventChannelAdmin_mAlreadyConnected(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosEventChannelAdmin::AlreadyConnected & _ex = (const CosEventChannelAdmin::AlreadyConnected &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosEventChannelAdmin_mAlreadyConnected (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosEventChannelAdmin::AlreadyConnected* _ex = (const CosEventChannelAdmin::AlreadyConnected*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mAlreadyConnected {
public:
  _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mAlreadyConnected() {
    CosEventChannelAdmin::AlreadyConnected::insertToAnyFn = _0RL_insertToAny__cCosEventChannelAdmin_mAlreadyConnected;
    CosEventChannelAdmin::AlreadyConnected::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosEventChannelAdmin_mAlreadyConnected;
  }
};
static _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mAlreadyConnected _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mAlreadyConnected_;


static void _0RL_CosEventChannelAdmin_mTypeError_marshal_fn(cdrStream& _s, void* _v)
{
  const CosEventChannelAdmin::TypeError* _p = (const CosEventChannelAdmin::TypeError*)_v;
  *_p >>= _s;
}
static void _0RL_CosEventChannelAdmin_mTypeError_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosEventChannelAdmin::TypeError* _p = new CosEventChannelAdmin::TypeError;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosEventChannelAdmin_mTypeError_destructor_fn(void* _v)
{
  CosEventChannelAdmin::TypeError* _p = (CosEventChannelAdmin::TypeError*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosEventChannelAdmin::TypeError& _s)
{
  CosEventChannelAdmin::TypeError* _p = new CosEventChannelAdmin::TypeError(_s);
  _a.PR_insert(_0RL_tc_CosEventChannelAdmin_mTypeError,
               _0RL_CosEventChannelAdmin_mTypeError_marshal_fn,
               _0RL_CosEventChannelAdmin_mTypeError_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosEventChannelAdmin::TypeError* _sp)
{
  _a.PR_insert(_0RL_tc_CosEventChannelAdmin_mTypeError,
               _0RL_CosEventChannelAdmin_mTypeError_marshal_fn,
               _0RL_CosEventChannelAdmin_mTypeError_destructor_fn,
               (CosEventChannelAdmin::TypeError*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosEventChannelAdmin::TypeError*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosEventChannelAdmin_mTypeError,
                    _0RL_CosEventChannelAdmin_mTypeError_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mTypeError_marshal_fn,
                    _0RL_CosEventChannelAdmin_mTypeError_destructor_fn,
                    _v)) {
    _sp = (const CosEventChannelAdmin::TypeError*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosEventChannelAdmin_mTypeError(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosEventChannelAdmin::TypeError & _ex = (const CosEventChannelAdmin::TypeError &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosEventChannelAdmin_mTypeError (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosEventChannelAdmin::TypeError* _ex = (const CosEventChannelAdmin::TypeError*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mTypeError {
public:
  _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mTypeError() {
    CosEventChannelAdmin::TypeError::insertToAnyFn = _0RL_insertToAny__cCosEventChannelAdmin_mTypeError;
    CosEventChannelAdmin::TypeError::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosEventChannelAdmin_mTypeError;
  }
};
static _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mTypeError _0RL_insertToAny_Singleton__cCosEventChannelAdmin_mTypeError_;

static void _0RL_CosEventChannelAdmin_mProxyPushConsumer_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mProxyPushConsumer_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::ProxyPushConsumer::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mProxyPushConsumer_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushConsumer_ptr _o)
{
  CosEventChannelAdmin::ProxyPushConsumer_ptr _no = CosEventChannelAdmin::ProxyPushConsumer::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPushConsumer,
               _0RL_CosEventChannelAdmin_mProxyPushConsumer_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPushConsumer_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushConsumer_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPushConsumer,
               _0RL_CosEventChannelAdmin_mProxyPushConsumer_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPushConsumer_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::ProxyPushConsumer::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushConsumer_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_ProxyPushConsumer,
                    _0RL_CosEventChannelAdmin_mProxyPushConsumer_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPushConsumer_marshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPushConsumer_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::ProxyPushConsumer_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::ProxyPushConsumer::_PD_repoId);
    else
      _o = CosEventChannelAdmin::ProxyPushConsumer::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mProxyPullSupplier_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mProxyPullSupplier_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::ProxyPullSupplier::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mProxyPullSupplier_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullSupplier_ptr _o)
{
  CosEventChannelAdmin::ProxyPullSupplier_ptr _no = CosEventChannelAdmin::ProxyPullSupplier::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPullSupplier,
               _0RL_CosEventChannelAdmin_mProxyPullSupplier_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPullSupplier_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullSupplier_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPullSupplier,
               _0RL_CosEventChannelAdmin_mProxyPullSupplier_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPullSupplier_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::ProxyPullSupplier::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullSupplier_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_ProxyPullSupplier,
                    _0RL_CosEventChannelAdmin_mProxyPullSupplier_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPullSupplier_marshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPullSupplier_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::ProxyPullSupplier_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::ProxyPullSupplier::_PD_repoId);
    else
      _o = CosEventChannelAdmin::ProxyPullSupplier::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mProxyPullConsumer_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mProxyPullConsumer_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::ProxyPullConsumer::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mProxyPullConsumer_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullConsumer_ptr _o)
{
  CosEventChannelAdmin::ProxyPullConsumer_ptr _no = CosEventChannelAdmin::ProxyPullConsumer::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPullConsumer,
               _0RL_CosEventChannelAdmin_mProxyPullConsumer_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPullConsumer_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullConsumer_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPullConsumer,
               _0RL_CosEventChannelAdmin_mProxyPullConsumer_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPullConsumer_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::ProxyPullConsumer::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::ProxyPullConsumer_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_ProxyPullConsumer,
                    _0RL_CosEventChannelAdmin_mProxyPullConsumer_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPullConsumer_marshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPullConsumer_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::ProxyPullConsumer_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::ProxyPullConsumer::_PD_repoId);
    else
      _o = CosEventChannelAdmin::ProxyPullConsumer::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mProxyPushSupplier_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mProxyPushSupplier_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::ProxyPushSupplier::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mProxyPushSupplier_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushSupplier_ptr _o)
{
  CosEventChannelAdmin::ProxyPushSupplier_ptr _no = CosEventChannelAdmin::ProxyPushSupplier::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPushSupplier,
               _0RL_CosEventChannelAdmin_mProxyPushSupplier_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPushSupplier_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushSupplier_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_ProxyPushSupplier,
               _0RL_CosEventChannelAdmin_mProxyPushSupplier_marshal_fn,
               _0RL_CosEventChannelAdmin_mProxyPushSupplier_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::ProxyPushSupplier::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::ProxyPushSupplier_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_ProxyPushSupplier,
                    _0RL_CosEventChannelAdmin_mProxyPushSupplier_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPushSupplier_marshal_fn,
                    _0RL_CosEventChannelAdmin_mProxyPushSupplier_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::ProxyPushSupplier_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::ProxyPushSupplier::_PD_repoId);
    else
      _o = CosEventChannelAdmin::ProxyPushSupplier::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mConsumerAdmin_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mConsumerAdmin_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::ConsumerAdmin::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mConsumerAdmin_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ConsumerAdmin_ptr _o)
{
  CosEventChannelAdmin::ConsumerAdmin_ptr _no = CosEventChannelAdmin::ConsumerAdmin::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_ConsumerAdmin,
               _0RL_CosEventChannelAdmin_mConsumerAdmin_marshal_fn,
               _0RL_CosEventChannelAdmin_mConsumerAdmin_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::ConsumerAdmin_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_ConsumerAdmin,
               _0RL_CosEventChannelAdmin_mConsumerAdmin_marshal_fn,
               _0RL_CosEventChannelAdmin_mConsumerAdmin_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::ConsumerAdmin::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::ConsumerAdmin_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_ConsumerAdmin,
                    _0RL_CosEventChannelAdmin_mConsumerAdmin_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mConsumerAdmin_marshal_fn,
                    _0RL_CosEventChannelAdmin_mConsumerAdmin_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::ConsumerAdmin_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::ConsumerAdmin::_PD_repoId);
    else
      _o = CosEventChannelAdmin::ConsumerAdmin::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mSupplierAdmin_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mSupplierAdmin_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::SupplierAdmin::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mSupplierAdmin_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::SupplierAdmin_ptr _o)
{
  CosEventChannelAdmin::SupplierAdmin_ptr _no = CosEventChannelAdmin::SupplierAdmin::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_SupplierAdmin,
               _0RL_CosEventChannelAdmin_mSupplierAdmin_marshal_fn,
               _0RL_CosEventChannelAdmin_mSupplierAdmin_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::SupplierAdmin_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_SupplierAdmin,
               _0RL_CosEventChannelAdmin_mSupplierAdmin_marshal_fn,
               _0RL_CosEventChannelAdmin_mSupplierAdmin_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::SupplierAdmin::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::SupplierAdmin_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_SupplierAdmin,
                    _0RL_CosEventChannelAdmin_mSupplierAdmin_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mSupplierAdmin_marshal_fn,
                    _0RL_CosEventChannelAdmin_mSupplierAdmin_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::SupplierAdmin_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::SupplierAdmin::_PD_repoId);
    else
      _o = CosEventChannelAdmin::SupplierAdmin::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosEventChannelAdmin_mEventChannel_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosEventChannelAdmin_mEventChannel_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosEventChannelAdmin::EventChannel::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosEventChannelAdmin_mEventChannel_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::EventChannel_ptr _o)
{
  CosEventChannelAdmin::EventChannel_ptr _no = CosEventChannelAdmin::EventChannel::_duplicate(_o);
  _a.PR_insert(CosEventChannelAdmin::_tc_EventChannel,
               _0RL_CosEventChannelAdmin_mEventChannel_marshal_fn,
               _0RL_CosEventChannelAdmin_mEventChannel_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosEventChannelAdmin::EventChannel_ptr* _op)
{
  _a.PR_insert(CosEventChannelAdmin::_tc_EventChannel,
               _0RL_CosEventChannelAdmin_mEventChannel_marshal_fn,
               _0RL_CosEventChannelAdmin_mEventChannel_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosEventChannelAdmin::EventChannel::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosEventChannelAdmin::EventChannel_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosEventChannelAdmin::_tc_EventChannel,
                    _0RL_CosEventChannelAdmin_mEventChannel_unmarshal_fn,
                    _0RL_CosEventChannelAdmin_mEventChannel_marshal_fn,
                    _0RL_CosEventChannelAdmin_mEventChannel_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosEventChannelAdmin::EventChannel_ptr)_r->_ptrToObjRef(CosEventChannelAdmin::EventChannel::_PD_repoId);
    else
      _o = CosEventChannelAdmin::EventChannel::_nil();
    return 1;
  }
  return 0;
}

