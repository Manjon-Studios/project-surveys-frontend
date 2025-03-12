import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPayloadSignIn } from './sign-up.service';

@Injectable({
  providedIn: 'root'
})
export class SignInService {
  constructor(private _http: HttpClient) {}

  signIn(payload: IPayloadSignIn) {
    this._http.post('http://localhost:3000/sign-in', payload).subscribe((e) => console.log(e));
  }
}
