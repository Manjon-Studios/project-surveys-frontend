import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'survey-edit-layout',
  imports: [],
  standalone: true,
  templateUrl: './survey-edit-layout.component.html',
  styleUrl: './survey-edit-layout.component.scss'
})
export class SurveyEditLayoutComponent implements OnInit {
  @Input() form!: FormGroup;

  ngOnInit(): void {
    this._init();
  }

  private _init() {
    if(this.form) {
      this._addControl('title', '', [Validators.required]);
      this._addControl('description', '', []);
    }
  }

  private _addControl(
    name: string,
    value: unknown,
    validators: ValidatorFn[]
  ) {
    this.form.addControl(name, new FormControl(value, validators))
  }
}
