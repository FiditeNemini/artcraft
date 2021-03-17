
enum Environment {
  // Running in 'npm run-script start'
  LOCALHOST_JS,
  // Running under Rust server; 'npm run-script build'
  LOCALHOST_RUST,
  // Running on a deployed staging or production domain.
  DEPLOYED,
  // Running somewhere else
  UNKNOWN,
}

class ApiConfig {

  environment: Environment;

  constructor() {
    const url = new URL(window.location as any);

    let environment;

    switch (url.hostname) {
      case "mumble.stream":
      case "jungle.horse":
        console.log('environment', 'deployed');
        environment = Environment.DEPLOYED;
        break;
      case "localhost":
        switch (url.port) {
          case "3000":
          case "7000":
          case "8080":
            console.log('environment', 'localhost_js');
            environment = Environment.LOCALHOST_JS;
            break;
          default:
            console.log('environment', 'localhost_rust');
            environment = Environment.LOCALHOST_RUST;
        }
        break
      default:
        console.log('environment', 'unknown');
        environment = Environment.UNKNOWN;
    }

    console.log('environment', environment);
    
    this.environment = environment;
  }

  public getEndpoint(path: string) : string {
    let baseUrl;
    switch (this.environment) {
      case Environment.LOCALHOST_JS:
        baseUrl = new URL('http://localhost:12345');
        break;
      case Environment.LOCALHOST_RUST:
      case Environment.DEPLOYED:
        // Directly access via the path.
        return path;
      case Environment.UNKNOWN:
        baseUrl = new URL('http://mumble.stream');
        break;
    }

    baseUrl.pathname = path;
    return baseUrl.toString();
  }
}

export default ApiConfig;
