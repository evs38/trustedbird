// This file is generated by omniidl (C++ backend)- omniORB_4_1. Do not edit.
#ifndef __Services_hh__
#define __Services_hh__

#ifndef __CORBA_H_EXTERNAL_GUARD__
#include <omniORB4/CORBA.h>
#endif

#ifndef  USE_stub_in_nt_dll
# define USE_stub_in_nt_dll_NOT_DEFINED_Services
#endif
#ifndef  USE_core_stub_in_nt_dll
# define USE_core_stub_in_nt_dll_NOT_DEFINED_Services
#endif
#ifndef  USE_dyn_stub_in_nt_dll
# define USE_dyn_stub_in_nt_dll_NOT_DEFINED_Services
#endif






#ifdef USE_stub_in_nt_dll
# ifndef USE_core_stub_in_nt_dll
#  define USE_core_stub_in_nt_dll
# endif
# ifndef USE_dyn_stub_in_nt_dll
#  define USE_dyn_stub_in_nt_dll
# endif
#endif

#ifdef _core_attr
# error "A local CPP macro _core_attr has already been defined."
#else
# ifdef  USE_core_stub_in_nt_dll
#  define _core_attr _OMNIORB_NTDLL_IMPORT
# else
#  define _core_attr
# endif
#endif

#ifdef _dyn_attr
# error "A local CPP macro _dyn_attr has already been defined."
#else
# ifdef  USE_dyn_stub_in_nt_dll
#  define _dyn_attr _OMNIORB_NTDLL_IMPORT
# else
#  define _dyn_attr
# endif
#endif





class CInternalServerException : public ::CORBA::UserException {
public:
  
  ::CORBA::String_member cause;



  inline CInternalServerException() {
    pd_insertToAnyFn    = insertToAnyFn;
    pd_insertToAnyFnNCP = insertToAnyFnNCP;
  }
  CInternalServerException(const CInternalServerException&);
  CInternalServerException(const char* i_cause);
  CInternalServerException& operator=(const CInternalServerException&);
  virtual ~CInternalServerException();
  virtual void _raise() const;
  static CInternalServerException* _downcast(::CORBA::Exception*);
  static const CInternalServerException* _downcast(const ::CORBA::Exception*);
  static inline CInternalServerException* _narrow(::CORBA::Exception* _e) {
    return _downcast(_e);
  }
  
  void operator>>=(cdrStream&) const ;
  void operator<<=(cdrStream&) ;

  static _core_attr insertExceptionToAny    insertToAnyFn;
  static _core_attr insertExceptionToAnyNCP insertToAnyFnNCP;

  virtual ::CORBA::Exception* _NP_duplicate() const;

  static _core_attr const char* _PD_repoId;
  static _core_attr const char* _PD_typeId;

private:
  virtual const char* _NP_typeId() const;
  virtual const char* _NP_repoId(int*) const;
  virtual void _NP_marshal(cdrStream&) const;
};

struct CAccount {
  typedef _CORBA_ConstrType_Variable_Var<CAccount> _var_type;

  
  ::CORBA::String_member serverHostName;

  ::CORBA::String_member key;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CAccount::_var_type CAccount_var;

typedef _CORBA_ConstrType_Variable_OUT_arg< CAccount,CAccount_var > CAccount_out;

class CAccounts_var;

class CAccounts : public _CORBA_Unbounded_Sequence< CAccount >  {
public:
  typedef CAccounts_var _var_type;
  inline CAccounts() {}
  inline CAccounts(const CAccounts& _s)
    : _CORBA_Unbounded_Sequence< CAccount > (_s) {}

  inline CAccounts(_CORBA_ULong _max)
    : _CORBA_Unbounded_Sequence< CAccount > (_max) {}
  inline CAccounts(_CORBA_ULong _max, _CORBA_ULong _len, CAccount* _val, _CORBA_Boolean _rel=0)
    : _CORBA_Unbounded_Sequence< CAccount > (_max, _len, _val, _rel) {}



  inline CAccounts& operator = (const CAccounts& _s) {
    _CORBA_Unbounded_Sequence< CAccount > ::operator=(_s);
    return *this;
  }
};

class CAccounts_out;

class CAccounts_var {
public:
  inline CAccounts_var() : _pd_seq(0) {}
  inline CAccounts_var(CAccounts* _s) : _pd_seq(_s) {}
  inline CAccounts_var(const CAccounts_var& _s) {
    if( _s._pd_seq )  _pd_seq = new CAccounts(*_s._pd_seq);
    else              _pd_seq = 0;
  }
  inline ~CAccounts_var() { if( _pd_seq )  delete _pd_seq; }
    
  inline CAccounts_var& operator = (CAccounts* _s) {
    if( _pd_seq )  delete _pd_seq;
    _pd_seq = _s;
    return *this;
  }
  inline CAccounts_var& operator = (const CAccounts_var& _s) {
    if( _s._pd_seq ) {
      if( !_pd_seq )  _pd_seq = new CAccounts;
      *_pd_seq = *_s._pd_seq;
    } else if( _pd_seq ) {
      delete _pd_seq;
      _pd_seq = 0;
    }
    return *this;
  }
  inline CAccount& operator [] (_CORBA_ULong _s) {
    return (*_pd_seq)[_s];
  }



  inline CAccounts* operator -> () { return _pd_seq; }
  inline const CAccounts* operator -> () const { return _pd_seq; }
#if defined(__GNUG__)
  inline operator CAccounts& () const { return *_pd_seq; }
#else
  inline operator const CAccounts& () const { return *_pd_seq; }
  inline operator CAccounts& () { return *_pd_seq; }
#endif
    
  inline const CAccounts& in() const { return *_pd_seq; }
  inline CAccounts&       inout()    { return *_pd_seq; }
  inline CAccounts*&      out() {
    if( _pd_seq ) { delete _pd_seq; _pd_seq = 0; }
    return _pd_seq;
  }
  inline CAccounts* _retn() { CAccounts* tmp = _pd_seq; _pd_seq = 0; return tmp; }
    
  friend class CAccounts_out;
  
private:
  CAccounts* _pd_seq;
};

class CAccounts_out {
public:
  inline CAccounts_out(CAccounts*& _s) : _data(_s) { _data = 0; }
  inline CAccounts_out(CAccounts_var& _s)
    : _data(_s._pd_seq) { _s = (CAccounts*) 0; }
  inline CAccounts_out(const CAccounts_out& _s) : _data(_s._data) {}
  inline CAccounts_out& operator = (const CAccounts_out& _s) {
    _data = _s._data;
    return *this;
  }
  inline CAccounts_out& operator = (CAccounts* _s) {
    _data = _s;
    return *this;
  }
  inline operator CAccounts*&()  { return _data; }
  inline CAccounts*& ptr()       { return _data; }
  inline CAccounts* operator->() { return _data; }

  inline CAccount& operator [] (_CORBA_ULong _i) {
    return (*_data)[_i];
  }



  CAccounts*& _data;

private:
  CAccounts_out();
  CAccounts_out& operator=(const CAccounts_var&);
};

#ifndef __AccountService__
#define __AccountService__

class AccountService;
class _objref_AccountService;
class _impl_AccountService;

typedef _objref_AccountService* AccountService_ptr;
typedef AccountService_ptr AccountServiceRef;

class AccountService_Helper {
public:
  typedef AccountService_ptr _ptr_type;

  static _ptr_type _nil();
  static _CORBA_Boolean is_nil(_ptr_type);
  static void release(_ptr_type);
  static void duplicate(_ptr_type);
  static void marshalObjRef(_ptr_type, cdrStream&);
  static _ptr_type unmarshalObjRef(cdrStream&);
};

typedef _CORBA_ObjRef_Var<_objref_AccountService, AccountService_Helper> AccountService_var;
typedef _CORBA_ObjRef_OUT_arg<_objref_AccountService,AccountService_Helper > AccountService_out;

#endif

// interface AccountService
class AccountService {
public:
  // Declarations for this interface type.
  typedef AccountService_ptr _ptr_type;
  typedef AccountService_var _var_type;

  static _ptr_type _duplicate(_ptr_type);
  static _ptr_type _narrow(::CORBA::Object_ptr);
  static _ptr_type _unchecked_narrow(::CORBA::Object_ptr);
  
  static _ptr_type _nil();

  static inline void _marshalObjRef(_ptr_type, cdrStream&);

  static inline _ptr_type _unmarshalObjRef(cdrStream& s) {
    omniObjRef* o = omniObjRef::_unMarshal(_PD_repoId,s);
    if (o)
      return (_ptr_type) o->_ptrToObjRef(_PD_repoId);
    else
      return _nil();
  }

  static _core_attr const char* _PD_repoId;

  // Other IDL defined within this scope.
  
};

class _objref_AccountService :
  public virtual ::CORBA::Object,
  public virtual omniObjRef
{
public:
  CAccounts* GetAllAccounts();

  inline _objref_AccountService()  { _PR_setobj(0); }  // nil
  _objref_AccountService(omniIOR*, omniIdentity*);

protected:
  virtual ~_objref_AccountService();

  
private:
  virtual void* _ptrToObjRef(const char*);

  _objref_AccountService(const _objref_AccountService&);
  _objref_AccountService& operator = (const _objref_AccountService&);
  // not implemented

  friend class AccountService;
};

class _pof_AccountService : public _OMNI_NS(proxyObjectFactory) {
public:
  inline _pof_AccountService() : _OMNI_NS(proxyObjectFactory)(AccountService::_PD_repoId) {}
  virtual ~_pof_AccountService();

  virtual omniObjRef* newObjRef(omniIOR*,omniIdentity*);
  virtual _CORBA_Boolean is_a(const char*) const;
};

class _impl_AccountService :
  public virtual omniServant
{
public:
  virtual ~_impl_AccountService();

  virtual CAccounts* GetAllAccounts() = 0;
  
public:  // Really protected, workaround for xlC
  virtual _CORBA_Boolean _dispatch(omniCallHandle&);

private:
  virtual void* _ptrToInterface(const char*);
  virtual const char* _mostDerivedRepoId();
  
};


struct CHeader {
  typedef _CORBA_ConstrType_Variable_Var<CHeader> _var_type;

  
  ::CORBA::String_member key;

  ::CORBA::String_member value;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CHeader::_var_type CHeader_var;

typedef _CORBA_ConstrType_Variable_OUT_arg< CHeader,CHeader_var > CHeader_out;

class CHeaders_var;

class CHeaders : public _CORBA_Unbounded_Sequence< CHeader >  {
public:
  typedef CHeaders_var _var_type;
  inline CHeaders() {}
  inline CHeaders(const CHeaders& _s)
    : _CORBA_Unbounded_Sequence< CHeader > (_s) {}

  inline CHeaders(_CORBA_ULong _max)
    : _CORBA_Unbounded_Sequence< CHeader > (_max) {}
  inline CHeaders(_CORBA_ULong _max, _CORBA_ULong _len, CHeader* _val, _CORBA_Boolean _rel=0)
    : _CORBA_Unbounded_Sequence< CHeader > (_max, _len, _val, _rel) {}



  inline CHeaders& operator = (const CHeaders& _s) {
    _CORBA_Unbounded_Sequence< CHeader > ::operator=(_s);
    return *this;
  }
};

class CHeaders_out;

class CHeaders_var {
public:
  inline CHeaders_var() : _pd_seq(0) {}
  inline CHeaders_var(CHeaders* _s) : _pd_seq(_s) {}
  inline CHeaders_var(const CHeaders_var& _s) {
    if( _s._pd_seq )  _pd_seq = new CHeaders(*_s._pd_seq);
    else              _pd_seq = 0;
  }
  inline ~CHeaders_var() { if( _pd_seq )  delete _pd_seq; }
    
  inline CHeaders_var& operator = (CHeaders* _s) {
    if( _pd_seq )  delete _pd_seq;
    _pd_seq = _s;
    return *this;
  }
  inline CHeaders_var& operator = (const CHeaders_var& _s) {
    if( _s._pd_seq ) {
      if( !_pd_seq )  _pd_seq = new CHeaders;
      *_pd_seq = *_s._pd_seq;
    } else if( _pd_seq ) {
      delete _pd_seq;
      _pd_seq = 0;
    }
    return *this;
  }
  inline CHeader& operator [] (_CORBA_ULong _s) {
    return (*_pd_seq)[_s];
  }



  inline CHeaders* operator -> () { return _pd_seq; }
  inline const CHeaders* operator -> () const { return _pd_seq; }
#if defined(__GNUG__)
  inline operator CHeaders& () const { return *_pd_seq; }
#else
  inline operator const CHeaders& () const { return *_pd_seq; }
  inline operator CHeaders& () { return *_pd_seq; }
#endif
    
  inline const CHeaders& in() const { return *_pd_seq; }
  inline CHeaders&       inout()    { return *_pd_seq; }
  inline CHeaders*&      out() {
    if( _pd_seq ) { delete _pd_seq; _pd_seq = 0; }
    return _pd_seq;
  }
  inline CHeaders* _retn() { CHeaders* tmp = _pd_seq; _pd_seq = 0; return tmp; }
    
  friend class CHeaders_out;
  
private:
  CHeaders* _pd_seq;
};

class CHeaders_out {
public:
  inline CHeaders_out(CHeaders*& _s) : _data(_s) { _data = 0; }
  inline CHeaders_out(CHeaders_var& _s)
    : _data(_s._pd_seq) { _s = (CHeaders*) 0; }
  inline CHeaders_out(const CHeaders_out& _s) : _data(_s._data) {}
  inline CHeaders_out& operator = (const CHeaders_out& _s) {
    _data = _s._data;
    return *this;
  }
  inline CHeaders_out& operator = (CHeaders* _s) {
    _data = _s;
    return *this;
  }
  inline operator CHeaders*&()  { return _data; }
  inline CHeaders*& ptr()       { return _data; }
  inline CHeaders* operator->() { return _data; }

  inline CHeader& operator [] (_CORBA_ULong _i) {
    return (*_data)[_i];
  }



  CHeaders*& _data;

private:
  CHeaders_out();
  CHeaders_out& operator=(const CHeaders_var&);
};

class Addresses_var;

class Addresses : public _CORBA_Unbounded_Sequence_String {
public:
  typedef Addresses_var _var_type;
  inline Addresses() {}
  inline Addresses(const Addresses& _s)
    : _CORBA_Unbounded_Sequence_String(_s) {}

  inline Addresses(_CORBA_ULong _max)
    : _CORBA_Unbounded_Sequence_String(_max) {}
  inline Addresses(_CORBA_ULong _max, _CORBA_ULong _len, char** _val, _CORBA_Boolean _rel=0)
    : _CORBA_Unbounded_Sequence_String(_max, _len, _val, _rel) {}



  inline Addresses& operator = (const Addresses& _s) {
    _CORBA_Unbounded_Sequence_String::operator=(_s);
    return *this;
  }
};

class Addresses_out;

class Addresses_var {
public:
  inline Addresses_var() : _pd_seq(0) {}
  inline Addresses_var(Addresses* _s) : _pd_seq(_s) {}
  inline Addresses_var(const Addresses_var& _s) {
    if( _s._pd_seq )  _pd_seq = new Addresses(*_s._pd_seq);
    else              _pd_seq = 0;
  }
  inline ~Addresses_var() { if( _pd_seq )  delete _pd_seq; }
    
  inline Addresses_var& operator = (Addresses* _s) {
    if( _pd_seq )  delete _pd_seq;
    _pd_seq = _s;
    return *this;
  }
  inline Addresses_var& operator = (const Addresses_var& _s) {
    if( _s._pd_seq ) {
      if( !_pd_seq )  _pd_seq = new Addresses;
      *_pd_seq = *_s._pd_seq;
    } else if( _pd_seq ) {
      delete _pd_seq;
      _pd_seq = 0;
    }
    return *this;
  }
  inline _CORBA_String_element operator [] (_CORBA_ULong _s) {
    return (*_pd_seq)[_s];
  }



  inline Addresses* operator -> () { return _pd_seq; }
  inline const Addresses* operator -> () const { return _pd_seq; }
#if defined(__GNUG__)
  inline operator Addresses& () const { return *_pd_seq; }
#else
  inline operator const Addresses& () const { return *_pd_seq; }
  inline operator Addresses& () { return *_pd_seq; }
#endif
    
  inline const Addresses& in() const { return *_pd_seq; }
  inline Addresses&       inout()    { return *_pd_seq; }
  inline Addresses*&      out() {
    if( _pd_seq ) { delete _pd_seq; _pd_seq = 0; }
    return _pd_seq;
  }
  inline Addresses* _retn() { Addresses* tmp = _pd_seq; _pd_seq = 0; return tmp; }
    
  friend class Addresses_out;
  
private:
  Addresses* _pd_seq;
};

class Addresses_out {
public:
  inline Addresses_out(Addresses*& _s) : _data(_s) { _data = 0; }
  inline Addresses_out(Addresses_var& _s)
    : _data(_s._pd_seq) { _s = (Addresses*) 0; }
  inline Addresses_out(const Addresses_out& _s) : _data(_s._data) {}
  inline Addresses_out& operator = (const Addresses_out& _s) {
    _data = _s._data;
    return *this;
  }
  inline Addresses_out& operator = (Addresses* _s) {
    _data = _s;
    return *this;
  }
  inline operator Addresses*&()  { return _data; }
  inline Addresses*& ptr()       { return _data; }
  inline Addresses* operator->() { return _data; }

  inline _CORBA_String_element operator [] (_CORBA_ULong _i) {
    return (*_data)[_i];
  }



  Addresses*& _data;

private:
  Addresses_out();
  Addresses_out& operator=(const Addresses_var&);
};

struct CSecurity {
  typedef _CORBA_ConstrType_Fix_Var<CSecurity> _var_type;

  
  ::CORBA::Boolean isSigned;

  ::CORBA::Boolean isCrypted;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CSecurity::_var_type CSecurity_var;

typedef CSecurity& CSecurity_out;

struct CDSNType {
  typedef _CORBA_ConstrType_Fix_Var<CDSNType> _var_type;

  
  ::CORBA::Boolean isReturnFullHDRRequested;

  ::CORBA::Boolean isOnSuccessRequested;

  ::CORBA::Boolean isOnFailureRequested;

  ::CORBA::Boolean isOnDelayRequested;

  ::CORBA::Boolean isNeverRequested;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CDSNType::_var_type CDSNType_var;

typedef CDSNType& CDSNType_out;

struct CNotification {
  typedef _CORBA_ConstrType_Fix_Var<CNotification> _var_type;

  
  ::CORBA::Boolean isDSNRequested;

  CDSNType DSNType;

  ::CORBA::Boolean isMDNReadRequested;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CNotification::_var_type CNotification_var;

typedef CNotification& CNotification_out;

struct CAttachment {
  typedef _CORBA_ConstrType_Variable_Var<CAttachment> _var_type;

  
  ::CORBA::String_member dirPath;

  ::CORBA::String_member fileName;

  ::CORBA::String_member mimeType;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CAttachment::_var_type CAttachment_var;

typedef _CORBA_ConstrType_Variable_OUT_arg< CAttachment,CAttachment_var > CAttachment_out;

class CAttachments_var;

class CAttachments : public _CORBA_Unbounded_Sequence< CAttachment >  {
public:
  typedef CAttachments_var _var_type;
  inline CAttachments() {}
  inline CAttachments(const CAttachments& _s)
    : _CORBA_Unbounded_Sequence< CAttachment > (_s) {}

  inline CAttachments(_CORBA_ULong _max)
    : _CORBA_Unbounded_Sequence< CAttachment > (_max) {}
  inline CAttachments(_CORBA_ULong _max, _CORBA_ULong _len, CAttachment* _val, _CORBA_Boolean _rel=0)
    : _CORBA_Unbounded_Sequence< CAttachment > (_max, _len, _val, _rel) {}



  inline CAttachments& operator = (const CAttachments& _s) {
    _CORBA_Unbounded_Sequence< CAttachment > ::operator=(_s);
    return *this;
  }
};

class CAttachments_out;

class CAttachments_var {
public:
  inline CAttachments_var() : _pd_seq(0) {}
  inline CAttachments_var(CAttachments* _s) : _pd_seq(_s) {}
  inline CAttachments_var(const CAttachments_var& _s) {
    if( _s._pd_seq )  _pd_seq = new CAttachments(*_s._pd_seq);
    else              _pd_seq = 0;
  }
  inline ~CAttachments_var() { if( _pd_seq )  delete _pd_seq; }
    
  inline CAttachments_var& operator = (CAttachments* _s) {
    if( _pd_seq )  delete _pd_seq;
    _pd_seq = _s;
    return *this;
  }
  inline CAttachments_var& operator = (const CAttachments_var& _s) {
    if( _s._pd_seq ) {
      if( !_pd_seq )  _pd_seq = new CAttachments;
      *_pd_seq = *_s._pd_seq;
    } else if( _pd_seq ) {
      delete _pd_seq;
      _pd_seq = 0;
    }
    return *this;
  }
  inline CAttachment& operator [] (_CORBA_ULong _s) {
    return (*_pd_seq)[_s];
  }



  inline CAttachments* operator -> () { return _pd_seq; }
  inline const CAttachments* operator -> () const { return _pd_seq; }
#if defined(__GNUG__)
  inline operator CAttachments& () const { return *_pd_seq; }
#else
  inline operator const CAttachments& () const { return *_pd_seq; }
  inline operator CAttachments& () { return *_pd_seq; }
#endif
    
  inline const CAttachments& in() const { return *_pd_seq; }
  inline CAttachments&       inout()    { return *_pd_seq; }
  inline CAttachments*&      out() {
    if( _pd_seq ) { delete _pd_seq; _pd_seq = 0; }
    return _pd_seq;
  }
  inline CAttachments* _retn() { CAttachments* tmp = _pd_seq; _pd_seq = 0; return tmp; }
    
  friend class CAttachments_out;
  
private:
  CAttachments* _pd_seq;
};

class CAttachments_out {
public:
  inline CAttachments_out(CAttachments*& _s) : _data(_s) { _data = 0; }
  inline CAttachments_out(CAttachments_var& _s)
    : _data(_s._pd_seq) { _s = (CAttachments*) 0; }
  inline CAttachments_out(const CAttachments_out& _s) : _data(_s._data) {}
  inline CAttachments_out& operator = (const CAttachments_out& _s) {
    _data = _s._data;
    return *this;
  }
  inline CAttachments_out& operator = (CAttachments* _s) {
    _data = _s;
    return *this;
  }
  inline operator CAttachments*&()  { return _data; }
  inline CAttachments*& ptr()       { return _data; }
  inline CAttachments* operator->() { return _data; }

  inline CAttachment& operator [] (_CORBA_ULong _i) {
    return (*_data)[_i];
  }



  CAttachments*& _data;

private:
  CAttachments_out();
  CAttachments_out& operator=(const CAttachments_var&);
};

struct CMessage {
  typedef _CORBA_ConstrType_Variable_Var<CMessage> _var_type;

  
  Addresses recipients_to;

  Addresses recipients_cc;

  Addresses recipients_bcc;

  CNotification notification;

  ::CORBA::String_member subject;

  ::CORBA::String_member body;

  ::CORBA::String_member uuid;

  CSecurity security;

  CHeaders p_headers;

  CAttachments p_attachments;



  void operator>>= (cdrStream &) const;
  void operator<<= (cdrStream &);
};

typedef CMessage::_var_type CMessage_var;

typedef _CORBA_ConstrType_Variable_OUT_arg< CMessage,CMessage_var > CMessage_out;

#ifndef __MessageSendListener__
#define __MessageSendListener__

class MessageSendListener;
class _objref_MessageSendListener;
class _impl_MessageSendListener;

typedef _objref_MessageSendListener* MessageSendListener_ptr;
typedef MessageSendListener_ptr MessageSendListenerRef;

class MessageSendListener_Helper {
public:
  typedef MessageSendListener_ptr _ptr_type;

  static _ptr_type _nil();
  static _CORBA_Boolean is_nil(_ptr_type);
  static void release(_ptr_type);
  static void duplicate(_ptr_type);
  static void marshalObjRef(_ptr_type, cdrStream&);
  static _ptr_type unmarshalObjRef(cdrStream&);
};

typedef _CORBA_ObjRef_Var<_objref_MessageSendListener, MessageSendListener_Helper> MessageSendListener_var;
typedef _CORBA_ObjRef_OUT_arg<_objref_MessageSendListener,MessageSendListener_Helper > MessageSendListener_out;

#endif

// interface MessageSendListener
class MessageSendListener {
public:
  // Declarations for this interface type.
  typedef MessageSendListener_ptr _ptr_type;
  typedef MessageSendListener_var _var_type;

  static _ptr_type _duplicate(_ptr_type);
  static _ptr_type _narrow(::CORBA::Object_ptr);
  static _ptr_type _unchecked_narrow(::CORBA::Object_ptr);
  
  static _ptr_type _nil();

  static inline void _marshalObjRef(_ptr_type, cdrStream&);

  static inline _ptr_type _unmarshalObjRef(cdrStream& s) {
    omniObjRef* o = omniObjRef::_unMarshal(_PD_repoId,s);
    if (o)
      return (_ptr_type) o->_ptrToObjRef(_PD_repoId);
    else
      return _nil();
  }

  static _core_attr const char* _PD_repoId;

  // Other IDL defined within this scope.
  
};

class _objref_MessageSendListener :
  public virtual ::CORBA::Object,
  public virtual omniObjRef
{
public:
  void OnStop(const char* id, ::CORBA::Boolean success);

  inline _objref_MessageSendListener()  { _PR_setobj(0); }  // nil
  _objref_MessageSendListener(omniIOR*, omniIdentity*);

protected:
  virtual ~_objref_MessageSendListener();

  
private:
  virtual void* _ptrToObjRef(const char*);

  _objref_MessageSendListener(const _objref_MessageSendListener&);
  _objref_MessageSendListener& operator = (const _objref_MessageSendListener&);
  // not implemented

  friend class MessageSendListener;
};

class _pof_MessageSendListener : public _OMNI_NS(proxyObjectFactory) {
public:
  inline _pof_MessageSendListener() : _OMNI_NS(proxyObjectFactory)(MessageSendListener::_PD_repoId) {}
  virtual ~_pof_MessageSendListener();

  virtual omniObjRef* newObjRef(omniIOR*,omniIdentity*);
  virtual _CORBA_Boolean is_a(const char*) const;
};

class _impl_MessageSendListener :
  public virtual omniServant
{
public:
  virtual ~_impl_MessageSendListener();

  virtual void OnStop(const char* id, ::CORBA::Boolean success) = 0;
  
public:  // Really protected, workaround for xlC
  virtual _CORBA_Boolean _dispatch(omniCallHandle&);

private:
  virtual void* _ptrToInterface(const char*);
  virtual const char* _mostDerivedRepoId();
  
};


#ifndef __MessageComposeService__
#define __MessageComposeService__

class MessageComposeService;
class _objref_MessageComposeService;
class _impl_MessageComposeService;

typedef _objref_MessageComposeService* MessageComposeService_ptr;
typedef MessageComposeService_ptr MessageComposeServiceRef;

class MessageComposeService_Helper {
public:
  typedef MessageComposeService_ptr _ptr_type;

  static _ptr_type _nil();
  static _CORBA_Boolean is_nil(_ptr_type);
  static void release(_ptr_type);
  static void duplicate(_ptr_type);
  static void marshalObjRef(_ptr_type, cdrStream&);
  static _ptr_type unmarshalObjRef(cdrStream&);
};

typedef _CORBA_ObjRef_Var<_objref_MessageComposeService, MessageComposeService_Helper> MessageComposeService_var;
typedef _CORBA_ObjRef_OUT_arg<_objref_MessageComposeService,MessageComposeService_Helper > MessageComposeService_out;

#endif

// interface MessageComposeService
class MessageComposeService {
public:
  // Declarations for this interface type.
  typedef MessageComposeService_ptr _ptr_type;
  typedef MessageComposeService_var _var_type;

  static _ptr_type _duplicate(_ptr_type);
  static _ptr_type _narrow(::CORBA::Object_ptr);
  static _ptr_type _unchecked_narrow(::CORBA::Object_ptr);
  
  static _ptr_type _nil();

  static inline void _marshalObjRef(_ptr_type, cdrStream&);

  static inline _ptr_type _unmarshalObjRef(cdrStream& s) {
    omniObjRef* o = omniObjRef::_unMarshal(_PD_repoId,s);
    if (o)
      return (_ptr_type) o->_ptrToObjRef(_PD_repoId);
    else
      return _nil();
  }

  static _core_attr const char* _PD_repoId;

  // Other IDL defined within this scope.
  
};

class _objref_MessageComposeService :
  public virtual ::CORBA::Object,
  public virtual omniObjRef
{
public:
  void SendMessage(const CAccount& p_account, const CMessage& p_message, MessageSendListener_ptr p_listener, ::CORBA::Boolean openComposeWindowOnBadFormat);

  inline _objref_MessageComposeService()  { _PR_setobj(0); }  // nil
  _objref_MessageComposeService(omniIOR*, omniIdentity*);

protected:
  virtual ~_objref_MessageComposeService();

  
private:
  virtual void* _ptrToObjRef(const char*);

  _objref_MessageComposeService(const _objref_MessageComposeService&);
  _objref_MessageComposeService& operator = (const _objref_MessageComposeService&);
  // not implemented

  friend class MessageComposeService;
};

class _pof_MessageComposeService : public _OMNI_NS(proxyObjectFactory) {
public:
  inline _pof_MessageComposeService() : _OMNI_NS(proxyObjectFactory)(MessageComposeService::_PD_repoId) {}
  virtual ~_pof_MessageComposeService();

  virtual omniObjRef* newObjRef(omniIOR*,omniIdentity*);
  virtual _CORBA_Boolean is_a(const char*) const;
};

class _impl_MessageComposeService :
  public virtual omniServant
{
public:
  virtual ~_impl_MessageComposeService();

  virtual void SendMessage(const CAccount& p_account, const CMessage& p_message, MessageSendListener_ptr p_listener, ::CORBA::Boolean openComposeWindowOnBadFormat) = 0;
  
public:  // Really protected, workaround for xlC
  virtual _CORBA_Boolean _dispatch(omniCallHandle&);

private:
  virtual void* _ptrToInterface(const char*);
  virtual const char* _mostDerivedRepoId();
  
};




class POA_AccountService :
  public virtual _impl_AccountService,
  public virtual ::PortableServer::ServantBase
{
public:
  virtual ~POA_AccountService();

  inline ::AccountService_ptr _this() {
    return (::AccountService_ptr) _do_this(::AccountService::_PD_repoId);
  }
};

class POA_MessageSendListener :
  public virtual _impl_MessageSendListener,
  public virtual ::PortableServer::ServantBase
{
public:
  virtual ~POA_MessageSendListener();

  inline ::MessageSendListener_ptr _this() {
    return (::MessageSendListener_ptr) _do_this(::MessageSendListener::_PD_repoId);
  }
};

class POA_MessageComposeService :
  public virtual _impl_MessageComposeService,
  public virtual ::PortableServer::ServantBase
{
public:
  virtual ~POA_MessageComposeService();

  inline ::MessageComposeService_ptr _this() {
    return (::MessageComposeService_ptr) _do_this(::MessageComposeService::_PD_repoId);
  }
};







#undef _core_attr
#undef _dyn_attr



inline void
AccountService::_marshalObjRef(::AccountService_ptr obj, cdrStream& s) {
  omniObjRef::_marshal(obj->_PR_getobj(),s);
}


inline void
MessageSendListener::_marshalObjRef(::MessageSendListener_ptr obj, cdrStream& s) {
  omniObjRef::_marshal(obj->_PR_getobj(),s);
}


inline void
MessageComposeService::_marshalObjRef(::MessageComposeService_ptr obj, cdrStream& s) {
  omniObjRef::_marshal(obj->_PR_getobj(),s);
}




#ifdef   USE_stub_in_nt_dll_NOT_DEFINED_Services
# undef  USE_stub_in_nt_dll
# undef  USE_stub_in_nt_dll_NOT_DEFINED_Services
#endif
#ifdef   USE_core_stub_in_nt_dll_NOT_DEFINED_Services
# undef  USE_core_stub_in_nt_dll
# undef  USE_core_stub_in_nt_dll_NOT_DEFINED_Services
#endif
#ifdef   USE_dyn_stub_in_nt_dll_NOT_DEFINED_Services
# undef  USE_dyn_stub_in_nt_dll
# undef  USE_dyn_stub_in_nt_dll_NOT_DEFINED_Services
#endif

#endif  // __Services_hh__

