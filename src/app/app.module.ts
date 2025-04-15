import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { isDevMode, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LetDirective } from '@ngrx/component'
import { EffectsModule } from '@ngrx/effects'
import { StoreRouterConnectingModule } from '@ngrx/router-store'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  AppStateService,
  APP_CONFIG,
  ConfigurationService,
  PortalCoreModule,
  PortalMissingTranslationHandler,
  providePortalDialogService
} from '@onecx/portal-integration-angular'
import { environment } from 'src/environments/environment'
import { routes } from './app-routing.module'
import { AppComponent } from './app.component'
import { metaReducers, reducers } from './app.reducers'

import { Configuration } from './shared/generated'
import { apiConfigProvider } from './shared/utils/apiConfigProvider.utils'

import { StandaloneShellModule } from '@onecx/standalone-shell'
import { RouterModule } from '@angular/router'
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { createTranslateLoader } from '@onecx/angular-utils'

export const commonImports = [CommonModule]

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...commonImports,
    // KeycloakAuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    // AppRoutingModule,
    LetDirective,
    StoreRouterConnectingModule.forRoot(),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75
    }),
    EffectsModule.forRoot([]),
    PortalCoreModule.forMicroFrontend(),
    // PortalCoreModule.forRoot('onecx-tenant-ui'),
    TranslateModule.forRoot({
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: PortalMissingTranslationHandler
      }
    }),
    StandaloneShellModule
  ],
  providers: [
    providePortalDialogService(),
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: Configuration,
      useFactory: apiConfigProvider,
      deps: [ConfigurationService, AppStateService]
    },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
