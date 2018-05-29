import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

@Injectable()
export class PermissionsService {

  private rolesAndPermissions: any;

  constructor(
    private ngxPermissionsService: NgxPermissionsService,
    private ngxRolesService: NgxRolesService
  ) {

  }

  public loadRolesAndPermissions(roles: any): void {
    this.rolesAndPermissions = roles;
    this.ngxRolesService.addRoles(this.rolesAndPermissions);
  }

  public async hasPermission(permissionName: string): Promise<boolean> {
    return await this.ngxPermissionsService.hasPermission(permissionName);
  }

  public activateCurrentRoles(roleNames: string[]): void {
    let permissions = [];
    roleNames.forEach((roleName) => {
      const role = this.ngxRolesService.getRole(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} does not exit.`);
      }
      permissions = permissions.concat(this.rolesAndPermissions[roleName]);
    });

    this.ngxPermissionsService.loadPermissions(permissions);
  }
}
