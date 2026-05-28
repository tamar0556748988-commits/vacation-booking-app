import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app';
import { config } from './app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;