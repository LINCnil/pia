import { PiaPage } from './app.po';

describe('PIA Home page', () => {
  let page: PiaPage;

  beforeEach(() => {
    page = new PiaPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page
      .getButtonText()
      .then(msg => expect(msg).toEqual('Commencer'))
      .then(done, done.fail);
  });
});
