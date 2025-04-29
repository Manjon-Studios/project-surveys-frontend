import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  AfterViewInit, WritableSignal, signal, DoCheck
} from '@angular/core';
import { FingerprintService } from '../../services/fingerprint.service';
import { debounceTime, distinctUntilChanged, EMPTY, map, Subscription, switchMap, tap } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IHTTPSurveyQuestion, SurveyQuestion } from '../auth/survey-edit/survey-edit.component';
import { QuestionHostComponent } from "../../components/question-host/question-host.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { getContrastColor, themeGlobal } from "../../configuration/theme-survey.config";
import { environment } from "../../../environments/environment";
import { IPage, IQuestion, Pages, Question } from "../auth/survey-edit/services/survey-edit.service";
import { QuestionPageComponent } from "./components/question-page/question-page.component";

export interface IFingerPrint {
  fingerprint: string,
  UserAgent: string,
  locale: string,
}

@Component({
  selector: 'view-survey',
  imports: [
    CommonModule,
    QuestionPageComponent,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
})
export class ViewSurveyComponent implements OnInit, OnDestroy, DoCheck {

  public isValidForm!: boolean;
  public themeGlobal = themeGlobal;
  public data!: IHTTPSurveyQuestion;
  public uniqueId: string | undefined = '';
  public form = new FormGroup({});
  public subscriptionFingerPrint!: Subscription;
  private id!: string | null;
  public pages: IPage[] = [];
  public currentPage: number = 0;
  public invalidForm: boolean = false;

  constructor(
    private fingerprintService: FingerprintService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this._init();
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      throw new Error('No exist id');
    }

    this.form.valueChanges.subscribe((e) => { });

    this.httpClient.get<Pages[]>(`${environment.API_URL}pages/find/${this.id}`)
      .pipe(
        map((pages) => pages.sort(
          (a, b) => a.order - b.order).map((page: Pages) => this.mappingDataPages(page))
        ),
      )
      .subscribe({
        next: (response) => {
          //this.data = response;
          this.pages.push(...response);
          this.generateFormGroupByPages();
        },
        error: (err) => {
          console.error('Error fetching survey questions:', err);
        }
      });
    this.addStyleSurvey();
  }

  ngDoCheck() {
    this.isInvalidFormPage();
  }

  generateFormGroupByPages(): void {
    this.pages.map((page: IPage) => {
      this.form.setControl(page.id, this.fb.group({}))
      this.form.get(page.id)?.setErrors({ invalid: true });

      this.form.get(page.id)?.valueChanges
        .pipe(debounceTime(100), distinctUntilChanged()) // Evita múltiples emisiones innecesarias
        .subscribe((e) => {
          this.isInvalidFormPage();
          if (this.form.get(page.id)?.hasError('invalid')) {
            this.form.get(page.id)?.setErrors(null);
            this.form.get(page.id)?.updateValueAndValidity({ emitEvent: false }); // Evita disparar otro evento
            this.invalidForm = !!this.form.get(page.id)?.hasError('invalid');
          } else {
            this.invalidForm = false;
          }
        });
    });
  }

  getFormGroupByPage() {
    return this.form.get(this.pages[this.currentPage].id) as FormGroup;
  }
  getFormGroupById(id: string): FormGroup<any> {
    return this.form.get(id) as FormGroup;
  }

  mappingDataPages(page: Pages): IPage {
    return {
      id: page._id,
      title: page.title,
      description: page?.description,
      order: page?.order,
      questions: page.questions.map((q: Question) => {
        return {
          id: q._id,
          type: q.type,
          question: q.question,
          description: q?.description,
          order: q.order,
          isRequired: q.isRequired,
          config: q.config,
        } as IQuestion;
      }),
    }
  }

  getCurrentPage(): IPage {
    return this.pages[this.currentPage];
  }

  isExistPage(index: number): boolean {
    return !!(this.pages[index]);
  }

  isInvalidFormPage(): void {
    this.invalidForm = !!((this.pages[this.currentPage] && this.form.get(this.pages[this.currentPage].id)?.invalid));
  }

  nextPage(): void {
    if (
      this.getFormGroupByPage() &&
      this.getFormGroupById(this.pages[this.currentPage].id)
    ) {
      if (this.pages[this.currentPage + 1]) {
        this.currentPage++;
        this.isInvalidFormPage();
      }
    }
  }

  prevPage(): void {
    if (this.pages[this.currentPage - 1]) {
      this.currentPage--;
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptionFingerPrint) {
      this.subscriptionFingerPrint?.unsubscribe();
    }
  }

  findPageById(id: string): IPage | undefined {
    return this.pages.find((page) => page.id === id);
  }

  submit() {
    console.log('Submit', this.form.invalid);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let responses: any[] = []
      Object.keys(this.form.value).map((control) => {
        // Question of page
        const getQuestionsByPage = this.findPageById(control)!.questions;
        // Obtener vía form las respuestas de cada pagina
        const getResponseQuestions: any[] = this.form.get(control)?.value;
        // Generar objeto para enviarlo al servidor
        console.log(
          Object.keys(getResponseQuestions).map((child) => (
            getQuestionsByPage
              .filter((q) => q.id === child)
              .map((q) => ({
                questionId: q.id,
                question: q.question,
                type: q.type,
                answer: this.form.get(control)?.get(child)?.value,
              }))
          ))
        );
      });

      console.log(responses)

      const responsesQuestion = {
        anonymous_id: this.uniqueId,
        survey_id: this.id,
        responses
      };

      // console.log('Responses', responsesQuestion);

      // this.httpClient.post(`${environment.API_URL}responses`, responsesQuestion)
      //   .subscribe((a) => {
      //   console.log(a);
      // })

  }

  addStyleSurvey(): void {
    document.documentElement.style.setProperty('--single-choice-bg', this.themeGlobal.bgColorGeneric);
    document.documentElement.style.setProperty('--single-choice-color', this.themeGlobal.textColorElements);
    document.documentElement.style.setProperty('--single-choice-color-selected', this.themeGlobal.textColorElementsSelectable);
  }

  onChangeBackground(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    console.log(value);
    this.themeGlobal = {
      ...this.themeGlobal,
      bgColorGeneric: value,
      textColorElementsSelectable: getContrastColor(value)
    };
    this.cdr.detectChanges();
    this.addStyleSurvey();
    console.log(this.themeGlobal);
  }

  onChangeFontFamily(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.themeGlobal = {
      ...this.themeGlobal,
      fontFamily: value,
    };
    this.cdr.detectChanges();
    this.addStyleSurvey();
  }

  isValidSurvey(isValid: boolean): void {
    this.isValidForm = isValid;
  }

  getQuestion(question_id: string): SurveyQuestion | undefined {
    return this.data.questions.find(q => q._id === question_id);
  }

  isInvalidForm(): boolean {
    return this.form.invalid || false;
  }

  private _init() {
    this.uniqueId = this.storageService.getItem<IFingerPrint>('anonymous')?.fingerprint;

    if (!this.uniqueId) {
      this.subscriptionFingerPrint = this.fingerprintService.fingerprint$.pipe(
        switchMap((id) => id
          ? this.fingerprintService.setFingerprint({
            fingerprint: id,
            UserAgent: navigator.userAgent,
            locale: navigator.language
          }).pipe(tap(() => this.storageService.setItem('anonymous', {
            fingerprint: id,
            UserAgent: navigator.userAgent,
            locale: navigator.language
          })))
          : EMPTY
        )
      ).subscribe();
    }

    this.cdr.detectChanges();
  }
}
