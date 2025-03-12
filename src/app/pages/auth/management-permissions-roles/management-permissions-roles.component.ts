import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, map, of, pipe } from 'rxjs';

export interface Permissions {
  _id: string;
  name: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'management-permissions-roles',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  standalone: true,
  templateUrl: './management-permissions-roles.component.html',
  styleUrl: './management-permissions-roles.component.scss',
})
export class ManagementPermissionsRolesComponent implements OnInit {
  formGroup!: FormGroup;
  showMenu: boolean = false;
  isOpenSidbar: boolean = false;
  permissions!: IPermissions[];
  permissionsView!: IPermissions[];
  permissionSelectedName!: string;
  roles!: IRoles[];
  rolSelected!: IRoles | null;

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formGroup = this._fb.group({
      roles: [null, [Validators.required]],
    });

    this.formGroup.get('roles')?.valueChanges.subscribe((value: string) => {

      this.rolSelected = this.roles.find((role) => role.id === value) || null;
      this.permissionsView = this.permissions.filter((permission) => {
        return !this.rolSelected?.permissions.find((p) => p.id === permission.id);
      })

      this._cdr.detectChanges();
    });

    this._http
      .get<Permissions[]>('http://localhost:3000/permissions/find-all')
      .pipe(map((permissions) => this.mappingPermissions(permissions)))
      .subscribe((permissions: IPermissions[]) => {
        this.permissions = [...permissions];
        this.permissionsView = [...permissions];
        this.formGroup.addControl(
          'permissions',
          this.createFormGroupPermissions(permissions)
        );

        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAsUntouched();
      });

    this._http
      .get<IResponseRolesPermissions[]>(`http://localhost:3000/roles/find-all`)
      .pipe(
        map((rolesPermissions) =>
          this.mappingRolesPermissions(rolesPermissions)
        )
      )
      .subscribe((rolesPermissions: IRoles[]) => {
        this.roles = [...rolesPermissions];

        this._cdr.detectChanges();
      });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT') {
      this.showMenu = true;
    } else {
      // this.permissionsView = [...this.permissions];
      this.showMenu = false;
      this.permissionSelectedName = '';
    }
  }

  onEditRole(role: IRoles): void {
    this.rolSelected = role;
  }

  onClose(): void {
    this.rolSelected = null;
  }

  onSelectPermission(permission: IPermissions): void {
    this.permissionSelectedName = permission.name;
    this.showMenu = false;
    console.log('Permission selected:', permission);
  }

  createFormGroupPermissions(permissions: IPermissions[]): FormGroup {
    const formGroup = this._fb.group({});
    permissions.forEach((permission) => {
      formGroup.addControl(permission.name, this._fb.control(false));
    });

    return formGroup;
  }

  removeFormGroupPermissions(): void {
    if (this.formGroup.contains('permissions')) {
      this.formGroup.removeControl('permissions');
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
  }

  onObservableChangeValue(event: Event): void {
    const { value } = event.target as HTMLInputElement;

    if (value.length > 0) {
      this.showMenu = true;
    }

    if (value.length >= 2) {
      console.log('Value:', value);
      this.permissionsView = this.permissions.filter((permission) => {
        return permission.name.toLowerCase().includes(value.toLowerCase());
      });

      console.log('Permissions view:', this.permissionsView);
    } else {
      this.permissionsView = [...this.permissions];
    }
  }

  onBlur() {
    this.showMenu = false;
  }

  mappingPermissions(permissions: Permissions[]): IPermissions[] {
    return permissions.map((permission) => {
      return {
        id: permission._id,
        name: permission.name,
        title: permission.title,
        description: permission.description,
      };
    });
  }

  mappingPermissionsToKeyValue(permissions: Permissions[]): IKeyValue[] {
    return permissions.map((permission) => {
      return {
        key: permission._id,
        value: permission.name,
      };
    });
  }

  mappingRolesPermissions(
    rolesPermissions: IResponseRolesPermissions[]
  ): IRoles[] {
    return rolesPermissions.map((rolePermission) => {
      return {
        id: rolePermission._id,
        name: rolePermission.name,
        permissions: rolePermission.permissions.map((permission) => ({
          id: permission._id,
          name: permission.name,
          title: permission.title,
          description: permission.description,
        })),
        createdAt: rolePermission.createdAt,
        updatedAt: rolePermission.updatedAt,
      };
    });
  }
}

export interface IPermissions {
  id: string;
  name: string;
  title?: string;
  description?: string;
}
export interface IKeyValue {
  key: string;
  value: string;
}
export interface IResponseRolesPermissions {
  _id: string;
  name: string;
  permissions: IResponsePermissionsRole[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
export interface IRoles {
  id: string;
  name: string;
  permissions: IPermissionsRole[];
  createdAt: Date;
  updatedAt: Date;
}
export interface IResponsePermissionsRole {
  _id: string;
  name: string;
  title: string;
  description: string;
  __v: number;
}
export interface IPermissionsRole {
  id: string;
  name: string;
  title: string;
  description: string;
}
