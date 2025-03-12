import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ValidationErrors, Validator } from '@angular/forms';

export interface IMINMAX {
  min: number,
  max?: number
}

@Component({
  selector: 'min-max',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './min-max.component.html',
  styleUrl: './min-max.component.scss',
  providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MinMaxComponent),
        multi: true,
      },
    ],
})
export class MinMaxComponent implements OnInit, ControlValueAccessor {
  public configuration: IMINMAX = {
    min: 1,
  };

  onChange: (value: IMINMAX) => void = () => {};
  onTouched: () => void = () => { };

  constructor(
  ) {}

  ngOnInit(): void {
  }

  writeValue(value: IMINMAX): void {
    this.configuration = value || {} as IMINMAX;
  }

  registerOnChange(fn: (value: IMINMAX) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onChangeMinValue(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.configuration = {
      ...this.configuration,
      min: parseInt(value)
    };

    this.onChange(this.configuration);
  }

  onChangeMaxValue(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.configuration = {
      ...this.configuration,
      max: parseInt(value)
    };

    this.onChange(this.configuration);
  }


}
