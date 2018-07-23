import { Component, OnInit } from "@angular/core";
import { PermissionsService } from "@security/permissions.service";
import { AuthenticationService } from "@security/authentication.service";
import { Router } from "@angular/router";
import { ProfileSession } from "app/services/profile-session.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  providers: []
})
export class DashboardComponent implements OnInit {
  public items = [];

  constructor(
    private session: ProfileSession,
    private router: Router
  ) {}

  ngOnInit(): void {
    if(this.session.hasPortfolioStructures()){
      this.items.push({title: "dashboard.items.portfolio", icon: "fa-briefcase", action: () => {
        this.router.navigate(['/portfolio']);
      } });
    }
    if(this.session.hasOwnStructure()){
      this.items.push({ title: "dashboard.items.processings", icon: "fa-file-text", action: () => {
        this.session.navigateToOwnStructure();
      } });
    }
  }
}
