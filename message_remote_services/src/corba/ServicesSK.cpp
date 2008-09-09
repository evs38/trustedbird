// This file is generated by omniidl (C++ backend)- omniORB_4_1. Do not edit.

#include "Services.h"
#include <omniORB4/IOP_S.h>
#include <omniORB4/IOP_C.h>
#include <omniORB4/callDescriptor.h>
#include <omniORB4/callHandle.h>
#include <omniORB4/objTracker.h>


OMNI_USING_NAMESPACE(omni)

static const char* _0RL_library_version = omniORB_4_1;



::CORBA::Exception::insertExceptionToAny CInternalServerException::insertToAnyFn = 0;
::CORBA::Exception::insertExceptionToAnyNCP CInternalServerException::insertToAnyFnNCP = 0;

CInternalServerException::CInternalServerException(const CInternalServerException& _s) : ::CORBA::UserException(_s)
{
  cause = _s.cause;

}

CInternalServerException::CInternalServerException(const char* _cause)
{
  pd_insertToAnyFn    = CInternalServerException::insertToAnyFn;
  pd_insertToAnyFnNCP = CInternalServerException::insertToAnyFnNCP;
  cause = _cause;

}



CInternalServerException& CInternalServerException::operator=(const CInternalServerException& _s)
{
  ((::CORBA::UserException*) this)->operator=(_s);
  cause = _s.cause;

  return *this;
}

CInternalServerException::~CInternalServerException() {}

void CInternalServerException::_raise() const { throw *this; }

const char* CInternalServerException::_PD_repoId = "IDL:CInternalServerException:1.0";
const char* CInternalServerException::_PD_typeId = "Exception/UserException/CInternalServerException";

CInternalServerException* CInternalServerException::_downcast(::CORBA::Exception* _e) {
  return (CInternalServerException*) _NP_is_a(_e, _PD_typeId);
}

const CInternalServerException* CInternalServerException::_downcast(const ::CORBA::Exception* _e) {
  return (const CInternalServerException*) _NP_is_a(_e, _PD_typeId);
}

::CORBA::Exception* CInternalServerException::_NP_duplicate() const {
  return new CInternalServerException(*this);
}

const char* CInternalServerException::_NP_typeId() const {
  return _PD_typeId;
}

const char* CInternalServerException::_NP_repoId(int* _size) const {
  *_size = sizeof("IDL:CInternalServerException:1.0");
  return _PD_repoId;
}
 
void CInternalServerException::_NP_marshal(cdrStream& _s) const {
  *this >>= _s;
}

void
CInternalServerException::operator>>= (cdrStream& _n) const
{
  _n.marshalString(cause,0);

}

void
CInternalServerException::operator<<= (cdrStream& _n)
{
  cause = _n.unmarshalString(0);

}

void
CAccount::operator>>= (cdrStream &_n) const
{
  _n.marshalString(serverHostName,0);
  _n.marshalString(key,0);

}

void
CAccount::operator<<= (cdrStream &_n)
{
  serverHostName = _n.unmarshalString(0);
  key = _n.unmarshalString(0);

}

AccountService_ptr AccountService_Helper::_nil() {
  return ::AccountService::_nil();
}

::CORBA::Boolean AccountService_Helper::is_nil(::AccountService_ptr p) {
  return ::CORBA::is_nil(p);

}

void AccountService_Helper::release(::AccountService_ptr p) {
  ::CORBA::release(p);
}

void AccountService_Helper::marshalObjRef(::AccountService_ptr obj, cdrStream& s) {
  ::AccountService::_marshalObjRef(obj, s);
}

AccountService_ptr AccountService_Helper::unmarshalObjRef(cdrStream& s) {
  return ::AccountService::_unmarshalObjRef(s);
}

void AccountService_Helper::duplicate(::AccountService_ptr obj) {
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
}

AccountService_ptr
AccountService::_duplicate(::AccountService_ptr obj)
{
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
  return obj;
}

AccountService_ptr
AccountService::_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_realNarrow(_PD_repoId);
  return e ? e : _nil();
}


AccountService_ptr
AccountService::_unchecked_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_uncheckedNarrow(_PD_repoId);
  return e ? e : _nil();
}

AccountService_ptr
AccountService::_nil()
{
#ifdef OMNI_UNLOADABLE_STUBS
  static _objref_AccountService _the_nil_obj;
  return &_the_nil_obj;
#else
  static _objref_AccountService* _the_nil_ptr = 0;
  if( !_the_nil_ptr ) {
    omni::nilRefLock().lock();
    if( !_the_nil_ptr ) {
      _the_nil_ptr = new _objref_AccountService;
      registerNilCorbaObject(_the_nil_ptr);
    }
    omni::nilRefLock().unlock();
  }
  return _the_nil_ptr;
#endif
}

const char* AccountService::_PD_repoId = "IDL:AccountService:1.0";


_objref_AccountService::~_objref_AccountService() {
  
}


_objref_AccountService::_objref_AccountService(omniIOR* ior, omniIdentity* id) :
   omniObjRef(::AccountService::_PD_repoId, ior, id, 1)
   
   
{
  _PR_setobj(this);
}

void*
_objref_AccountService::_ptrToObjRef(const char* id)
{
  if( id == ::AccountService::_PD_repoId )
    return (::AccountService_ptr) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (::CORBA::Object_ptr) this;

  if( omni::strMatch(id, ::AccountService::_PD_repoId) )
    return (::AccountService_ptr) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (::CORBA::Object_ptr) this;

  return 0;
}

// Proxy call descriptor class. Mangled signature:
//  _cCAccounts_e_cCInternalServerException
class _0RL_cd_14edc9663ea08cf8_00000000
  : public omniCallDescriptor
{
public:
  inline _0RL_cd_14edc9663ea08cf8_00000000(LocalCallFn lcfn,const char* op_,size_t oplen,_CORBA_Boolean upcall=0):
     omniCallDescriptor(lcfn, op_, oplen, 0, _user_exns, 1, upcall)
  {
    
  }
  
  
  void unmarshalReturnedValues(cdrStream&);
  void marshalReturnedValues(cdrStream&);
  
  void userException(cdrStream&,_OMNI_NS(IOP_C)*,const char*);
  static const char* const _user_exns[];

  CAccounts_var result;
};

void _0RL_cd_14edc9663ea08cf8_00000000::marshalReturnedValues(cdrStream& _n)
{
  (const CAccounts&) result >>= _n;

}

void _0RL_cd_14edc9663ea08cf8_00000000::unmarshalReturnedValues(cdrStream& _n)
{
  result = new CAccounts;
  (CAccounts&)result <<= _n;

}

const char* const _0RL_cd_14edc9663ea08cf8_00000000::_user_exns[] = {
  CInternalServerException::_PD_repoId
};

void _0RL_cd_14edc9663ea08cf8_00000000::userException(cdrStream& s, _OMNI_NS(IOP_C)* iop_client, const char* repoId)
{
  if ( omni::strMatch(repoId, CInternalServerException::_PD_repoId) ) {
    CInternalServerException _ex;
    _ex <<= s;
    if (iop_client) iop_client->RequestCompleted();
    throw _ex;
  }


  else {
    if (iop_client) iop_client->RequestCompleted(1);
    OMNIORB_THROW(UNKNOWN,UNKNOWN_UserException,
                  (::CORBA::CompletionStatus)s.completion());
  }
}

// Local call call-back function.
static void
_0RL_lcfn_14edc9663ea08cf8_10000000(omniCallDescriptor* cd, omniServant* svnt)
{
  _0RL_cd_14edc9663ea08cf8_00000000* tcd = (_0RL_cd_14edc9663ea08cf8_00000000*)cd;
  _impl_AccountService* impl = (_impl_AccountService*) svnt->_ptrToInterface(AccountService::_PD_repoId);
#ifdef HAS_Cplusplus_catch_exception_by_base
  tcd->result = impl->GetAllAccounts();
#else
  if (!cd->is_upcall())
    tcd->result = impl->GetAllAccounts();
  else {
    try {
      tcd->result = impl->GetAllAccounts();
    }
    catch(CInternalServerException& ex) {
      throw omniORB::StubUserException(ex._NP_duplicate());
    }


  }
#endif


}

CAccounts* _objref_AccountService::GetAllAccounts()
{
  _0RL_cd_14edc9663ea08cf8_00000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_10000000, "GetAllAccounts", 15);


  _invoke(_call_desc);
  return _call_desc.result._retn();


}
_pof_AccountService::~_pof_AccountService() {}


omniObjRef*
_pof_AccountService::newObjRef(omniIOR* ior, omniIdentity* id)
{
  return new ::_objref_AccountService(ior, id);
}


::CORBA::Boolean
_pof_AccountService::is_a(const char* id) const
{
  if( omni::ptrStrMatch(id, ::AccountService::_PD_repoId) )
    return 1;
  
  return 0;
}

const _pof_AccountService _the_pof_AccountService;

_impl_AccountService::~_impl_AccountService() {}


::CORBA::Boolean
_impl_AccountService::_dispatch(omniCallHandle& _handle)
{
  const char* op = _handle.operation_name();

  if( omni::strMatch(op, "GetAllAccounts") ) {

    _0RL_cd_14edc9663ea08cf8_00000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_10000000, "GetAllAccounts", 15, 1);
    
    _handle.upcall(this,_call_desc);
    return 1;
  }


  return 0;
}

void*
_impl_AccountService::_ptrToInterface(const char* id)
{
  if( id == ::AccountService::_PD_repoId )
    return (::_impl_AccountService*) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (void*) 1;

  if( omni::strMatch(id, ::AccountService::_PD_repoId) )
    return (::_impl_AccountService*) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (void*) 1;
  return 0;
}

const char*
_impl_AccountService::_mostDerivedRepoId()
{
  return ::AccountService::_PD_repoId;
}

void
CHeader::operator>>= (cdrStream &_n) const
{
  _n.marshalString(key,0);
  _n.marshalString(value,0);

}

void
CHeader::operator<<= (cdrStream &_n)
{
  key = _n.unmarshalString(0);
  value = _n.unmarshalString(0);

}

void
CSecurity::operator>>= (cdrStream &_n) const
{
  _n.marshalBoolean(isSigned);
  _n.marshalBoolean(isCrypted);

}

void
CSecurity::operator<<= (cdrStream &_n)
{
  isSigned = _n.unmarshalBoolean();
  isCrypted = _n.unmarshalBoolean();

}

void
CDSNType::operator>>= (cdrStream &_n) const
{
  _n.marshalBoolean(isReturnFullHDRRequested);
  _n.marshalBoolean(isOnSuccessRequested);
  _n.marshalBoolean(isOnFailureRequested);
  _n.marshalBoolean(isOnDelayRequested);
  _n.marshalBoolean(isNeverRequested);

}

void
CDSNType::operator<<= (cdrStream &_n)
{
  isReturnFullHDRRequested = _n.unmarshalBoolean();
  isOnSuccessRequested = _n.unmarshalBoolean();
  isOnFailureRequested = _n.unmarshalBoolean();
  isOnDelayRequested = _n.unmarshalBoolean();
  isNeverRequested = _n.unmarshalBoolean();

}

void
CNotification::operator>>= (cdrStream &_n) const
{
  _n.marshalBoolean(isDSNRequested);
  (const CDSNType&) DSNType >>= _n;
  _n.marshalBoolean(isMDNReadRequested);

}

void
CNotification::operator<<= (cdrStream &_n)
{
  isDSNRequested = _n.unmarshalBoolean();
  (CDSNType&)DSNType <<= _n;
  isMDNReadRequested = _n.unmarshalBoolean();

}

void
CAttachment::operator>>= (cdrStream &_n) const
{
  _n.marshalString(dirPath,0);
  _n.marshalString(fileName,0);
  _n.marshalString(mimeType,0);

}

void
CAttachment::operator<<= (cdrStream &_n)
{
  dirPath = _n.unmarshalString(0);
  fileName = _n.unmarshalString(0);
  mimeType = _n.unmarshalString(0);

}

void
CMessage::operator>>= (cdrStream &_n) const
{
  (const Addresses&) recipients_to >>= _n;
  (const Addresses&) recipients_cc >>= _n;
  (const Addresses&) recipients_bcc >>= _n;
  (const CNotification&) notification >>= _n;
  _n.marshalString(subject,0);
  _n.marshalString(body,0);
  _n.marshalString(uuid,0);
  (const CSecurity&) security >>= _n;
  (const CHeaders&) p_headers >>= _n;
  (const CAttachments&) p_attachments >>= _n;

}

void
CMessage::operator<<= (cdrStream &_n)
{
  (Addresses&)recipients_to <<= _n;
  (Addresses&)recipients_cc <<= _n;
  (Addresses&)recipients_bcc <<= _n;
  (CNotification&)notification <<= _n;
  subject = _n.unmarshalString(0);
  body = _n.unmarshalString(0);
  uuid = _n.unmarshalString(0);
  (CSecurity&)security <<= _n;
  (CHeaders&)p_headers <<= _n;
  (CAttachments&)p_attachments <<= _n;

}

MessageSendListener_ptr MessageSendListener_Helper::_nil() {
  return ::MessageSendListener::_nil();
}

::CORBA::Boolean MessageSendListener_Helper::is_nil(::MessageSendListener_ptr p) {
  return ::CORBA::is_nil(p);

}

void MessageSendListener_Helper::release(::MessageSendListener_ptr p) {
  ::CORBA::release(p);
}

void MessageSendListener_Helper::marshalObjRef(::MessageSendListener_ptr obj, cdrStream& s) {
  ::MessageSendListener::_marshalObjRef(obj, s);
}

MessageSendListener_ptr MessageSendListener_Helper::unmarshalObjRef(cdrStream& s) {
  return ::MessageSendListener::_unmarshalObjRef(s);
}

void MessageSendListener_Helper::duplicate(::MessageSendListener_ptr obj) {
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
}

MessageSendListener_ptr
MessageSendListener::_duplicate(::MessageSendListener_ptr obj)
{
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
  return obj;
}

MessageSendListener_ptr
MessageSendListener::_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_realNarrow(_PD_repoId);
  return e ? e : _nil();
}


MessageSendListener_ptr
MessageSendListener::_unchecked_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_uncheckedNarrow(_PD_repoId);
  return e ? e : _nil();
}

MessageSendListener_ptr
MessageSendListener::_nil()
{
#ifdef OMNI_UNLOADABLE_STUBS
  static _objref_MessageSendListener _the_nil_obj;
  return &_the_nil_obj;
#else
  static _objref_MessageSendListener* _the_nil_ptr = 0;
  if( !_the_nil_ptr ) {
    omni::nilRefLock().lock();
    if( !_the_nil_ptr ) {
      _the_nil_ptr = new _objref_MessageSendListener;
      registerNilCorbaObject(_the_nil_ptr);
    }
    omni::nilRefLock().unlock();
  }
  return _the_nil_ptr;
#endif
}

const char* MessageSendListener::_PD_repoId = "IDL:MessageSendListener:1.0";


_objref_MessageSendListener::~_objref_MessageSendListener() {
  
}


_objref_MessageSendListener::_objref_MessageSendListener(omniIOR* ior, omniIdentity* id) :
   omniObjRef(::MessageSendListener::_PD_repoId, ior, id, 1)
   
   
{
  _PR_setobj(this);
}

void*
_objref_MessageSendListener::_ptrToObjRef(const char* id)
{
  if( id == ::MessageSendListener::_PD_repoId )
    return (::MessageSendListener_ptr) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (::CORBA::Object_ptr) this;

  if( omni::strMatch(id, ::MessageSendListener::_PD_repoId) )
    return (::MessageSendListener_ptr) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (::CORBA::Object_ptr) this;

  return 0;
}

// Proxy call descriptor class. Mangled signature:
//  void_i_cstring_i_cboolean
class _0RL_cd_14edc9663ea08cf8_20000000
  : public omniCallDescriptor
{
public:
  inline _0RL_cd_14edc9663ea08cf8_20000000(LocalCallFn lcfn,const char* op_,size_t oplen,_CORBA_Boolean upcall=0):
     omniCallDescriptor(lcfn, op_, oplen, 0, 0, 0, upcall)
  {
    
  }
  
  void marshalArguments(cdrStream&);
  void unmarshalArguments(cdrStream&);

    
  
  ::CORBA::String_var arg_0_;
  const char* arg_0;
  ::CORBA::Boolean arg_1;
};

void _0RL_cd_14edc9663ea08cf8_20000000::marshalArguments(cdrStream& _n)
{
  _n.marshalString(arg_0,0);
  _n.marshalBoolean(arg_1);

}

void _0RL_cd_14edc9663ea08cf8_20000000::unmarshalArguments(cdrStream& _n)
{
  arg_0_ = _n.unmarshalString(0);
  arg_0 = arg_0_.in();
  arg_1 = _n.unmarshalBoolean();

}

// Local call call-back function.
static void
_0RL_lcfn_14edc9663ea08cf8_30000000(omniCallDescriptor* cd, omniServant* svnt)
{
  _0RL_cd_14edc9663ea08cf8_20000000* tcd = (_0RL_cd_14edc9663ea08cf8_20000000*)cd;
  _impl_MessageSendListener* impl = (_impl_MessageSendListener*) svnt->_ptrToInterface(MessageSendListener::_PD_repoId);
  impl->OnStop(tcd->arg_0, tcd->arg_1);


}

void _objref_MessageSendListener::OnStop(const char* id, ::CORBA::Boolean success)
{
  _0RL_cd_14edc9663ea08cf8_20000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_30000000, "OnStop", 7);
  _call_desc.arg_0 = id;
  _call_desc.arg_1 = success;

  _invoke(_call_desc);



}
_pof_MessageSendListener::~_pof_MessageSendListener() {}


omniObjRef*
_pof_MessageSendListener::newObjRef(omniIOR* ior, omniIdentity* id)
{
  return new ::_objref_MessageSendListener(ior, id);
}


::CORBA::Boolean
_pof_MessageSendListener::is_a(const char* id) const
{
  if( omni::ptrStrMatch(id, ::MessageSendListener::_PD_repoId) )
    return 1;
  
  return 0;
}

const _pof_MessageSendListener _the_pof_MessageSendListener;

_impl_MessageSendListener::~_impl_MessageSendListener() {}


::CORBA::Boolean
_impl_MessageSendListener::_dispatch(omniCallHandle& _handle)
{
  const char* op = _handle.operation_name();

  if( omni::strMatch(op, "OnStop") ) {

    _0RL_cd_14edc9663ea08cf8_20000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_30000000, "OnStop", 7, 1);
    
    _handle.upcall(this,_call_desc);
    return 1;
  }


  return 0;
}

void*
_impl_MessageSendListener::_ptrToInterface(const char* id)
{
  if( id == ::MessageSendListener::_PD_repoId )
    return (::_impl_MessageSendListener*) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (void*) 1;

  if( omni::strMatch(id, ::MessageSendListener::_PD_repoId) )
    return (::_impl_MessageSendListener*) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (void*) 1;
  return 0;
}

const char*
_impl_MessageSendListener::_mostDerivedRepoId()
{
  return ::MessageSendListener::_PD_repoId;
}

MessageComposeService_ptr MessageComposeService_Helper::_nil() {
  return ::MessageComposeService::_nil();
}

::CORBA::Boolean MessageComposeService_Helper::is_nil(::MessageComposeService_ptr p) {
  return ::CORBA::is_nil(p);

}

void MessageComposeService_Helper::release(::MessageComposeService_ptr p) {
  ::CORBA::release(p);
}

void MessageComposeService_Helper::marshalObjRef(::MessageComposeService_ptr obj, cdrStream& s) {
  ::MessageComposeService::_marshalObjRef(obj, s);
}

MessageComposeService_ptr MessageComposeService_Helper::unmarshalObjRef(cdrStream& s) {
  return ::MessageComposeService::_unmarshalObjRef(s);
}

void MessageComposeService_Helper::duplicate(::MessageComposeService_ptr obj) {
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
}

MessageComposeService_ptr
MessageComposeService::_duplicate(::MessageComposeService_ptr obj)
{
  if( obj && !obj->_NP_is_nil() )  omni::duplicateObjRef(obj);
  return obj;
}

MessageComposeService_ptr
MessageComposeService::_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_realNarrow(_PD_repoId);
  return e ? e : _nil();
}


MessageComposeService_ptr
MessageComposeService::_unchecked_narrow(::CORBA::Object_ptr obj)
{
  if( !obj || obj->_NP_is_nil() || obj->_NP_is_pseudo() ) return _nil();
  _ptr_type e = (_ptr_type) obj->_PR_getobj()->_uncheckedNarrow(_PD_repoId);
  return e ? e : _nil();
}

MessageComposeService_ptr
MessageComposeService::_nil()
{
#ifdef OMNI_UNLOADABLE_STUBS
  static _objref_MessageComposeService _the_nil_obj;
  return &_the_nil_obj;
#else
  static _objref_MessageComposeService* _the_nil_ptr = 0;
  if( !_the_nil_ptr ) {
    omni::nilRefLock().lock();
    if( !_the_nil_ptr ) {
      _the_nil_ptr = new _objref_MessageComposeService;
      registerNilCorbaObject(_the_nil_ptr);
    }
    omni::nilRefLock().unlock();
  }
  return _the_nil_ptr;
#endif
}

const char* MessageComposeService::_PD_repoId = "IDL:MessageComposeService:1.0";


_objref_MessageComposeService::~_objref_MessageComposeService() {
  
}


_objref_MessageComposeService::_objref_MessageComposeService(omniIOR* ior, omniIdentity* id) :
   omniObjRef(::MessageComposeService::_PD_repoId, ior, id, 1)
   
   
{
  _PR_setobj(this);
}

void*
_objref_MessageComposeService::_ptrToObjRef(const char* id)
{
  if( id == ::MessageComposeService::_PD_repoId )
    return (::MessageComposeService_ptr) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (::CORBA::Object_ptr) this;

  if( omni::strMatch(id, ::MessageComposeService::_PD_repoId) )
    return (::MessageComposeService_ptr) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (::CORBA::Object_ptr) this;

  return 0;
}

// Proxy call descriptor class. Mangled signature:
//  void_i_cCAccount_i_cCMessage_i_cMessageSendListener_i_cboolean_e_cCInternalServerException
class _0RL_cd_14edc9663ea08cf8_40000000
  : public omniCallDescriptor
{
public:
  inline _0RL_cd_14edc9663ea08cf8_40000000(LocalCallFn lcfn,const char* op_,size_t oplen,_CORBA_Boolean upcall=0):
     omniCallDescriptor(lcfn, op_, oplen, 0, _user_exns, 1, upcall)
  {
    
  }
  
  void marshalArguments(cdrStream&);
  void unmarshalArguments(cdrStream&);

    
  void userException(cdrStream&,_OMNI_NS(IOP_C)*,const char*);
  static const char* const _user_exns[];

  CAccount_var arg_0_;
  const CAccount* arg_0;
  CMessage_var arg_1_;
  const CMessage* arg_1;
  MessageSendListener_var arg_2_;
  MessageSendListener_ptr arg_2;
  ::CORBA::Boolean arg_3;
};

void _0RL_cd_14edc9663ea08cf8_40000000::marshalArguments(cdrStream& _n)
{
  (const CAccount&) *arg_0 >>= _n;
  (const CMessage&) *arg_1 >>= _n;
  MessageSendListener::_marshalObjRef(arg_2,_n);
  _n.marshalBoolean(arg_3);

}

void _0RL_cd_14edc9663ea08cf8_40000000::unmarshalArguments(cdrStream& _n)
{
  arg_0_ = new CAccount;
  (CAccount&)arg_0_ <<= _n;
  arg_0 = &arg_0_.in();
  arg_1_ = new CMessage;
  (CMessage&)arg_1_ <<= _n;
  arg_1 = &arg_1_.in();
  arg_2_ = MessageSendListener::_unmarshalObjRef(_n);
  arg_2 = arg_2_.in();
  arg_3 = _n.unmarshalBoolean();

}

const char* const _0RL_cd_14edc9663ea08cf8_40000000::_user_exns[] = {
  CInternalServerException::_PD_repoId
};

void _0RL_cd_14edc9663ea08cf8_40000000::userException(cdrStream& s, _OMNI_NS(IOP_C)* iop_client, const char* repoId)
{
  if ( omni::strMatch(repoId, CInternalServerException::_PD_repoId) ) {
    CInternalServerException _ex;
    _ex <<= s;
    if (iop_client) iop_client->RequestCompleted();
    throw _ex;
  }


  else {
    if (iop_client) iop_client->RequestCompleted(1);
    OMNIORB_THROW(UNKNOWN,UNKNOWN_UserException,
                  (::CORBA::CompletionStatus)s.completion());
  }
}

// Local call call-back function.
static void
_0RL_lcfn_14edc9663ea08cf8_50000000(omniCallDescriptor* cd, omniServant* svnt)
{
  _0RL_cd_14edc9663ea08cf8_40000000* tcd = (_0RL_cd_14edc9663ea08cf8_40000000*)cd;
  _impl_MessageComposeService* impl = (_impl_MessageComposeService*) svnt->_ptrToInterface(MessageComposeService::_PD_repoId);
#ifdef HAS_Cplusplus_catch_exception_by_base
  impl->SendMessage(*tcd->arg_0, *tcd->arg_1, tcd->arg_2, tcd->arg_3);
#else
  if (!cd->is_upcall())
    impl->SendMessage(*tcd->arg_0, *tcd->arg_1, tcd->arg_2, tcd->arg_3);
  else {
    try {
      impl->SendMessage(*tcd->arg_0, *tcd->arg_1, tcd->arg_2, tcd->arg_3);
    }
    catch(CInternalServerException& ex) {
      throw omniORB::StubUserException(ex._NP_duplicate());
    }


  }
#endif


}

void _objref_MessageComposeService::SendMessage(const CAccount& p_account, const CMessage& p_message, MessageSendListener_ptr p_listener, ::CORBA::Boolean openComposeWindowOnBadFormat)
{
  _0RL_cd_14edc9663ea08cf8_40000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_50000000, "SendMessage", 12);
  _call_desc.arg_0 = &(CAccount&) p_account;
  _call_desc.arg_1 = &(CMessage&) p_message;
  _call_desc.arg_2 = p_listener;
  _call_desc.arg_3 = openComposeWindowOnBadFormat;

  _invoke(_call_desc);



}
_pof_MessageComposeService::~_pof_MessageComposeService() {}


omniObjRef*
_pof_MessageComposeService::newObjRef(omniIOR* ior, omniIdentity* id)
{
  return new ::_objref_MessageComposeService(ior, id);
}


::CORBA::Boolean
_pof_MessageComposeService::is_a(const char* id) const
{
  if( omni::ptrStrMatch(id, ::MessageComposeService::_PD_repoId) )
    return 1;
  
  return 0;
}

const _pof_MessageComposeService _the_pof_MessageComposeService;

_impl_MessageComposeService::~_impl_MessageComposeService() {}


::CORBA::Boolean
_impl_MessageComposeService::_dispatch(omniCallHandle& _handle)
{
  const char* op = _handle.operation_name();

  if( omni::strMatch(op, "SendMessage") ) {

    _0RL_cd_14edc9663ea08cf8_40000000 _call_desc(_0RL_lcfn_14edc9663ea08cf8_50000000, "SendMessage", 12, 1);
    
    _handle.upcall(this,_call_desc);
    return 1;
  }


  return 0;
}

void*
_impl_MessageComposeService::_ptrToInterface(const char* id)
{
  if( id == ::MessageComposeService::_PD_repoId )
    return (::_impl_MessageComposeService*) this;
  
  if( id == ::CORBA::Object::_PD_repoId )
    return (void*) 1;

  if( omni::strMatch(id, ::MessageComposeService::_PD_repoId) )
    return (::_impl_MessageComposeService*) this;
  
  if( omni::strMatch(id, ::CORBA::Object::_PD_repoId) )
    return (void*) 1;
  return 0;
}

const char*
_impl_MessageComposeService::_mostDerivedRepoId()
{
  return ::MessageComposeService::_PD_repoId;
}

POA_AccountService::~POA_AccountService() {}

POA_MessageSendListener::~POA_MessageSendListener() {}

POA_MessageComposeService::~POA_MessageComposeService() {}

