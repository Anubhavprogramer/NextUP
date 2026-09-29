/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { ShareSheetApp } from './src/Share/ShareSheetApp';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// Android ShareActivity: "Share → NextUP" sheet over the calling app.
AppRegistry.registerComponent('NextUPShare', () => ShareSheetApp);
