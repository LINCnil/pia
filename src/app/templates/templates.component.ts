import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalsService } from 'app/modals/modals.service'
import { PiaApi} from '@api/services';
import { PiaModel, TemplateModel } from '@api/models';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  public templates: TemplateModel[];
  protected pickedTemplate: TemplateModel;
  public pia: PiaModel = new PiaModel();

  constructor(
  	protected piaApi: PiaApi,
  	protected router: Router,
  	private route: ActivatedRoute,
  	public modalsService: ModalsService
  	) {
  }

  ngOnInit() {
  	this.templates = this.route.snapshot.data.templates;
  }

  onSubmit() {
  	this.piaApi.createFromTemplate(this.pia, this.pickedTemplate).subscribe((pia: PiaModel) => {
      this.router.navigate([`/entry/${pia.id}/section/1/item/1`]);
    });
  }

  protected piaFromTemplate(template: TemplateModel) {
  	this.pickedTemplate = template;
  	this.modalsService.openModal('modal-list-new-pia');
  }

}
