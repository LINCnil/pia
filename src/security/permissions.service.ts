import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

@Injectable()
export class PermissionsService {

  private rolesAndPermissions:any;

  constructor(
    private ngxPermissionsService: NgxPermissionsService,
    private ngxRolesService: NgxRolesService
  ) {

  }

  public loadRolesAndPermissions(roles: any): void {
    this.rolesAndPermissions = roles;
    this.ngxRolesService.addRoles(this.rolesAndPermissions);
  }

  public async hasPermission(permissionName:string):Promise<boolean>{
        return await this.ngxPermissionsService.hasPermission(permissionName);
  }

  public activeCurrentRole(roleName: string): void {
    const role = this.ngxRolesService.getRole(roleName);
    if (!role) {
      throw new Error(`Role ${role} does not exit.`);
    }

    this.ngxPermissionsService.loadPermissions(this.rolesAndPermissions[roleName]);
  }
}
