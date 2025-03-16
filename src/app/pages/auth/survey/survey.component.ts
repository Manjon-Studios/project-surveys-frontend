import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import {catchError, filter, of} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

export interface Root {
  surveys: Survey[]
  status: number
}

export interface Survey {
  _id: string
  title: string
  __v: number
}

@Component({
  selector: 'c-survey',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent implements OnInit {
  public surveys: WritableSignal<Survey[]> = signal<Survey[]>([]);
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public isOpenModalCreatedSurvey: WritableSignal<boolean> = signal<boolean>(false);
  public formCreatedSurvey!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.getSurveys();
    this.formCreatedSurvey = this.fb.group({
      title: ['', Validators.required],
      description: [''],
    })
  }

  public onToggleModalCreatedSurvey(): void {
    this.isOpenModalCreatedSurvey.set(!this.isOpenModalCreatedSurvey());
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.isOpenModalCreatedSurvey.set(!this.isOpenModalCreatedSurvey());
    this.isLoading.set(true);

    this.httpClient.post('https://survey-server.albertmanjon.es/survey',
      {...this.formCreatedSurvey.value, theme: null})
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return of({});
        })
      )
      .subscribe(
        (survey) => {
          this.getSurveys();
          this.formCreatedSurvey.reset();
        }
      );
  }

  getSurveys(): void {
    this.isLoading.set(true);
    this.httpClient.get<Survey[]>('https://survey-server.albertmanjon.es/survey/all')
      .subscribe((surveys: Survey[]) => {
        this.surveys.set(surveys)
        this.isLoading.set(false);
      });
  }

}
