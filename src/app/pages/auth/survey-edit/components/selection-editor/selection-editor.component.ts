import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

export interface OptionWithId {
  value: string;
  id: string;
};

@Component({
  selector: 'ui-selection-editor',
  imports: [
    CommonModule,
  ],
  templateUrl: './selection-editor.component.html',
  styleUrl: './selection-editor.component.scss'
})
export class SelectionEditorComponent implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef;

  @Input()
  set options(options: string[]) {
   this._options = this.mappingOptionsToOptionWithId(options);
  }
  get options(): OptionWithId[] {
    return this._options;
  }

  private _options: OptionWithId[] = [];

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this._options.length <= 0) {
      this._options.push({ value: 'Opción 1', id: this.getPrefixOptions('Opción 1')})
    }
  }

  addOption(option: string): void {
    // this.optionsTemplate.push(option);
  }

  addResponse(): void {
    this._options.push({
      value: `Opción ${this._options.length + 1}`,
      id: this.getPrefixOptions(`Opción ${this._options.length + 1}`)
    });
  }

  updateOption(value: string, index: number): void {
    // this.optionsTemplate = this.optionsTemplate.map((option, idx) => {
    //   return (
    //     idx === index && option.trim().toLowerCase() !== value.trim().toLowerCase() ?
    //     value
    //     : option
    //   );
    // })
  }

  removeOption(index: number): void {
    // this.optionsTemplate = this.optionsTemplate.filter((option, idx) => idx !== index);
  }

  optionDefault(): string {
    return 'Opción 1';
  }

  getPrefixOptions(value: string): string {
    return `selection-editor-${Date.now()}-${Math.random()}-${value.trim()}`;
  }

  private mappingOptionsToOptionWithId(options: String[]): OptionWithId[] {
    return options.map((option) => ({
      value: option,
      id: this.getPrefixOptions(option as string),
    })) as OptionWithId[];
  }

}
