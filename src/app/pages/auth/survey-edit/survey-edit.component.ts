import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionHostComponent } from '../../../components/question-host/question-host.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISingleFormOptions, SingleFormComponent } from '../../../components/dynamic-form/single-form/single-form.component';
import { MultipleFormComponent } from '../../../components/dynamic-form/multiple-form/multiple-form.component';
import { SurveyEditService } from './services/survey-edit.service';
import { Observable, Subscription } from 'rxjs';
import { SurveyEditLayoutComponent } from '../../../ui/layouts/survey-edit-layout/survey-edit-layout.component';
import { SurveyEditQuestionSelectedService } from './services/survey-edit-question-selected.service';
import { TextFormComponent } from '../../../components/dynamic-form/text-form/text-form.component';
import { TextEditableComponent } from '../../../components/forms/text-editable/text-editable.component';
import { SingleComponent } from '../../../ui/choice/single/single.component';
import {TreeComponent} from "../../../components/tree/tree.component";
export interface IHTTPSurveyQuestion {
  questions: SurveyQuestion[];
}

export interface IQuestionReorder {
  id: string;
  order: number;
}

export interface SurveyQuestion {
  _id: string;
  type: string;
  question: string;
  description?: string,
  isRequired: boolean,
  order: number;
  config: Record<string, any>;
}

@Component({
  selector: 'c-survey-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SingleFormComponent,
    MultipleFormComponent,
    TextFormComponent,
    QuestionHostComponent,
    TreeComponent,
  ],
  standalone: true,
  templateUrl: './survey-edit.component.html',
  styleUrl: './survey-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SurveyEditComponent implements OnInit, OnDestroy {

  public formGroupCreatedQuestion!: FormGroup;
  public isOpenModal: boolean = false;
  public isOpenModalEditQuestion: boolean = false;
  public data!: IHTTPSurveyQuestion;
  public questionSelected!: SurveyQuestion;
  private id!: string | null;
  private dataSubscription!: Subscription;
  public draggedId!: string | null;
  public hoveredId!: string | null;
  public formQuestionHost!: FormGroup;
  public currentPage: number = 0;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private surveyEditService: SurveyEditService,
    private surveyEditQuestionSelectedService: SurveyEditQuestionSelectedService
  ) {}

  ngOnInit(): void {
    this.formQuestionHost = this.formBuilder.group({});
    this.formGroupCreatedQuestion = this.formBuilder.group({
      type: [null, Validators.required],
      question: ['', Validators.required],
      description: ['', []],
    });

    const id = this.route.snapshot.paramMap.get('id')

    if (id !== null) new Error('No exist id');

    this.id = id;

    this.dataSubscription = this.surveyEditService.questionData$
      .subscribe(
        (data) =>  { this.data = data; console.log(this.data); },
      );

    this.surveyEditQuestionSelectedService.questionSelected$
      .subscribe((data) => {
      if(data) {
        this.questionSelected = data.question;
        console.log(this.data.questions.filter((e) => e._id === data.question._id))
      }
    })

    if(id) {
      this.surveyEditService.getQuestions(id);
    }
  }

  ngOnDestroy(): void {
    if(this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  onDragStart(event: DragEvent, question: SurveyQuestion) {
    this.draggedId = question._id;
    event.dataTransfer?.setData('text/plain', JSON.stringify(question));
  }

  onDragEnter(question: SurveyQuestion): void {
    this.hoveredId = question._id;
  }

  onDragLeave() {
    this.hoveredId = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, question: SurveyQuestion): void {
    event.preventDefault();
    const getDataTransfer = event.dataTransfer?.getData('text/plain')

    if(getDataTransfer) {
      const draggedQuestion: SurveyQuestion = JSON.parse(getDataTransfer);

      const draggedIndex = this.data.questions.findIndex(q => q._id === draggedQuestion._id);
      const targetIndex = this.data.questions.findIndex(q => q._id === question._id);

      if(draggedIndex !== -1 && targetIndex !== -1) {
        const [moveQuestion] = this.data.questions.splice(draggedIndex, 1);
        this.data.questions.splice(targetIndex, 0, moveQuestion);
        this.updateOrder();
      }
    }

    this.draggedId = null;
    this.hoveredId = null;

    this.cdr.detectChanges();
  }

  updateOrder() {
    let fields: IQuestionReorder[] = [];
    this.data.questions.forEach((q, index) => {
      q.order = index
      fields.push({ "id": q._id, "order": q.order });
    });

    this.surveyEditService.onSaveReorderQuestions(fields);
  }

  onToggleModal(): void {
    this.isOpenModal = !this.isOpenModal;
  }

  onToggleModalEditQuestion(): void {
    this.isOpenModalEditQuestion = !this.isOpenModalEditQuestion;
  }

  onResetQuestionSelected() {
    this.questionSelected = {} as SurveyQuestion;
  }

  onSelectedQuestion(question: SurveyQuestion): void {
    this.questionSelected = question;
    this.surveyEditQuestionSelectedService.setQuestion(
      {
        question,
        survey_id: this.id as string
      }
    );

  }

  onSubmitUpdatedQuestion(event: Event) {
    event.preventDefault();
  }

  onDeletedQuestion(event: Event, questionID: string): void {
    event.stopImmediatePropagation();
    alert(questionID);
  }

  onTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    // this.formGroupEditedQuestion.get('type')?.patchValue(selectedValue);
    // this.formGroupEditedQuestion.get('type')?.updateValueAndValidity();
    // (this.formGroupEditedQuestion.get('options') as FormArray).clear();

    // const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    // selectElement.dispatchEvent(changeEvent);

  }

  onEditTitle(question: string, question_id: string) {
    if(this.id) {
      console.log('EXIST ID')
      this.surveyEditService.updateQuestion<{question: string}>(this.id, question_id, {question})
    }
  }

  onEditDescription(description: string, question_id: string) {
    if(this.id) {
      this.surveyEditService.updateQuestion<{description: string}>(this.id, question_id, {description})
    }
  }

  getErrorMessageFormCreatedQuestion(field: string, value: string): boolean {
    const errors = this.formGroupCreatedQuestion.get(field)?.errors;
    return errors ? !!errors[value] : false;
  }

  onSubmitCreatedQuestion(): void {

    if(this.formGroupCreatedQuestion.valid) {
      const descriptionValue = this.formGroupCreatedQuestion.get('description')?.value;
      const typeValue = this.formGroupCreatedQuestion.get('type')?.value;
      console.log(this.formGroupCreatedQuestion.get('description')?.value)

      let newQuestion = {
        ...this.formGroupCreatedQuestion.value,
        surveyId: this.id,
        order: this.data.questions.length,
        isRequired: this.data.questions.length % 2 === 0 ? true : false,
        config: {},
      };

      if(typeValue === 'singleChoice' || typeValue === 'multipleChoice') {
        newQuestion = {
          ...newQuestion,
          config: {
            options: [
              { label: 'Hello Guys', value: 'hello' },
              { label: 'God Bye', value: 'godbye' }
            ]
          }
        }
      }

      if(typeValue === 'textChoice') {
        newQuestion = {
          ...newQuestion,
          config: {
            maxLength: 255,
          }
        }
      }

      if (!descriptionValue?.trim()) {
        delete newQuestion['description'];
      }


      this.httpClient.post<SurveyQuestion>(
          'https://survey-server.albertmanjon.es/questions',
          {
            ...newQuestion
          }
        ).subscribe(
          (response: SurveyQuestion) => {
            this.data.questions.push(response);
            this.formGroupCreatedQuestion.reset();
            this.onToggleModal();
          });
      console.log({
        newQuestion: newQuestion,
      });
    }
  }
}
