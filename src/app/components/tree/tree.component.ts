import {Component, Input, Output, TemplateRef} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'ui-tree',
  imports: [
    CommonModule,
  ],
  standalone: true,
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss'
})
export class TreeComponent {
  @Input() items: unknown[] = [];
  @Input() labelTitle: string = "Page 1";
  @Input() optionsTemplate!: TemplateRef<any>;
  @Input() isAvailableAreaDraggable = false;
  @Input() isActivated = false;

    public isOpenDropdown: boolean = false;

  constructor() {}

  onToggleDropdown() {
    this.isOpenDropdown = !this.isOpenDropdown;
  }
}
