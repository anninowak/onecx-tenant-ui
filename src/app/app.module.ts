import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { APP_INITIALIZER, isDevMode, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LetDirective } from '@ngrx/component'
import { EffectsModule } from '@ngrx/effects'
import { StoreRouterConnectingModule } from '@ngrx/router-store'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  AppStateService,
  APP_CONFIG,
  ConfigurationService,
  // createTranslateLoader,
  PortalCoreModule,
  PortalMissingTranslationHandler,
  translateServiceInitializer,
  UserService,
  providePortalDialogService
} from '@onecx/portal-integration-angular'
import { StandaloneShellModule } from '@onecx/standalone-shell'
import { environment } from 'src/environments/environment'
import { AppRoutingModule, routes } from './app-routing.module'
import { AppComponent } from './app.component'
import { metaReducers, reducers } from './app.reducers'

import { Configuration } from './shared/generated'
import { apiConfigProvider } from './shared/utils/apiConfigProvider.utils'
import { RouterModule } from '@angular/router'
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { TRANSLATION_PATH, createTranslateLoader, translationPathFactory } from '@onecx/angular-utils'

export const commonImports = [CommonModule]

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...commonImports,
    BrowserModule,
    BrowserAnimationsModule,
    // AppRoutingModule,
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    // LetDirective,
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
    // TranslateModule.forRoot({
    //   extend: true,
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: createTranslateLoader,
    //     deps: [HttpClient, AppStateService]
    //   },
    //   missingTranslationHandler: {
    //     provide: MissingTranslationHandler,
    //     useClass: PortalMissingTranslationHandler
    //   }
    // }),
    TranslateModule.forRoot({
      isolate: false,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    StandaloneShellModule
  ],
  providers: [
    providePortalDialogService(),
    { provide: APP_CONFIG, useValue: environment },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: translateServiceInitializer,
    //   multi: true,
    //   deps: [UserService, TranslateService]
    // },
    {
      provide: Configuration,
      useFactory: apiConfigProvider,
      deps: [ConfigurationService, AppStateService]
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: TRANSLATION_PATH,
      // TODO: Replace the path passed to translationPathFactory with the location of the applications i18n files (e.g. de.json)
      useFactory: (appStateService: AppStateService) => translationPathFactory('assets/i18n/')(appStateService),
      multi: true,
      deps: [AppStateService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
