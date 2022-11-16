
enum Environment {
  Development,
  Staging,
  Production,
}

export class FrontendEnvironment {
  static instance?: FrontendEnvironment;

  environment: Environment;
  
  private constructor() {
    switch (document.location.host) {
      case 'fakeyou.com':
        this.environment = Environment.Production;
        break;
      case 'staging.fakeyou.com':
        this.environment = Environment.Staging;
        break;
      case 'dev.fakeyou.com':
        this.environment = Environment.Development;
        break;
      default:
        this.environment = Environment.Production;
    }
  }

  public static getInstance() : FrontendEnvironment {
    if (FrontendEnvironment.instance === undefined) {
        FrontendEnvironment.instance = new FrontendEnvironment();
    }
    return FrontendEnvironment.instance;
  }

  public useProductionStripePlans() : boolean {
    return this.isProduction() || this.isStaging();
  }

  public isProduction() : boolean {
    return this.environment === Environment.Production;
  }

  public isStaging() : boolean {
    return this.environment === Environment.Staging;
  }

  public isDevelopment() : boolean {
    return this.environment === Environment.Development;
  }
}
