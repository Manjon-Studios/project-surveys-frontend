import { CommonModule } from '@angular/common';
import {Component, inject, OnInit, forwardRef, Input, Inject, ViewEncapsulation} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, Validators } from '@angular/forms';
import { CONFIG_TOKEN } from '../question-host/question-host.component';

export interface ISingleChoiceGlobalConfiguration {
  options: ISingleChoiceConfiguration[];
  required?: boolean;
}

export interface ISingleChoiceConfiguration {
  label: string;
  value: string;
  required?: boolean;
}

@Component({
  selector: 'single-choice',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './single-choice.component.html',
  styleUrl: './single-choice.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleChoiceComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SingleChoiceComponent implements OnInit, ControlValueAccessor {
  private _config = inject(CONFIG_TOKEN);
  public configuration!: ISingleChoiceGlobalConfiguration;
  public time: number = Date.now();

  public formControl!: FormControl;
  selectedValue: string = '';

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    @Inject(FormControl) private injectedFormControl: FormControl
  ) {}

  ngOnInit(): void {
    this.configuration = this._config as ISingleChoiceGlobalConfiguration;
    this.formControl = this.injectedFormControl;

    if (!this.formControl) {
      console.warn('SingleChoiceComponent: No FormControl was provided');
    }else {
      this.applyValidations();
    }
  }

  generateIdentify(value: string): string {
    return (this.constructor.name + value + this.time).trim();
  }

  writeValue(value: string): void {
    this.selectedValue = value;
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

  onSelectionChange(value: string): void {
    this.selectedValue = value;

    if (this.formControl) {
      this.formControl.markAsTouched();
      this.formControl.markAsDirty();
      this.formControl.setValue(value);
    } else {
      console.error('SingleChoiceComponent: formControl is undefined');
    }

    this.onChange(value);
    this.onTouched();
  }

  private applyValidations(): void {
    if (!this.formControl) return;

    const validators = [];

    if (this.configuration?.required) {
      validators.push(Validators.required);
    }

    this.formControl.setValidators(validators);
    this.formControl.updateValueAndValidity();
  }
}
