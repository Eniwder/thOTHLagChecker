/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify';

export function registerPlugins(app) {
  console.log('Registering plugins...');
  app.use(vuetify);
}
