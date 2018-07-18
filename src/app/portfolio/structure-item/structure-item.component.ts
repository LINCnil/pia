import { Component, Input } from "@angular/core";
import { ProfileSession } from "../../services/profile-session.service";

@Component({
  selector: "app-structure-item",
  templateUrl: "./structure-item.component.html",
  styleUrls: ["./structure-item.component.scss"]
})
export class StructureItemComponent {

  @Input() structure;

  constructor(private session:ProfileSession){

  }

  public navigateTo(structure){

    this.session.navigateToStructure(structure);


  }
}
