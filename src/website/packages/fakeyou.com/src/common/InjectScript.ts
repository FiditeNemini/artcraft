const GOOGLE_AUTH_SIGN_IN_SCRIPT = "https://accounts.google.com/gsi/client";

enum AddTo {
  Head,
  Body,
}

export class InjectScript {
  
  public static addGoogleAuthLogin() {
    // https://developers.google.com/identity/gsi/web/guides/client-library
    // <script src="https://accounts.google.com/gsi/client" async></script>
    console.log('adding google auth script...')
    InjectScript.addScriptOnce(GOOGLE_AUTH_SIGN_IN_SCRIPT, AddTo.Body);
  }

  private static addScriptOnce(srcUrl: string, addTo: AddTo) {
    let maybeScript = InjectScript.findScript(srcUrl);
    if (!maybeScript) {
      let maybeScript = InjectScript.createScript(srcUrl, true);
      switch (addTo) {
        case AddTo.Head:
          document.head.appendChild(maybeScript);
          break;
        case AddTo.Body:
          document.body.appendChild(maybeScript);
          break;
      }
    }
  }

  private static findScript(srcUrl: string) : Element | null {
    const selector = `script[src="${srcUrl}"]`;
    return document.querySelector(selector);
  }

  private static createScript(srcUrl: string, async: boolean) : Element {
    const tag = document.createElement('script');
    tag.setAttribute('src', srcUrl);
    if (async) {
      tag.setAttribute('async', 'async');
    }
    return tag;
  }
}
