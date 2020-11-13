import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pia } from 'src/app/models/pia.model';
import { PiaService } from 'src/app/services/pia.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  public pia = null;

  constructor(
    private route: ActivatedRoute,
    public piaService: PiaService) {
    this.piaService.find(parseInt(this.route.snapshot.params.id))
    .then((pia: Pia) => {
      // INIT PIA
      this.pia = pia;
      this.piaService.calculPiaProgress(this.pia);
    });
  }

  ngOnInit(): void {
  }

}
