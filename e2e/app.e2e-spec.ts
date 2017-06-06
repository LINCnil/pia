import { PiaPage } from './app.po';

describe('pia App', () => {
  let page: PiaPage;

  beforeEach(() => {
    page = new PiaPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
