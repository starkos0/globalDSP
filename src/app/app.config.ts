import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AppDB } from './services/db';
import { provideHttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    AppDB,
    provideHttpClient(),
    {
      provide: APP_BASE_HREF,
      useValue:
        document.getElementsByTagName('base')[0]?.getAttribute('href') || '/',
    },
  ],
};
