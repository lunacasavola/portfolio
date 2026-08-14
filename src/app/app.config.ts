import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FetchTranslateLoader } from './i18n/fetch-translate-loader';

export function HttpLoaderFactory() {
  return new FetchTranslateLoader('assets/i18n', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory
        }
      })
    )
  ]
};
