import { CommonModule } from '@angular/common';
import { Component, forwardRef, Inject, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CONFIG_TOKEN } from '../question-host/question-host.component';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators} from '@angular/forms';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';

export interface ITextChoiceConfiguration {
  required?: boolean;
  maxLength?: number;
}


@Component({
  selector: 'text-choice',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './text-choice.component.html',
  styleUrl: './text-choice.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextChoiceComponent),
      multi: true,
    },
  ],
})
export class TextChoiceComponent implements OnInit, ControlValueAccessor {
  public formControl!: FormControl;
  public configuration!: ITextChoiceConfiguration;
  public value!: string;
  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };
  private _config = inject(CONFIG_TOKEN);

  constructor(
    @Inject(FormControl) private injectedFormControl: FormControl
  ) { }

  ngOnInit(): void {
    this.configuration = this._config as ITextChoiceConfiguration;
    if (this.injectedFormControl) {
      this.formControl = this.injectedFormControl;
      if (this.formControl.value) {
        this.value = this.formControl.value;
      }
      this.applyValidations();
    }
  }

  writeValue(value: string): void {
    console.log('Text Choice writeValue', value);

    this.value = value || '';
    if (this.formControl) {
      this.formControl.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const { value } = <HTMLInputElement>event.target;
    this.value = value;
    this.formControl.setValue(this.value.trim());
    this.formControl.markAsTouched();
    this.formControl.updateValueAndValidity();
    this.onChange(this.value.trim());
    console.log('Text Choice onInput', this.formControl.invalid);
  }

  private applyValidations(): void {
    if (!this.formControl) return;

    const validators = [];

    if (this.configuration?.required) {
      validators.push(Validators.required);
    }

    if (this.configuration?.maxLength) {
      validators.push(Validators.maxLength(this.configuration.maxLength));
    }

    this.formControl.setValidators(validators);
    this.formControl.updateValueAndValidity();
  }
}
