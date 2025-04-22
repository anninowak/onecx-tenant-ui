import { Injectable, SkipSelf } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { routerNavigatedAction } from '@ngrx/router-store'
import { Action, Store } from '@ngrx/store'
import { concatLatestFrom } from '@ngrx/operators'

import { PortalDialogService, PortalMessageService } from '@onecx/portal-integration-angular'
import {
  filterForNavigatedTo,
  filterOutOnlyQueryParamsChanged,
  filterOutQueryParamsHaveNotChanged
} from '@onecx/ngrx-accelerator'
import { catchError, map, of, switchMap, tap } from 'rxjs'
import { TenantBffService } from '../../../shared/generated'
import { TenantSearchActions } from './tenant-search.actions'
import { TenantSearchComponent } from './tenant-search.component'
import { tenantSearchCriteriasSchema } from './tenant-search.parameters'
import { tenantSearchSelectors } from './tenant-search.selectors'

@Injectable()
export class TenantSearchEffects {
  constructor(
    private readonly actions$: Actions,
    @SkipSelf() private readonly route: ActivatedRoute,
    private readonly tenantService: TenantBffService,
    private readonly router: Router,
    private readonly store: Store,
    private readonly messageService: PortalMessageService,
    private readonly dialogService: PortalDialogService
  ) {}

  pageName = 'tenant'

  syncParamsToUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TenantSearchActions.searchButtonClicked, TenantSearchActions.resetButtonClicked),
      switchMap(() => {
        return this.dialogService.openDialog('T', 'M', 'P', 'S').pipe(
          switchMap((state) => {
            if (state.button === 'primary') {
              return of(TenantSearchActions.chartVisibilityToggled())
            }

            return of(TenantSearchActions.chartVisibilityRehydrated({ visible: true }))
          })
        )
      })
      // concatLatestFrom(() => [this.store.select(tenantSearchSelectors.selectCriteria), this.route.queryParams]),
      // tap(([, criteria, queryParams]) => {
      //   const results = tenantSearchCriteriasSchema.safeParse(queryParams)
      //   if (!results.success || !equal(criteria, results.data)) {
      //     const params = {
      //       ...criteria
      //     }
      //     this.router.navigate([], {
      //       relativeTo: this.route,
      //       queryParams: params,
      //       replaceUrl: true,
      //       onSameUrlNavigation: 'ignore'
      //     })
      //   }
      // })
    )
  })

  searchByUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, TenantSearchComponent),
      filterOutQueryParamsHaveNotChanged(this.router, tenantSearchCriteriasSchema, true),
      concatLatestFrom(() => this.store.select(tenantSearchSelectors.selectCriteria)),
      switchMap(([, searchCriteria]) => {
        return this.tenantService.searchTenants(searchCriteria).pipe(
          map(({ stream, totalElements }) =>
            TenantSearchActions.tenantSearchResultsReceived({
              results: stream,
              totalElements
            })
          ),
          catchError((error) =>
            of(
              TenantSearchActions.tenantSearchResultsLoadingFailed({
                error
              })
            )
          )
        )
      })
    )
  })

  rehydrateChartVisibility$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, TenantSearchComponent),
      filterOutOnlyQueryParamsChanged(this.router),
      map(() =>
        TenantSearchActions.chartVisibilityRehydrated({
          visible: localStorage.getItem('tenantChartVisibility') === 'true'
        })
      )
    )
  })

  saveChartVisibility$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TenantSearchActions.chartVisibilityToggled),
      switchMap((a) => {
        return this.dialogService.openDialog('T', 'M', 'P', 'S').pipe(
          switchMap((dialogState) => {
            return of(TenantSearchActions.tenantSearchResultsLoadingFailed({ error: 'aaa' }))
          })
        )
      })
    )
  })

  errorMessages: { action: Action; key: string }[] = [
    {
      action: TenantSearchActions.tenantSearchResultsLoadingFailed,
      key: 'TENANT_SEARCH.ERROR_MESSAGES.SEARCH_RESULTS_LOADING_FAILED'
    }
  ]

  displayError$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          const e = this.errorMessages.find((e) => e.action.type === action.type)
          if (e) {
            this.messageService.error({ summaryKey: e.key })
          }
        })
      )
    },
    { dispatch: false }
  )
}
