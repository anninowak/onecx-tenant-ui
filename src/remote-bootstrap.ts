import { bootstrapModule } from '@onecx/angular-webcomponents'
import { environment } from './environments/environment'
import { OneCXTenantModule } from './app/onecx-tenant-ui.remote.module'

bootstrapModule(OneCXTenantModule, 'microfrontend', environment.production)
