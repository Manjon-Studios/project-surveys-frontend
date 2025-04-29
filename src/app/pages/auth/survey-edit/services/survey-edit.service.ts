import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {BehaviorSubject, catchError, map, Observable, of, Subject, takeUntil} from "rxjs";
import { IMultipleChoiceQuestion } from "../../../../components/dynamic-form/multiple-form/multiple-form.component";
import { IQuestionReorder } from "../survey-edit.component";
import {
  getContrastColor,
  IResponseSurveyThemeGlobal,
  ISurveyThemeGlobal
} from "../../../../configuration/theme-survey.config";

export interface IHTTPSurveyQuestion {
  questions: SurveyQuestion[];
}

const defaultTheme: ISurveyThemeGlobal = {
  fontFamily: 'Quicksand',
  bgColorGeneric: '#ea6161',
  textColorElements: '#303030',
  textColorElementsSelectable: getContrastColor('#ea6161'),
};

export interface SurveyQuestion {
  _id: string;
  type: string;
  question: string;
  description?: string,
  isRequired: boolean,
  order: number;
  config: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class SurveyEditService {

  private unsubscribe$ = new Subject<void>();

  private questionData: BehaviorSubject<IPage[]> = new BehaviorSubject<IPage[]>([]);
  public questionData$: Observable<IPage[]> = this.questionData.asObservable();

  private themeData: BehaviorSubject<ISurveyThemeGlobal> = new BehaviorSubject<ISurveyThemeGlobal>(defaultTheme)
  public themeData$: Observable<ISurveyThemeGlobal> = this.themeData.asObservable();

  constructor(
    private _httpClient: HttpClient,
  ) {}

  getQuestions(id: string) {
    this._httpClient
      .get<Pages[]>(`http://localhost:3004/pages/find/${id}`)
      .pipe(
        map((pages) => pages.map(
          (page) => this.mappingResponsePages(page)
        )),
        takeUntil(this.unsubscribe$),
        catchError(() => of([] as IPage[]))
      )
      .subscribe((questions) => {
          this.questionData.next(questions);
      });
  }

  setTheme(id: string, theme: ISurveyThemeGlobal) {
    this._httpClient
      .post<IResponseSurveyThemeGlobal>(`https://survey-server.albertmanjon.es/survey/update-theme/${id}`, { theme })
      .pipe(

        takeUntil(this.unsubscribe$),
        catchError(() => of(defaultTheme))
      )
      .subscribe(
        (theme) => this.themeData.next(theme)
      )
  }

  updateQuestion<T>(
    survey_id: string,
    question_id: string,
    data: T
  ): void {
    this._httpClient.put<SurveyQuestion>(`https://survey-server.albertmanjon.es/questions/${question_id}`,
    {...data})
    .pipe(
      catchError(() => of({} as SurveyQuestion))
    )
    .subscribe(
      (questions: SurveyQuestion) => {
      if(questions) {
        this.getQuestions(survey_id);
      }
    });
  }

  onSaveReorderQuestions(questions: IQuestionReorder[]) {
    this._httpClient.post<any>(`https://survey-server.albertmanjon.es/questions/reorder`, {questions}).subscribe((a) => {
      console.log(a)
    });
  }

  mappingResponsePages(page: Pages): IPage {
    return {
      id: page._id,
      title: page.title,
      description: page?.description,
      order: page.order,
      questions: page.questions.map((question: Question) => {
        return {
          id: question._id,
          question: question.question,
          description: question?.description || null,
          type: question.type,
          order: question.order,
          isRequired: question.isRequired,
          config: question.config,
        } as IQuestion;
      }),
    }
  }
}

export interface Question {
  _id: string;
   type: string;
  question: string;
  description?: string;
  order: number;
  isRequired: boolean;
  config: Record<string, any>;
}

export interface Pages {
  _id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface IPage {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: IQuestion[];
}

export interface IPageSteps {
  title: string;
  description?: string;
}

export interface IQuestion {
  id: string;
  type: string;
  question: string;
  description?: string;
  order: number;
  isRequired: boolean;
  config: Record<string, any>;
}
