import { browser, by, element } from 'protractor';

export class LoginPage {

  clearSessionAndStorage() {
      browser.executeScript("localStorage.clear();");
      browser.executeScript("sessionStorage.clear();");
  }


  navigateTo() {
    return browser.get('/');
  }

  fillCredentionals(username:string, password:string){
    element(by.id('authentication-username')).sendKeys(username);
    element(by.id('authentication-password')).sendKeys(password);
  }

  submitCredentials(){
    return element(by.id('authentication-submit')).click();
  }

  loginForm(){
    return element(by.css('form.pia-authenticationBlock-login'));
  }

  loginErrorMessage(){
    return element(by.css('form.pia-authenticationBlock-login p.error'));
  }

}
