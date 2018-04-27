import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/authentication.service';

@Component({
  selector: 'app-authentication-callback',
  templateUrl: './authentication-callback.component.html',
  styleUrls: ['./authentication-callback.component.scss']
})
export class AuthenticationCallbackComponent implements OnInit {

  constructor(private authService: AuthenticationService) {}

	ngOnInit() {
    	this.authService.completeAuthentication();
	}

}
