import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IPlans, IResponsePlansPayload} from "../pages/auth/management/management.component";
import {BehaviorSubject, map, Observable, take, tap} from "rxjs";
export interface IPlansPayload {
  name?: string;
  max_surveys?: number;
  max_responses_per_survey?: number;
  price?: number;
}
@Injectable({
  providedIn: 'root'
})
export class ManagementPlansService {

  private plansUpdated: BehaviorSubject<IPlans | null> = new BehaviorSubject<IPlans | null>(null);
  plansUpdated$: Observable<IPlans | null> = this.plansUpdated.asObservable();

  constructor(private http: HttpClient) {}

  updatePlans(planID: string, payload: IPlansPayload) {
    this.http.put<IResponsePlansPayload>(`https://survey-server.albertmanjon.es/plans/${planID}`, payload)
      .pipe(
        take(1),
        map(response => this.mappingRequestPlans(response)),
        tap((plan) => this.plansUpdated.next(plan))
      ).subscribe();
  }

  private mappingRequestPlans(response: IResponsePlansPayload): IPlans {
    return {
      id: response._id,
      name: response.name,
      max_surveys: response.max_surveys,
      max_responses_per_survey: response.max_responses_per_survey,
      price: response.price,
    }
  }
}
