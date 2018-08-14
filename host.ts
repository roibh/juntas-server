import { ServerConfiguration, PluginConfiguration, ClientConfiguration, MethodType, ServerType, ConfiguredServer } from "@methodus/server";
import { User } from "./server/controllers/user";


@ServerConfiguration(ServerType.Express, { port: process.env.PORT || 8020 })
@PluginConfiguration('@methodus/describe')

@ClientConfiguration(User, MethodType.Local, ServerType.Express)
class SetupServer extends ConfiguredServer {

}

new SetupServer();
