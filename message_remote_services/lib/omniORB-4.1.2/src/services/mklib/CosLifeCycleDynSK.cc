// This file is generated by omniidl (C++ backend) - omniORB_4_1. Do not edit.

#include "CosLifeCycle.hh"

OMNI_USING_NAMESPACE(omni)

static const char* _0RL_dyn_library_version = omniORB_4_1_dyn;

static ::CORBA::TypeCode::_Tracker _0RL_tcTrack(__FILE__);

static CORBA::TypeCode_ptr _0RL_tc_CosNaming_mIstring = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosNaming/Istring:1.0", "Istring", CORBA::TypeCode::PR_string_tc(0, &_0RL_tcTrack), &_0RL_tcTrack);


static CORBA::PR_structMember _0RL_structmember_CosNaming_mNameComponent[] = {
  {"id", _0RL_tc_CosNaming_mIstring},
  {"kind", _0RL_tc_CosNaming_mIstring}
};

#ifdef _0RL_tc_CosNaming_mNameComponent
#  undef _0RL_tc_CosNaming_mNameComponent
#endif
static CORBA::TypeCode_ptr _0RL_tc_CosNaming_mNameComponent = CORBA::TypeCode::PR_struct_tc("IDL:omg.org/CosNaming/NameComponent:1.0", "NameComponent", _0RL_structmember_CosNaming_mNameComponent, 2, &_0RL_tcTrack);


static CORBA::TypeCode_ptr _0RL_tc_CosNaming_mName = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosNaming/Name:1.0", "Name", CORBA::TypeCode::PR_sequence_tc(0, _0RL_tc_CosNaming_mNameComponent, &_0RL_tcTrack), &_0RL_tcTrack);




static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mKey = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosLifeCycle/Key:1.0", "Key", _0RL_tc_CosNaming_mName, &_0RL_tcTrack);


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_Key = _0RL_tc_CosLifeCycle_mKey;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_Key = _0RL_tc_CosLifeCycle_mKey;
#endif

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mFactory = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosLifeCycle/Factory:1.0", "Factory", CORBA::TypeCode::PR_Object_tc(), &_0RL_tcTrack);


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_Factory = _0RL_tc_CosLifeCycle_mFactory;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_Factory = _0RL_tc_CosLifeCycle_mFactory;
#endif

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mFactories = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosLifeCycle/Factories:1.0", "Factories", CORBA::TypeCode::PR_sequence_tc(0, _0RL_tc_CosLifeCycle_mFactory, &_0RL_tcTrack), &_0RL_tcTrack);


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_Factories = _0RL_tc_CosLifeCycle_mFactories;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_Factories = _0RL_tc_CosLifeCycle_mFactories;
#endif

static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mNVP[] = {
  {"name", _0RL_tc_CosNaming_mIstring},
  {"value", CORBA::TypeCode::PR_any_tc()}
};

#ifdef _0RL_tc_CosLifeCycle_mNVP
#  undef _0RL_tc_CosLifeCycle_mNVP
#endif
static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNVP = CORBA::TypeCode::PR_struct_tc("IDL:omg.org/CosLifeCycle/NVP:1.0", "NVP", _0RL_structmember_CosLifeCycle_mNVP, 2, &_0RL_tcTrack);

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NVP = _0RL_tc_CosLifeCycle_mNVP;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NVP = _0RL_tc_CosLifeCycle_mNVP;
#endif




static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNameValuePair = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosLifeCycle/NameValuePair:1.0", "NameValuePair", _0RL_tc_CosLifeCycle_mNVP, &_0RL_tcTrack);


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NameValuePair = _0RL_tc_CosLifeCycle_mNameValuePair;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NameValuePair = _0RL_tc_CosLifeCycle_mNameValuePair;
#endif





static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mCriteria = CORBA::TypeCode::PR_alias_tc("IDL:omg.org/CosLifeCycle/Criteria:1.0", "Criteria", CORBA::TypeCode::PR_sequence_tc(0, _0RL_tc_CosLifeCycle_mNameValuePair, &_0RL_tcTrack), &_0RL_tcTrack);


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_Criteria = _0RL_tc_CosLifeCycle_mCriteria;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_Criteria = _0RL_tc_CosLifeCycle_mCriteria;
#endif


static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mNoFactory[] = {
  {"search_key", _0RL_tc_CosLifeCycle_mKey}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNoFactory = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/NoFactory:1.0", "NoFactory", _0RL_structmember_CosLifeCycle_mNoFactory, 1, &_0RL_tcTrack);

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NoFactory = _0RL_tc_CosLifeCycle_mNoFactory;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NoFactory = _0RL_tc_CosLifeCycle_mNoFactory;
#endif


static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mNotCopyable[] = {
  {"reason", CORBA::TypeCode::PR_string_tc(0, &_0RL_tcTrack)}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNotCopyable = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/NotCopyable:1.0", "NotCopyable", _0RL_structmember_CosLifeCycle_mNotCopyable, 1, &_0RL_tcTrack);
#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NotCopyable = _0RL_tc_CosLifeCycle_mNotCopyable;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NotCopyable = _0RL_tc_CosLifeCycle_mNotCopyable;
#endif


static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mNotMovable[] = {
  {"reason", CORBA::TypeCode::PR_string_tc(0, &_0RL_tcTrack)}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNotMovable = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/NotMovable:1.0", "NotMovable", _0RL_structmember_CosLifeCycle_mNotMovable, 1, &_0RL_tcTrack);
#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NotMovable = _0RL_tc_CosLifeCycle_mNotMovable;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NotMovable = _0RL_tc_CosLifeCycle_mNotMovable;
#endif


static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mNotRemovable[] = {
  {"reason", CORBA::TypeCode::PR_string_tc(0, &_0RL_tcTrack)}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mNotRemovable = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/NotRemovable:1.0", "NotRemovable", _0RL_structmember_CosLifeCycle_mNotRemovable, 1, &_0RL_tcTrack);
#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_NotRemovable = _0RL_tc_CosLifeCycle_mNotRemovable;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_NotRemovable = _0RL_tc_CosLifeCycle_mNotRemovable;
#endif



static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mInvalidCriteria[] = {
  {"invalid_criteria", _0RL_tc_CosLifeCycle_mCriteria}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mInvalidCriteria = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/InvalidCriteria:1.0", "InvalidCriteria", _0RL_structmember_CosLifeCycle_mInvalidCriteria, 1, &_0RL_tcTrack);

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_InvalidCriteria = _0RL_tc_CosLifeCycle_mInvalidCriteria;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_InvalidCriteria = _0RL_tc_CosLifeCycle_mInvalidCriteria;
#endif



static CORBA::PR_structMember _0RL_structmember_CosLifeCycle_mCannotMeetCriteria[] = {
  {"unmet_criteria", _0RL_tc_CosLifeCycle_mCriteria}
};

static CORBA::TypeCode_ptr _0RL_tc_CosLifeCycle_mCannotMeetCriteria = CORBA::TypeCode::PR_exception_tc("IDL:omg.org/CosLifeCycle/CannotMeetCriteria:1.0", "CannotMeetCriteria", _0RL_structmember_CosLifeCycle_mCannotMeetCriteria, 1, &_0RL_tcTrack);

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_CannotMeetCriteria = _0RL_tc_CosLifeCycle_mCannotMeetCriteria;
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_CannotMeetCriteria = _0RL_tc_CosLifeCycle_mCannotMeetCriteria;
#endif


#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_FactoryFinder = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/FactoryFinder:1.0", "FactoryFinder", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_FactoryFinder = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/FactoryFinder:1.0", "FactoryFinder", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_LifeCycleObject = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/LifeCycleObject:1.0", "LifeCycleObject", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_LifeCycleObject = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/LifeCycleObject:1.0", "LifeCycleObject", &_0RL_tcTrack);
#endif

#if defined(HAS_Cplusplus_Namespace) && defined(_MSC_VER)
// MSVC++ does not give the constant external linkage otherwise.
namespace CosLifeCycle { 
  const ::CORBA::TypeCode_ptr _tc_GenericFactory = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/GenericFactory:1.0", "GenericFactory", &_0RL_tcTrack);
} 
#else
const ::CORBA::TypeCode_ptr CosLifeCycle::_tc_GenericFactory = CORBA::TypeCode::PR_interface_tc("IDL:omg.org/CosLifeCycle/GenericFactory:1.0", "GenericFactory", &_0RL_tcTrack);
#endif

static void _0RL_CosLifeCycle_mFactories_marshal_fn(cdrStream& _s, void* _v)
{
  CosLifeCycle::Factories* _p = (CosLifeCycle::Factories*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mFactories_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::Factories* _p = new CosLifeCycle::Factories;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mFactories_destructor_fn(void* _v)
{
  CosLifeCycle::Factories* _p = (CosLifeCycle::Factories*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::Factories& _s)
{
  CosLifeCycle::Factories* _p = new CosLifeCycle::Factories(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mFactories,
               _0RL_CosLifeCycle_mFactories_marshal_fn,
               _0RL_CosLifeCycle_mFactories_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::Factories* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mFactories,
               _0RL_CosLifeCycle_mFactories_marshal_fn,
               _0RL_CosLifeCycle_mFactories_destructor_fn,
               _sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::Factories*& _sp)
{
  return _a >>= (const CosLifeCycle::Factories*&) _sp;
}
::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::Factories*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mFactories,
                    _0RL_CosLifeCycle_mFactories_unmarshal_fn,
                    _0RL_CosLifeCycle_mFactories_marshal_fn,
                    _0RL_CosLifeCycle_mFactories_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::Factories*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_CosLifeCycle_mNVP_marshal_fn(cdrStream& _s, void* _v)
{
  CosLifeCycle::NVP* _p = (CosLifeCycle::NVP*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mNVP_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::NVP* _p = new CosLifeCycle::NVP;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mNVP_destructor_fn(void* _v)
{
  CosLifeCycle::NVP* _p = (CosLifeCycle::NVP*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NVP& _s)
{
  CosLifeCycle::NVP* _p = new CosLifeCycle::NVP(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNVP,
               _0RL_CosLifeCycle_mNVP_marshal_fn,
               _0RL_CosLifeCycle_mNVP_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::NVP* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNVP,
               _0RL_CosLifeCycle_mNVP_marshal_fn,
               _0RL_CosLifeCycle_mNVP_destructor_fn,
               _sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::NVP*& _sp)
{
  return _a >>= (const CosLifeCycle::NVP*&) _sp;
}
::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::NVP*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mNVP,
                    _0RL_CosLifeCycle_mNVP_unmarshal_fn,
                    _0RL_CosLifeCycle_mNVP_marshal_fn,
                    _0RL_CosLifeCycle_mNVP_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::NVP*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_CosLifeCycle_mCriteria_marshal_fn(cdrStream& _s, void* _v)
{
  CosLifeCycle::Criteria* _p = (CosLifeCycle::Criteria*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mCriteria_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::Criteria* _p = new CosLifeCycle::Criteria;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mCriteria_destructor_fn(void* _v)
{
  CosLifeCycle::Criteria* _p = (CosLifeCycle::Criteria*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::Criteria& _s)
{
  CosLifeCycle::Criteria* _p = new CosLifeCycle::Criteria(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mCriteria,
               _0RL_CosLifeCycle_mCriteria_marshal_fn,
               _0RL_CosLifeCycle_mCriteria_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::Criteria* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mCriteria,
               _0RL_CosLifeCycle_mCriteria_marshal_fn,
               _0RL_CosLifeCycle_mCriteria_destructor_fn,
               _sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::Criteria*& _sp)
{
  return _a >>= (const CosLifeCycle::Criteria*&) _sp;
}
::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::Criteria*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mCriteria,
                    _0RL_CosLifeCycle_mCriteria_unmarshal_fn,
                    _0RL_CosLifeCycle_mCriteria_marshal_fn,
                    _0RL_CosLifeCycle_mCriteria_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::Criteria*)_v;
    return 1;
  }
  return 0;
}


static void _0RL_CosLifeCycle_mNoFactory_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::NoFactory* _p = (const CosLifeCycle::NoFactory*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mNoFactory_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::NoFactory* _p = new CosLifeCycle::NoFactory;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mNoFactory_destructor_fn(void* _v)
{
  CosLifeCycle::NoFactory* _p = (CosLifeCycle::NoFactory*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NoFactory& _s)
{
  CosLifeCycle::NoFactory* _p = new CosLifeCycle::NoFactory(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNoFactory,
               _0RL_CosLifeCycle_mNoFactory_marshal_fn,
               _0RL_CosLifeCycle_mNoFactory_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NoFactory* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNoFactory,
               _0RL_CosLifeCycle_mNoFactory_marshal_fn,
               _0RL_CosLifeCycle_mNoFactory_destructor_fn,
               (CosLifeCycle::NoFactory*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::NoFactory*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mNoFactory,
                    _0RL_CosLifeCycle_mNoFactory_unmarshal_fn,
                    _0RL_CosLifeCycle_mNoFactory_marshal_fn,
                    _0RL_CosLifeCycle_mNoFactory_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::NoFactory*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mNoFactory(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::NoFactory & _ex = (const CosLifeCycle::NoFactory &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mNoFactory (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::NoFactory* _ex = (const CosLifeCycle::NoFactory*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mNoFactory {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mNoFactory() {
    CosLifeCycle::NoFactory::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mNoFactory;
    CosLifeCycle::NoFactory::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mNoFactory;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mNoFactory _0RL_insertToAny_Singleton__cCosLifeCycle_mNoFactory_;


static void _0RL_CosLifeCycle_mNotCopyable_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::NotCopyable* _p = (const CosLifeCycle::NotCopyable*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mNotCopyable_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::NotCopyable* _p = new CosLifeCycle::NotCopyable;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mNotCopyable_destructor_fn(void* _v)
{
  CosLifeCycle::NotCopyable* _p = (CosLifeCycle::NotCopyable*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotCopyable& _s)
{
  CosLifeCycle::NotCopyable* _p = new CosLifeCycle::NotCopyable(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotCopyable,
               _0RL_CosLifeCycle_mNotCopyable_marshal_fn,
               _0RL_CosLifeCycle_mNotCopyable_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotCopyable* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotCopyable,
               _0RL_CosLifeCycle_mNotCopyable_marshal_fn,
               _0RL_CosLifeCycle_mNotCopyable_destructor_fn,
               (CosLifeCycle::NotCopyable*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::NotCopyable*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mNotCopyable,
                    _0RL_CosLifeCycle_mNotCopyable_unmarshal_fn,
                    _0RL_CosLifeCycle_mNotCopyable_marshal_fn,
                    _0RL_CosLifeCycle_mNotCopyable_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::NotCopyable*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mNotCopyable(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::NotCopyable & _ex = (const CosLifeCycle::NotCopyable &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mNotCopyable (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::NotCopyable* _ex = (const CosLifeCycle::NotCopyable*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mNotCopyable {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mNotCopyable() {
    CosLifeCycle::NotCopyable::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mNotCopyable;
    CosLifeCycle::NotCopyable::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mNotCopyable;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mNotCopyable _0RL_insertToAny_Singleton__cCosLifeCycle_mNotCopyable_;


static void _0RL_CosLifeCycle_mNotMovable_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::NotMovable* _p = (const CosLifeCycle::NotMovable*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mNotMovable_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::NotMovable* _p = new CosLifeCycle::NotMovable;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mNotMovable_destructor_fn(void* _v)
{
  CosLifeCycle::NotMovable* _p = (CosLifeCycle::NotMovable*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotMovable& _s)
{
  CosLifeCycle::NotMovable* _p = new CosLifeCycle::NotMovable(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotMovable,
               _0RL_CosLifeCycle_mNotMovable_marshal_fn,
               _0RL_CosLifeCycle_mNotMovable_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotMovable* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotMovable,
               _0RL_CosLifeCycle_mNotMovable_marshal_fn,
               _0RL_CosLifeCycle_mNotMovable_destructor_fn,
               (CosLifeCycle::NotMovable*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::NotMovable*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mNotMovable,
                    _0RL_CosLifeCycle_mNotMovable_unmarshal_fn,
                    _0RL_CosLifeCycle_mNotMovable_marshal_fn,
                    _0RL_CosLifeCycle_mNotMovable_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::NotMovable*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mNotMovable(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::NotMovable & _ex = (const CosLifeCycle::NotMovable &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mNotMovable (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::NotMovable* _ex = (const CosLifeCycle::NotMovable*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mNotMovable {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mNotMovable() {
    CosLifeCycle::NotMovable::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mNotMovable;
    CosLifeCycle::NotMovable::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mNotMovable;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mNotMovable _0RL_insertToAny_Singleton__cCosLifeCycle_mNotMovable_;


static void _0RL_CosLifeCycle_mNotRemovable_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::NotRemovable* _p = (const CosLifeCycle::NotRemovable*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mNotRemovable_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::NotRemovable* _p = new CosLifeCycle::NotRemovable;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mNotRemovable_destructor_fn(void* _v)
{
  CosLifeCycle::NotRemovable* _p = (CosLifeCycle::NotRemovable*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotRemovable& _s)
{
  CosLifeCycle::NotRemovable* _p = new CosLifeCycle::NotRemovable(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotRemovable,
               _0RL_CosLifeCycle_mNotRemovable_marshal_fn,
               _0RL_CosLifeCycle_mNotRemovable_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::NotRemovable* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mNotRemovable,
               _0RL_CosLifeCycle_mNotRemovable_marshal_fn,
               _0RL_CosLifeCycle_mNotRemovable_destructor_fn,
               (CosLifeCycle::NotRemovable*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::NotRemovable*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mNotRemovable,
                    _0RL_CosLifeCycle_mNotRemovable_unmarshal_fn,
                    _0RL_CosLifeCycle_mNotRemovable_marshal_fn,
                    _0RL_CosLifeCycle_mNotRemovable_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::NotRemovable*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mNotRemovable(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::NotRemovable & _ex = (const CosLifeCycle::NotRemovable &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mNotRemovable (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::NotRemovable* _ex = (const CosLifeCycle::NotRemovable*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mNotRemovable {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mNotRemovable() {
    CosLifeCycle::NotRemovable::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mNotRemovable;
    CosLifeCycle::NotRemovable::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mNotRemovable;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mNotRemovable _0RL_insertToAny_Singleton__cCosLifeCycle_mNotRemovable_;


static void _0RL_CosLifeCycle_mInvalidCriteria_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::InvalidCriteria* _p = (const CosLifeCycle::InvalidCriteria*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mInvalidCriteria_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::InvalidCriteria* _p = new CosLifeCycle::InvalidCriteria;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mInvalidCriteria_destructor_fn(void* _v)
{
  CosLifeCycle::InvalidCriteria* _p = (CosLifeCycle::InvalidCriteria*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::InvalidCriteria& _s)
{
  CosLifeCycle::InvalidCriteria* _p = new CosLifeCycle::InvalidCriteria(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mInvalidCriteria,
               _0RL_CosLifeCycle_mInvalidCriteria_marshal_fn,
               _0RL_CosLifeCycle_mInvalidCriteria_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::InvalidCriteria* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mInvalidCriteria,
               _0RL_CosLifeCycle_mInvalidCriteria_marshal_fn,
               _0RL_CosLifeCycle_mInvalidCriteria_destructor_fn,
               (CosLifeCycle::InvalidCriteria*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::InvalidCriteria*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mInvalidCriteria,
                    _0RL_CosLifeCycle_mInvalidCriteria_unmarshal_fn,
                    _0RL_CosLifeCycle_mInvalidCriteria_marshal_fn,
                    _0RL_CosLifeCycle_mInvalidCriteria_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::InvalidCriteria*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mInvalidCriteria(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::InvalidCriteria & _ex = (const CosLifeCycle::InvalidCriteria &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mInvalidCriteria (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::InvalidCriteria* _ex = (const CosLifeCycle::InvalidCriteria*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mInvalidCriteria {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mInvalidCriteria() {
    CosLifeCycle::InvalidCriteria::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mInvalidCriteria;
    CosLifeCycle::InvalidCriteria::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mInvalidCriteria;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mInvalidCriteria _0RL_insertToAny_Singleton__cCosLifeCycle_mInvalidCriteria_;


static void _0RL_CosLifeCycle_mCannotMeetCriteria_marshal_fn(cdrStream& _s, void* _v)
{
  const CosLifeCycle::CannotMeetCriteria* _p = (const CosLifeCycle::CannotMeetCriteria*)_v;
  *_p >>= _s;
}
static void _0RL_CosLifeCycle_mCannotMeetCriteria_unmarshal_fn(cdrStream& _s, void*& _v)
{
  CosLifeCycle::CannotMeetCriteria* _p = new CosLifeCycle::CannotMeetCriteria;
  *_p <<= _s;
  _v = _p;
}
static void _0RL_CosLifeCycle_mCannotMeetCriteria_destructor_fn(void* _v)
{
  CosLifeCycle::CannotMeetCriteria* _p = (CosLifeCycle::CannotMeetCriteria*)_v;
  delete _p;
}

void operator<<=(::CORBA::Any& _a, const CosLifeCycle::CannotMeetCriteria& _s)
{
  CosLifeCycle::CannotMeetCriteria* _p = new CosLifeCycle::CannotMeetCriteria(_s);
  _a.PR_insert(_0RL_tc_CosLifeCycle_mCannotMeetCriteria,
               _0RL_CosLifeCycle_mCannotMeetCriteria_marshal_fn,
               _0RL_CosLifeCycle_mCannotMeetCriteria_destructor_fn,
               _p);
}
void operator<<=(::CORBA::Any& _a, const CosLifeCycle::CannotMeetCriteria* _sp)
{
  _a.PR_insert(_0RL_tc_CosLifeCycle_mCannotMeetCriteria,
               _0RL_CosLifeCycle_mCannotMeetCriteria_marshal_fn,
               _0RL_CosLifeCycle_mCannotMeetCriteria_destructor_fn,
               (CosLifeCycle::CannotMeetCriteria*)_sp);
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, const CosLifeCycle::CannotMeetCriteria*& _sp)
{
  void* _v;
  if (_a.PR_extract(_0RL_tc_CosLifeCycle_mCannotMeetCriteria,
                    _0RL_CosLifeCycle_mCannotMeetCriteria_unmarshal_fn,
                    _0RL_CosLifeCycle_mCannotMeetCriteria_marshal_fn,
                    _0RL_CosLifeCycle_mCannotMeetCriteria_destructor_fn,
                    _v)) {
    _sp = (const CosLifeCycle::CannotMeetCriteria*)_v;
    return 1;
  }
  return 0;
}

static void _0RL_insertToAny__cCosLifeCycle_mCannotMeetCriteria(::CORBA::Any& _a, const ::CORBA::Exception& _e) {
  const CosLifeCycle::CannotMeetCriteria & _ex = (const CosLifeCycle::CannotMeetCriteria &) _e;
  operator<<=(_a,_ex);
}

static void _0RL_insertToAnyNCP__cCosLifeCycle_mCannotMeetCriteria (::CORBA::Any& _a, const ::CORBA::Exception* _e) {
  const CosLifeCycle::CannotMeetCriteria* _ex = (const CosLifeCycle::CannotMeetCriteria*) _e;
  operator<<=(_a,_ex);
}

class _0RL_insertToAny_Singleton__cCosLifeCycle_mCannotMeetCriteria {
public:
  _0RL_insertToAny_Singleton__cCosLifeCycle_mCannotMeetCriteria() {
    CosLifeCycle::CannotMeetCriteria::insertToAnyFn = _0RL_insertToAny__cCosLifeCycle_mCannotMeetCriteria;
    CosLifeCycle::CannotMeetCriteria::insertToAnyFnNCP = _0RL_insertToAnyNCP__cCosLifeCycle_mCannotMeetCriteria;
  }
};
static _0RL_insertToAny_Singleton__cCosLifeCycle_mCannotMeetCriteria _0RL_insertToAny_Singleton__cCosLifeCycle_mCannotMeetCriteria_;

static void _0RL_CosLifeCycle_mFactoryFinder_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosLifeCycle_mFactoryFinder_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosLifeCycle::FactoryFinder::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosLifeCycle_mFactoryFinder_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosLifeCycle::FactoryFinder_ptr _o)
{
  CosLifeCycle::FactoryFinder_ptr _no = CosLifeCycle::FactoryFinder::_duplicate(_o);
  _a.PR_insert(CosLifeCycle::_tc_FactoryFinder,
               _0RL_CosLifeCycle_mFactoryFinder_marshal_fn,
               _0RL_CosLifeCycle_mFactoryFinder_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::FactoryFinder_ptr* _op)
{
  _a.PR_insert(CosLifeCycle::_tc_FactoryFinder,
               _0RL_CosLifeCycle_mFactoryFinder_marshal_fn,
               _0RL_CosLifeCycle_mFactoryFinder_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosLifeCycle::FactoryFinder::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::FactoryFinder_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosLifeCycle::_tc_FactoryFinder,
                    _0RL_CosLifeCycle_mFactoryFinder_unmarshal_fn,
                    _0RL_CosLifeCycle_mFactoryFinder_marshal_fn,
                    _0RL_CosLifeCycle_mFactoryFinder_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosLifeCycle::FactoryFinder_ptr)_r->_ptrToObjRef(CosLifeCycle::FactoryFinder::_PD_repoId);
    else
      _o = CosLifeCycle::FactoryFinder::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosLifeCycle_mLifeCycleObject_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosLifeCycle_mLifeCycleObject_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosLifeCycle::LifeCycleObject::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosLifeCycle_mLifeCycleObject_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosLifeCycle::LifeCycleObject_ptr _o)
{
  CosLifeCycle::LifeCycleObject_ptr _no = CosLifeCycle::LifeCycleObject::_duplicate(_o);
  _a.PR_insert(CosLifeCycle::_tc_LifeCycleObject,
               _0RL_CosLifeCycle_mLifeCycleObject_marshal_fn,
               _0RL_CosLifeCycle_mLifeCycleObject_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::LifeCycleObject_ptr* _op)
{
  _a.PR_insert(CosLifeCycle::_tc_LifeCycleObject,
               _0RL_CosLifeCycle_mLifeCycleObject_marshal_fn,
               _0RL_CosLifeCycle_mLifeCycleObject_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosLifeCycle::LifeCycleObject::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::LifeCycleObject_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosLifeCycle::_tc_LifeCycleObject,
                    _0RL_CosLifeCycle_mLifeCycleObject_unmarshal_fn,
                    _0RL_CosLifeCycle_mLifeCycleObject_marshal_fn,
                    _0RL_CosLifeCycle_mLifeCycleObject_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosLifeCycle::LifeCycleObject_ptr)_r->_ptrToObjRef(CosLifeCycle::LifeCycleObject::_PD_repoId);
    else
      _o = CosLifeCycle::LifeCycleObject::_nil();
    return 1;
  }
  return 0;
}

static void _0RL_CosLifeCycle_mGenericFactory_marshal_fn(cdrStream& _s, void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  omniObjRef::_marshal(_o, _s);
}
static void _0RL_CosLifeCycle_mGenericFactory_unmarshal_fn(cdrStream& _s, void*& _v)
{
  omniObjRef* _o = omniObjRef::_unMarshal(CosLifeCycle::GenericFactory::_PD_repoId, _s);
  _v = _o;
}
static void _0RL_CosLifeCycle_mGenericFactory_destructor_fn(void* _v)
{
  omniObjRef* _o = (omniObjRef*)_v;
  if (_o)
    omni::releaseObjRef(_o);
}

void operator<<=(::CORBA::Any& _a, CosLifeCycle::GenericFactory_ptr _o)
{
  CosLifeCycle::GenericFactory_ptr _no = CosLifeCycle::GenericFactory::_duplicate(_o);
  _a.PR_insert(CosLifeCycle::_tc_GenericFactory,
               _0RL_CosLifeCycle_mGenericFactory_marshal_fn,
               _0RL_CosLifeCycle_mGenericFactory_destructor_fn,
               _no->_PR_getobj());
}
void operator<<=(::CORBA::Any& _a, CosLifeCycle::GenericFactory_ptr* _op)
{
  _a.PR_insert(CosLifeCycle::_tc_GenericFactory,
               _0RL_CosLifeCycle_mGenericFactory_marshal_fn,
               _0RL_CosLifeCycle_mGenericFactory_destructor_fn,
               (*_op)->_PR_getobj());
  *_op = CosLifeCycle::GenericFactory::_nil();
}

::CORBA::Boolean operator>>=(const ::CORBA::Any& _a, CosLifeCycle::GenericFactory_ptr& _o)
{
  void* _v;
  if (_a.PR_extract(CosLifeCycle::_tc_GenericFactory,
                    _0RL_CosLifeCycle_mGenericFactory_unmarshal_fn,
                    _0RL_CosLifeCycle_mGenericFactory_marshal_fn,
                    _0RL_CosLifeCycle_mGenericFactory_destructor_fn,
                    _v)) {
    omniObjRef* _r = (omniObjRef*)_v;
    if (_r)
      _o = (CosLifeCycle::GenericFactory_ptr)_r->_ptrToObjRef(CosLifeCycle::GenericFactory::_PD_repoId);
    else
      _o = CosLifeCycle::GenericFactory::_nil();
    return 1;
  }
  return 0;
}

