import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { FingerprintService } from '../../services/fingerprint.service';
import { EMPTY, Subscription, switchMap, tap } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IHTTPSurveyQuestion, SurveyQuestion } from '../auth/survey-edit/survey-edit.component';
import { QuestionHostComponent } from "../../components/question-host/question-host.component";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {getContrastColor, themeGlobal} from "../../configuration/theme-survey.config";

export interface IFingerPrint {
  fingerprint: string,
  UserAgent: string,
  locale: string,
}

@Component({
  selector: 'view-survey',
  imports: [
    CommonModule,
    QuestionHostComponent,
    ReactiveFormsModule,
],
  standalone: true,
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
})
export class ViewSurveyComponent implements OnInit, OnDestroy {

  public isValidForm!: boolean;
  public themeGlobal = themeGlobal;
  public data!: IHTTPSurveyQuestion;
  public uniqueId: string | undefined = '';
  public form = new FormGroup({});
  public subscriptionFingerPrint!: Subscription;
  private id!: string | null;

  constructor(
    private fingerprintService: FingerprintService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._init();
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.themeGlobal);

  if (!this.id) {
    throw new Error('No exist id');
  }

  this.form.valueChanges.subscribe(
    (e) => this.isValidSurvey(this.form.invalid)
  );

  this.httpClient.get<IHTTPSurveyQuestion>(`http://localhost:3002/questions/find-survey-questions/${this.id}`)
    .subscribe({
      next: (response) => {
        this.data = response;
      },
      error: (err) => {
        console.error('Error fetching survey questions:', err);
      }
    });
  this.addStyleSurvey();
  }

  ngOnDestroy(): void {
    if (this.subscriptionFingerPrint) {
      this.subscriptionFingerPrint?.unsubscribe();
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }else {

      let responses: any = []
      Object.keys(this.form.value).forEach((key) => {
        const findQuestion = this.getQuestion(key);
        if(findQuestion) {
          const {question, type} = findQuestion;
          responses.push(
            {
              questionId: key,
              question,
              type,
              answer: (this.form.value as any)[key]
            }
          );
        }
      });
      const responsesQuestion = {
        anonymous_id: this.uniqueId,
        survey_id: this.id,
        responses: [
          ...responses
        ]
      };

      this.httpClient.post(`http://localhost:3000/responses`, responsesQuestion).subscribe((a) => {
        console.log(a);
      })
    }
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
    this.cdRef.detectChanges();
    this.addStyleSurvey();
    console.log(this.themeGlobal);
  }

  onChangeFontFamily(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.themeGlobal = {
      ...this.themeGlobal,
      fontFamily: value,
    };
    this.cdRef.detectChanges();
    this.addStyleSurvey();
  }

  isValidSurvey(isValid: boolean): void {
    this.isValidForm =  isValid;
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

    this.cdRef.detectChanges();
  }
}
