import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'text-editable',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './text-editable.component.html',
  styleUrl: './text-editable.component.scss'
})
export class TextEditableComponent {
  @ViewChild('input', { static: true }) input!: ElementRef;
  @Input() label!: string;

  @Output() outputLabelChange: EventEmitter<string> = new EventEmitter<string>();

  public isEnabledModeEditabled!: boolean;

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  onEnabledModeEditabled(): void {
    this.isEnabledModeEditabled = !this.isEnabledModeEditabled;
    this.cdr.detectChanges();
    this.input.nativeElement.focus();
  }
  onBlurModeEditabled(): void {

    if(this.label.toLowerCase() !== this.input.nativeElement.value.toLowerCase()) {
      this.outputLabelChange.emit(this.input.nativeElement.value)
    }

    this.input.nativeElement.blur();
    this.isEnabledModeEditabled = false;
  }
}
