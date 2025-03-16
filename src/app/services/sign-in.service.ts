import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPayloadSignIn } from './sign-up.service';

@Injectable({
  providedIn: 'root'
})
export class SignInService {
  constructor(private _http: HttpClient) {}

  signIn(payload: IPayloadSignIn) {
    this._http.post('https://survey-server.albertmanjon.es/sign-in', payload).subscribe((e) => console.log(e));
  }
}
