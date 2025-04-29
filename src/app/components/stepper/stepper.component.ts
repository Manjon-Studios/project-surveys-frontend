import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { IPageSteps } from '../../pages/auth/survey-edit/services/survey-edit.service';

@Component({
  selector: 'ui-stepper',
  imports: [
    CommonModule
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit, OnChanges {
  @ViewChild('stepper', { static: true }) stepper!: ElementRef;

  @Input() steps: IPageSteps[] = [];

  @Output() sendStepSelected: EventEmitter<number> = new EventEmitter<number>();

  public currentIndex = 0;
  public width: number = 0;

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.setTotalSteps();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['steps'].currentValue !== changes['steps'].previousValue) {
      this.setTotalSteps();
    }
  }

  @HostListener('window:resize', ['$event'])
	onResize(event: any) {
		this.width = event!.target!.innerWidth;
	}

  public setCurrentIndex(n: number): void {
    this.currentIndex = n;
    this.sendStepSelected.emit(n);
  }

  private setTotalSteps(): void {
    const padding = 0;
    const availableWidth = this.width - padding;
    const colSize = (availableWidth / this.steps.length / this.width) * 100;

    this.stepper.nativeElement.style.setProperty('--steppers-cols', this.steps.length);
    this.stepper.nativeElement.style.setProperty('--steppers-cols-size', `${colSize}%`);
  }

  inRangeIndex(n: number): boolean {
    return !!(n <= this.currentIndex);
  }

  getTitle(): string {
    return this.steps[this.currentIndex].title;
  }

  isExistDescription() {
    return !!(this.steps[this.currentIndex].description);
  }

  getDescription(): string {
    return this.steps[this.currentIndex].description!;
  }
}
