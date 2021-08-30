// Manipulate meta tags on the document.
export class MetaTags {

  static setVideoUrl(url: string) {
    let metaTag = document.head.querySelector('meta[property="og:video"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', 'og:video')
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', url);
  }

  static clearVideoUrl() {
  }
}
