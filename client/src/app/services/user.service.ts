import { Injectable } from '@angular/core';
import 'rxjs/Rx'
import { User } from "../models/user";
import { GLOBAL } from "./global";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs/Observable';


@Injectable()
export class UserService {
  public url:string

  constructor(public _http:HttpClient) {
    this.url = GLOBAL.url
   }

   register(user: User):Observable<any>{
     let body = JSON.stringify(user)
     let header = new HttpHeaders().set('Content-Type','application/json')
     return this._http.post(this.url+'register',body,{headers:header})
   }

}
