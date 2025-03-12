import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IPayloadSignIn } from '../../../services/sign-up.service';
import { SignInService } from '../../../services/sign-in.service';

@Component({
  selector: 'login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private signInService: SignInService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      'email': ['', [Validators.email, Validators.required]],
      'password': ['', [Validators.required]],
    })
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if(!this.formGroup.invalid) {
      this.signInService.signIn(this.formGroup.value as IPayloadSignIn);
    }
  }
}
