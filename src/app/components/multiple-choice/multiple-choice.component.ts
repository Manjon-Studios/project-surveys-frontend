import {
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
  forwardRef,
  Input,
  Inject,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CONFIG_TOKEN } from '../question-host/question-host.component';

export interface IMultipleChoiceConfiguration {
  label: string;
  value: string;
  max?: number;
  min?: number;
}

export interface IMultipleChoiceGlobalConfiguration {
  options: IMultipleChoiceConfiguration[];
  required?: boolean;
  minSelections?: number;
}

@Component({
  selector: 'multiple-choice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice.component.html',
  styleUrl: './multiple-choice.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleChoiceComponent),
      multi: true,
    },
  ],
})
export class MultipleChoiceComponent implements OnInit, ControlValueAccessor {
  private _config = inject(CONFIG_TOKEN);
  public configuration!: IMultipleChoiceGlobalConfiguration;

  @Input() formControl!: FormControl;
  selectedValues: string[] = [];

  onChange: (value: string[]) => void = () => { };
  onTouched: () => void = () => { };

  constructor(@Inject(FormControl) private injectedFormControl: FormControl) { }

  ngOnInit(): void {
    this.configuration = this._config as IMultipleChoiceGlobalConfiguration;
    if (this.injectedFormControl) {
      this.formControl = this.injectedFormControl;
      this.applyValidations();
    }
  }

  writeValue(value: string[]): void {
    this.selectedValues = value || [];

    if (this.formControl) {
      this.formControl.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onCheckboxChange(value: string, event: Event): void {
    const { checked } = event.target as HTMLInputElement;
    this.selectedValues = checked
      ? [...this.selectedValues, value]
      : this.selectedValues.filter((v) => v !== value);

    this.formControl.setValue(this.selectedValues);
    this.formControl.markAsTouched();
    this.formControl.updateValueAndValidity();
    this.onChange(this.selectedValues);
  }

  private applyValidations(): void {
    if (!this.formControl) return;

    const validators = [];

    if (this.configuration?.required) {
      validators.push(Validators.required);
    }

    if (this.configuration?.minSelections) {
      validators.push(Validators.minLength(this.configuration.minSelections));
    }

    this.formControl.setValidators(validators);
    this.formControl.updateValueAndValidity();
  }
}
