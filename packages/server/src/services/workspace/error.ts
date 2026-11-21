export class SiteNameOrLogoRequiredError extends Error {
  constructor() {
    super("Site name or logo is required");
    this.name = "SiteNameOrLogoRequiredError";
  }
}
