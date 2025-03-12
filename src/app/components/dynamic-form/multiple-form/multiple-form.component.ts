import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyEditLayoutComponent } from '../../../ui/layouts/survey-edit-layout/survey-edit-layout.component';
import { ISirveyQuestion, SurveyEditQuestionSelectedService } from '../../../pages/auth/survey-edit/services/survey-edit-question-selected.service';
import { SurveyQuestion } from '../../../pages/auth/survey-edit/survey-edit.component';
import { catchError, map, of, Subscription } from 'rxjs';
import { MinMaxComponent } from '../../forms/min-max/min-max.component';
import { ISingleFormOptions } from '../single-form/single-form.component';
import { KeyValueListComponent } from "../../forms/key-value-list/key-value-list.component";
import { SurveyEditService } from '../../../pages/auth/survey-edit/services/survey-edit.service';

interface MultipleChoiceQuestion {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  options: Option[];
  minmax: MinMax;
}

export interface IMultipleChoiceQuestion  {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  config: Record<string, any>;
}

interface Option {
  label: string;
  value: string;
}

interface MinMax {
  min: number;
  max?: number;
}

@Component({
  selector: 'app-multiple-form',
  imports: [
    CommonModule,
    SurveyEditLayoutComponent,
    MinMaxComponent,
    ReactiveFormsModule,
    KeyValueListComponent
],
  standalone: true,
  templateUrl: './multiple-form.component.html',
  styleUrl: './multiple-form.component.scss'
})
export class MultipleFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formGroup!: FormGroup;

  public formMultiple!: FormGroup;
  public question!: SurveyQuestion;
  public survey_id!: string;

  public fomrMultipleSubscription!: Subscription;

  constructor(
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private surveyEditQuestionSelectedService: SurveyEditQuestionSelectedService,
    private surveyEditService: SurveyEditService
  ) { }

  ngOnInit(): void {
    this.fomrMultipleSubscription = this.surveyEditQuestionSelectedService.questionSelected$
      .pipe(
        map((data: any) => data ?? ({} as ISirveyQuestion)),
        catchError(() => of({} as ISirveyQuestion))
      )
      .subscribe(({ question, survey_id }: ISirveyQuestion) => {
        if (question && survey_id) {
          this.survey_id = survey_id ?? '';
          this.question = question ?? {} as SurveyQuestion;

          this._init();
          console.log(this.question)

        } else {
          console.error('No se recibió una pregunta válida');
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('MultipleFormComponent 👽', this.formGroup)
  }

  ngOnDestroy(): void {
    this.fomrMultipleSubscription.unsubscribe();
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if(!this.formMultiple.invalid) {
      const data = this.formMultiple.value as MultipleChoiceQuestion;
      const updatedData: IMultipleChoiceQuestion = {
        description: data.description,
        isRequired: data.isRequired,
        question: data.question,
        type: data.type,
        config: {
          minmax: data.minmax,
          options: data.options,
        }
      }

      this.surveyEditService
        .updateQuestion<IMultipleChoiceQuestion>(
          this.survey_id,
          this.question._id,
          updatedData
        );
      console.log(updatedData);
    }
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  addOption(): void {
    const options = this.formMultiple.get('options') as FormArray;
    options.push(this.createOptionFormGroup());
  }

  removeAtOption(index: number): void {
    const options = this.formMultiple.get('options') as FormArray;
    options.removeAt(index);
    this.cdr.detectChanges();
    console.log(options?.value);
  }

  optionsArray(): FormArray {
    return this.formMultiple.get('options') as FormArray;
  }

  private _init() {
    this.createdFormGroup();

    if (this.isExistOptions()) {
      console.log('Exist options')
      this.setOptionsInForm();
    }

    if (!this.isExistOptions()) {
      console.log('Not Exist options')
      const optionsForm = this.formMultiple.get('options') as FormArray;
      optionsForm.push([this.createOptionFormGroup()])
    }
  }

  private isExistOptions(): boolean {
    return this.question.config['options'];
  }

  private isExistMinMax(): boolean {
    return this.question.config['minmax'];
  }

  private createdFormGroup(): void {
    this.formMultiple = this._fb.group({
      'question': this._fb.control(this.question.question || '', [Validators.required]),
      'type': this._fb.control(this.question.type || '', [Validators.required]),
      'description': this._fb.control(this.question.description || '', []),
      'isRequired': this._fb.control(this.question.isRequired || false, [Validators.required]),
      'options': this._fb.array([]),
      'minmax': this._fb.control(this.isExistMinMax() ? this.question.config['minmax'] : {min: 1}, [Validators.required])
    });

    this.formMultiple.get('type')?.valueChanges.subscribe((type) => {
      const newType = type as string;
      this.surveyEditQuestionSelectedService.setTypeQuestion(newType);
    })
  }

  private setOptionsInForm() {
    const options = this.formMultiple.get('options') as FormArray;
    this.getOptions().forEach((option: ISingleFormOptions) => {
      options.push(this.createOptionFormGroup(option));
    })
  }

  private getOptions(): ISingleFormOptions[] {
    return this.question.config['options'] as ISingleFormOptions[];
  }

  private createOptionFormGroup(option: ISingleFormOptions | null = null): FormGroup {
    if (option) {
      return this._fb.group({
        label: new FormControl(option.label, [Validators.required]),
        value: new FormControl(option.value, [Validators.required]),
      });
    }

    return this._fb.group({
      label: new FormControl('Default', [Validators.required]),
      value: new FormControl('default-value', [Validators.required]),
    });
  }
}
