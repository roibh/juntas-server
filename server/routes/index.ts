import * as userRoute from './user';
import * as JuntifyRoute from './juntify';
import * as monitorRoute from './monitor';
import * as tabsRoute from './tabs';
import * as contentRoute from './content';
import * as kidMon from './kidmon';
import * as blogsRoute from './blogs';

module.exports = function (app: any) {
    contentRoute.appRoute(app);
    userRoute.appRoute(app);
    monitorRoute.appRoute(app);
    tabsRoute.appRoute(app);
    JuntifyRoute.appRoute(app);
    blogsRoute.appRoute(app);
    kidMon.appRoute(app);
};

