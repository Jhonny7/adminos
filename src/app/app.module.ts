import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { App } from './app';
import { routes } from './app.routes';
import { ComponentsModule } from './components.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export function createTranslateLoader() {
    return new TranslateHttpLoader();
}

@NgModule({
    declarations: [
        App
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        ComponentsModule,
        RouterModule.forRoot(routes),
        TranslateModule.forRoot({
            loader: provideTranslateHttpLoader({
                prefix: './assets/i18n/',
                suffix: '.json'
            })
        })
    ],
    bootstrap: [App],
    providers: [
        provideCharts(withDefaultRegisterables())
    ],
    exports: [
        TranslateModule
    ]
})
export class AppModule { }
