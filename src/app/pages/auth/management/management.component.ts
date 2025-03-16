import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {pipe, map, catchError, of} from "rxjs";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IPlansPayload, ManagementPlansService} from "../../../services/management-plans.service";
import {
  IResponseRolesPermissions,
  IRoles
} from "../management-permissions-roles/management-permissions-roles.component";

@Component({
  selector: 'management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ManagementComponent implements OnInit {
  public plans!: IPlans[];
  public permissions!: IPermissions[];
  public planSelected!: IPlans | null;
  public formGroupPlans!: FormGroup;

  constructor(
    private httpClient: HttpClient,
    private _fb: FormBuilder,
    private managementPlansService: ManagementPlansService,
  ) {}

  ngOnInit(): void {
    this.httpClient.get<IResponsePlansPayload[]>('https://survey-server.albertmanjon.es/plans/find-all')
      .pipe(
        map((plans: IResponsePlansPayload[]) => this.mapResponsePlans(plans)),
      )
      .subscribe(
        (plans: IPlans[]) => this.plans = plans
      );
    this.managementPlansService.plansUpdated$
      .subscribe((plan) => {
          if(plan) {
            this.plans = [
              ...this.plans.map(
                (p: IPlans) => p.id === plan.id ? {...p, ...plan} : p)
            ];

            console.log('planUpdated', plan);
          }
      });
    this.httpClient
      .get<IResponsePermissionsPayload[]>('https://survey-server.albertmanjon.es/permissions/find-all')
      .pipe(map(permissions => this.mappingPermissions(permissions)))
      .subscribe((permissions) => this.permissions = permissions);
  }

  public onSelectPlan(planID: string): void {
    const findPlan = this.plans.find((p) => p.id === planID);
    if (findPlan) {
      this.planSelected = findPlan;
      this.createFormGroupPlans();
    }
  }

  public onUnSelectPlan(): void {
    this.planSelected = null;
    this.resetFormGroupPlans();
  }

  public onSubmitUpdatePlans(event: Event): void {
    event.preventDefault();

    if(this.planSelected && !this.formGroupPlans.invalid) {
      this.managementPlansService.updatePlans(
        this.planSelected.id,
          this.mappingPayloadUpdatePlans(this.formGroupPlans.value as IPlans)
      );
    }

    this.onUnSelectPlan();
    this.resetFormGroupPlans();
  }

  private mapResponsePlans(response: IResponsePlansPayload[]) {
    return response.map(this.mappingRequestPlans);
  }
  private mappingRequestPlans(plan: IResponsePlansPayload): IPlans {
    return {
      id: plan._id,
      name: plan.name,
      max_surveys: plan.max_surveys,
      max_responses_per_survey: plan.max_responses_per_survey,
      price: plan.price,
    }
  }

  private mappingPermissions(
    permissions: IResponsePermissionsPayload[]
  ): IPermissions[] {
    return permissions.map((permission) => {
      return {
        id: permission._id,
        name: permission.name,
        title: permission.title,
        description: permission.description,
      };
    });
  }

  private createFormGroupPlans(): void {
    this.formGroupPlans = this._fb.group({
      /* 'name': this._fb.control(this.planSelected?.name || '', [Validators.required]), */
      'max_surveys': this._fb.control(this.planSelected?.max_surveys || 0, [Validators.required]),
      'max_responses_per_survey': this._fb.control(this.planSelected?.max_responses_per_survey || 0, [Validators.required]),
      'price': this._fb.control(this.planSelected?.price || 0, [Validators.required]),
    })
  }
  private resetFormGroupPlans(): void {
    this.formGroupPlans = this._fb.group({});
  }
  private mappingPayloadUpdatePlans(plan: IPlans): IPlansPayload {
    return Object.assign(plan, plan);
  }
}

export interface IResponsePlansPayload {
  _id: string;
  name: string;
  max_surveys: number;
  max_workspaces: number;
  max_responses_per_survey: number;
  price: number;
  __v: number;
}
export interface IPlans {
  id: string;
  name: string;
  max_surveys: number;
  max_responses_per_survey: number;
  price: number;
}

export interface IResponsePermissionsPayload {
  _id: string;
  name: string;
  title: string;
  description: string;
}

export interface IPermissions {
  id: string;
  name: string;
  title: string;
  description: string;
}
