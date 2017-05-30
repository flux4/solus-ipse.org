import { SolusIpse.OrgPage } from './app.po';

describe('solus-ipse.org App', () => {
  let page: SolusIpse.OrgPage;

  beforeEach(() => {
    page = new SolusIpse.OrgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
