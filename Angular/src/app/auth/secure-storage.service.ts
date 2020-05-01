import { Injectable } from '@angular/core';
import { AES, SHA512, enc } from "crypto-js";
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {

  constructor() { }

  setItem(key: string, data: string):boolean{ 
    try{ 
      let sessionKey = SHA512(key).toString()
      let encryptionSessionKey = SHA512(key+this.getUserId()).toString()
      let sessionData = AES.encrypt(data, encryptionSessionKey).toString() 
      if(sessionData != null){
        localStorage.setItem(sessionKey, sessionData)
        return true
      }else{
        return false
      }
    }catch(e){
      console.log(e)
      Swal.fire('Opps', "Failed to set item", 'error')
      return false
    }
  }

  getItem(key:string):any{ 
    let sessionKey = SHA512(key).toString()
    let encryptionSessionKey = SHA512(key+this.getUserId()).toString()
    let sessionData = localStorage.getItem(sessionKey)
    let data = sessionData != null ? AES.decrypt(sessionData!, encryptionSessionKey).toString(enc.Utf8)  : null
    return data
  }

  setUserId(id:string):boolean{
    try{
      let sessionKey = SHA512("USER_ID").toString()
      let sessionData = AES.encrypt(id, sessionKey).toString() 
      localStorage.setItem(sessionKey, sessionData)
      return true
    }catch(e){
      Swal.fire('Opps', "Failed to set user ID", 'error')
      return false
    }
  }

  getUserId():string | null{
    let sessionKey = SHA512("USER_ID").toString()
    let sessionData = localStorage.getItem(sessionKey)
    let id = sessionData != null ? AES.decrypt(sessionData!, sessionKey).toString(enc.Utf8) : null 
    return id;
  }

  setAuthToken(id:string):boolean{
    try{
      let sessionKey = SHA512("USER_TOKEN").toString()
      let sessionData = AES.encrypt(id, sessionKey).toString() 
      localStorage.setItem(sessionKey, sessionData)
      return true
    }catch(e){
      Swal.fire('Opps', "Failed to set user ID", 'error')
      return false
    }
  }

  getAuthToken():string | null{
    let sessionKey = SHA512("USER_TOKEN").toString()
    let sessionData = localStorage.getItem(sessionKey)
    let id = sessionData != null ? AES.decrypt(sessionData!, sessionKey).toString(enc.Utf8) : null 
    return id;
  }

  removeItem(key:string):boolean{
    try{
      let sessionKey = SHA512(key).toString()
      localStorage.removeItem(sessionKey)
      return true
    }catch(e){
      Swal.fire('Opps', "Failed to remove item", 'error')
      return false
    }
  }
}
