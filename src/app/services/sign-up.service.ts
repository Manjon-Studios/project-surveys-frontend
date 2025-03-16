import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface IPayloadSignIn {
  email: string,
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private _http: HttpClient) {}

  signIn(payload: IPayloadSignIn) {
    this._http.post('https://survey-server.albertmanjon.es/sign-up', payload).subscribe((e) => console.log(e));
  }
}
