import { browser, by, element } from 'protractor';
import { LoginPage } from './page/login.po';
import { HomePage } from './page/home.po';
import './set-env';


describe('PIA Login page', () => {

  const auth = {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD
  };

  let loginPage: LoginPage;
  let homePage: HomePage;

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('when user trying to login with wrong credentials he should stay on “login” page and see error notification', () => {

    loginPage.navigateTo();
    loginPage.clearSessionAndStorage();

    expect(loginPage.loginForm().isPresent()).toBeTruthy();
    expect(loginPage.loginErrorMessage().isDisplayed()).toBeFalsy();

    loginPage.fillCredentionals('wrong@wrong.com', 'wrongpwd');
    loginPage.submitCredentials().then(() => {
      expect(loginPage.loginErrorMessage().isDisplayed()).toBeTruthy();
    });

  });

  it('when login is successful — he should redirect to home page', () => {

    loginPage.navigateTo();
    loginPage.clearSessionAndStorage();
    loginPage.fillCredentionals(auth.username, auth.password);

    loginPage.submitCredentials();

    browser.wait(function() {
      return browser.getCurrentUrl().then(function(url) {
        return /home/.test(url);
      });
    }, 10000);

    expect(homePage.navbarProfile().isPresent()).toBeTruthy();
    homePage.clickOnLogoutInProfileMenu();
    
  });

});
