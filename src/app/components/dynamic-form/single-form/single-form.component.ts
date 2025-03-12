import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KeyValueListComponent } from '../../forms/key-value-list/key-value-list.component';
import { SurveyEditLayoutComponent } from '../../../ui/layouts/survey-edit-layout/survey-edit-layout.component';
import { SurveyEditService, SurveyQuestion } from '../../../pages/auth/survey-edit/services/survey-edit.service';
import { ISirveyQuestion, SurveyEditQuestionSelectedService } from '../../../pages/auth/survey-edit/services/survey-edit-question-selected.service';
import { catchError, map, of } from 'rxjs';


interface singleChoiceQuestion {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  options: ISingleFormOptions[];
}

interface ISingleChoiceQuestion {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  config: Record<string, any>;
}
export interface ISingleFormOptions {
  label: string;
  value: string;
}

@Component({
  selector: 'app-single-form',
  imports: [
    CommonModule,
    KeyValueListComponent,
    SurveyEditLayoutComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './single-form.component.html',
  styleUrl: './single-form.component.scss'
})
export class SingleFormComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;

  public formGroupSingleFormOptions!: FormGroup;
  public formatValue!: string;
  public question!: SurveyQuestion;
  public survey_id!: string;

  constructor(
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private surveyEditQuestionSelectedService: SurveyEditQuestionSelectedService,
    private surveyEditService: SurveyEditService

  ) {}

  ngOnInit(): void {
    this.surveyEditQuestionSelectedService
    .questionSelected$
    .pipe(
      map((data: any) => data ?? ({} as ISirveyQuestion)),
      catchError(() => of({} as ISirveyQuestion))
    )
    .subscribe(({ question, survey_id }: ISirveyQuestion) => {
      if (question && survey_id) {
        console.log(question)

        this.survey_id = survey_id ?? '';
        this.question = question ?? {} as SurveyQuestion;
        this._init();
      } else {
        console.error('No se recibió una pregunta válida');
      }
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log('SingleFormComponent 👽', this.formGroup)
    // this._init();
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if(!this.formGroupSingleFormOptions.invalid) {
      const data = this.formGroupSingleFormOptions.value as singleChoiceQuestion;
      const updatedData: ISingleChoiceQuestion = {
        description: data.description,
        isRequired: data.isRequired,
        question: data.question,
        type: data.type,
        config: {
          options: data.options,
        }
      };

      this.surveyEditService
        .updateQuestion<ISingleChoiceQuestion>(
          this.survey_id,
          this.question._id,
          updatedData
        );
    }
  }

  private _init() {
    this.createdFormGroup();

    if(this.isExistOptions()) {
      console.log('Exist options')
      this.setOptionsInForm();
    }

    if(!this.isExistOptions()) {
      console.log('Not Exist options')
      this.question.config['options'] = [];
      const optionsForm = this.formGroupSingleFormOptions.get('options') as FormArray;
        optionsForm.push([this.createOptionFormGroup()])
    }

    this.formGroupSingleFormOptions.get('type')?.valueChanges.subscribe((type) => {
      const newType = type as string;
      this.surveyEditQuestionSelectedService.setTypeQuestion(newType);
    })
  }

  private isExistOptions(): boolean {
    return this.question.config['options'];
  }

  private getOptions(): ISingleFormOptions[] {
    return this.question.config['options'] as ISingleFormOptions[];
  }

  private createdFormGroup(): void {
    this.formGroupSingleFormOptions = this._fb.group({
      'question': this._fb.control(this.question.question || '', [Validators.required]),
      'type': this._fb.control(this.question.type || '', [Validators.required]),
      'description': this._fb.control(this.question.description || '', []),
      'isRequired': this._fb.control(this.question.isRequired || false, [Validators.required]),
      'options': this._fb.array([])
    })
  }


  private setOptionsInForm() {
    const options = this.formGroupSingleFormOptions.get('options') as FormArray;
    this.getOptions().forEach((option: ISingleFormOptions) => {
      options.push(this.createOptionFormGroup(option));
    })
  }

  optionsArray(): FormArray {
    return this.formGroupSingleFormOptions.get('options') as FormArray;
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onChange(event: Event) {
    const value = (
      event.target as HTMLInputElement
    ).value.toString();

    this.formatValue = value
      .trim()
      .toLocaleLowerCase()
      .split(' ')
      .join('-')
      .trimEnd();

    this.cdr.detectChanges();
  }

  addOption(): void {
    const options = this.formGroupSingleFormOptions.get('options') as FormArray;
    options.push(this.createOptionFormGroup());
  }

  removeAtOption(index: number): void {
    const options = this.formGroupSingleFormOptions.get('options') as FormArray;
    options.removeAt(index);
    this.cdr.detectChanges();
    console.log(options?.value);
  }

  transformToType(option: any): ISingleFormOptions {
    return option as ISingleFormOptions;
  }

  private createOptionFormGroup(option: ISingleFormOptions | null = null): FormGroup {

    if(option) {
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
