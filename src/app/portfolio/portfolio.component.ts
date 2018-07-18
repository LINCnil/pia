import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@security/authentication.service';


@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  providers: []
})

export class PortfolioComponent implements OnInit{
 
  public structures:any[];

  constructor(
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.profileSubject.subscribe((profile) =>{
      this.structures = profile.portfolio_structures;
    });
  }
}
