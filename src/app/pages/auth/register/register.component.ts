import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPayloadSignIn, SignUpService } from '../../../services/sign-up.service';

@Component({
  selector: 'register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private signUpService: SignUpService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      'name': ['', [Validators.required]],
      'email': ['', [Validators.email, Validators.required]],
      'password': ['', [Validators.required]],
    })
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if(!this.formGroup.invalid) {
      this.signUpService.signIn(this.formGroup.value as IPayloadSignIn);
    }
  }
}
