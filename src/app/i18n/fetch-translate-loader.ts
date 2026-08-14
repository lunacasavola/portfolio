import { Observable, from } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';

export class FetchTranslateLoader implements TranslateLoader {
  constructor(private prefix = 'assets/i18n', private suffix = '.json') {}

  getTranslation(lang: string): Observable<any> {
    const url = `${this.prefix}/${lang}${this.suffix}`;
    return from(fetch(url).then(res => res.json()));
  }
}


