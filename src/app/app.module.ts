import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { App } from './app';
import { routes } from './app.routes';
import { ComponentsModule } from './components.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    ],
    exports: [
        TranslateModule
    ]
})
export class AppModule { }
