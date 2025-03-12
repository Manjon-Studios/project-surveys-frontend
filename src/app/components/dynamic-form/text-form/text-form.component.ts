import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyEditLayoutComponent } from '../../../ui/layouts/survey-edit-layout/survey-edit-layout.component';
import { KeyValueListComponent } from '../../forms/key-value-list/key-value-list.component';
import { SurveyQuestion } from '../../../pages/auth/survey-edit/survey-edit.component';
import { ISirveyQuestion, SurveyEditQuestionSelectedService } from '../../../pages/auth/survey-edit/services/survey-edit-question-selected.service';
import { catchError, map, of, Subscription } from 'rxjs';
import { SurveyEditService } from '../../../pages/auth/survey-edit/services/survey-edit.service';

interface TextChoiceQuestion {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  maxLength: number;
}

export interface ITextChoiceQuestion {
  question: string;
  type: string;
  description: string;
  isRequired: boolean;
  config: Record<string, any>;
}

@Component({
  selector: 'text-form',
  imports: [
    CommonModule,
    SurveyEditLayoutComponent,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './text-form.component.html',
  styleUrl: './text-form.component.scss'
})
export class TextFormComponent implements OnInit, OnChanges, OnDestroy {

  public formGroup!: FormGroup;
  public formGrouptSubscription!: Subscription;
  public question!: SurveyQuestion;
  public survey_id!: string;

  constructor(
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private surveyEditQuestionSelectedService: SurveyEditQuestionSelectedService,
    private surveyEditService: SurveyEditService
  ) { }

  ngOnInit(): void {
    this.formGrouptSubscription = this.surveyEditQuestionSelectedService
      .questionSelected$
      .pipe(
        map((data: any) => data ?? ({} as ISirveyQuestion)),
        catchError(() => of({} as ISirveyQuestion))
      )
      .subscribe(({ question, survey_id }: ISirveyQuestion) => {
        if (question && survey_id) {
          this.survey_id = survey_id ?? '';
          this.question = question ?? {} as SurveyQuestion;
          this._init();

        } else {
          console.error('No se recibió una pregunta válida');
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy(): void {
    if (this.formGrouptSubscription) {
      this.formGrouptSubscription.unsubscribe()
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.formGroup.invalid) {
      //TextChoiceQuestion
      const data = this.formGroup.value as TextChoiceQuestion;

      const updatedData: ITextChoiceQuestion = {
        description: data.description,
        isRequired: data.isRequired,
        question: data.question,
        type: data.type,
        config: {
          maxLength: data.maxLength,
        }
      }

      this.surveyEditService
        .updateQuestion<ITextChoiceQuestion>(
          this.survey_id,
          this.question._id,
          updatedData
        );

    }
  }

  private _init() {
    this.createdFormGroup();
  }

  private isExistMaxLength(): boolean {
    return this.question.config['maxLength'];
  }

  private createdFormGroup(): void {
    this.formGroup = this._fb.group({
      'question': this._fb.control(this.question.question || '', [Validators.required]),
      'type': this._fb.control(this.question.type || '', [Validators.required]),
      'description': this._fb.control(this.question.description || '', []),
      'isRequired': this._fb.control(this.question.isRequired, [Validators.required]),
      'maxLength': this._fb.control(this.question.config['maxLength'] || 255, [Validators.required])
    })

    this.formGroup.get('type')?.valueChanges.subscribe((type) => {
      const newType = type as string;
      this.surveyEditQuestionSelectedService.setTypeQuestion(newType);
    })
  }

}
