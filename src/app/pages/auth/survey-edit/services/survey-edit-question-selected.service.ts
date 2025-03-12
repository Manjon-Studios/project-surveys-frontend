import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SurveyQuestion } from './survey-edit.service';

export interface ISirveyQuestion {
  question: SurveyQuestion,
  survey_id: string,
}

@Injectable({
  providedIn: 'root'
})
export class SurveyEditQuestionSelectedService {

  private _questionSelected: BehaviorSubject<ISirveyQuestion | null> = new BehaviorSubject<ISirveyQuestion | null>(null);
  public questionSelected$: Observable<ISirveyQuestion | null> = this._questionSelected.asObservable()

  constructor() { }

  setQuestion(question: ISirveyQuestion) {
    this._questionSelected.next(question);
  }

  setTypeQuestion(type: string): void {
    const getValue = this._questionSelected.getValue();

    if(getValue) {
      getValue.question.type = type;
      this._questionSelected.next(getValue);
      console.log('setTypeQuestion:', getValue);
    }
  }
}
