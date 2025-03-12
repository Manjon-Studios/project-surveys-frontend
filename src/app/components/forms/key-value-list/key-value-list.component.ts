import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultipleChoiceComponent } from '../../multiple-choice/multiple-choice.component';
import { CommonModule } from '@angular/common';

export interface ISingleFormOptions {
  label: string;
  value: string;
}

@Component({
  selector: 'key-value-list',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './key-value-list.component.html',
  styleUrl: './key-value-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KeyValueListComponent),
      multi: true,
    },
  ],
})
export class KeyValueListComponent implements OnInit, ControlValueAccessor {

  @Input() controls!: FormGroup;
  @Input() options!: ISingleFormOptions;
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();

  public selectedValues!: ISingleFormOptions;

  onChange: (value: ISingleFormOptions) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}


  get labelControl() {
    return this.controls.get('label');
  }

  get valueControl() {
    return this.controls.get('value');
  }


  writeValue(value: ISingleFormOptions | null): void {
    this.selectedValues = value ?? { label: '', value: '' };
  }

  registerOnChange(fn: (value: ISingleFormOptions) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
