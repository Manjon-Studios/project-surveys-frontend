import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ISignleOptions {
  label: string,
  value: string,
}

@Component({
  selector: 'single',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './single.component.html',
  styleUrl: './single.component.scss'
})
export class SingleComponent {
  @Input()
  set options(options: ISignleOptions) {
    if (options) {
      this._options = options;
    }
  }
  get options(): ISignleOptions {
    return this._options;
  }

  private _options!: ISignleOptions;

}
