import ApolloClient from "apollo-client";
import * as AbsintheSocket from "@absinthe/socket";
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link";
import { Socket as PhoenixSocket } from "phoenix";
import { InMemoryCache } from "apollo-cache-inmemory";
import Cookies from "js-cookie";

export function buildClient() {

    const phoenixSocket = new PhoenixSocket("ws://localhost:4000/socket", {
        params: () => {
            if (Cookies.get("token")) {
                return { token: Cookies.get("token") };
            } else {
                return {};
            }
        }
    });
    const absintheSocket = AbsintheSocket.create(phoenixSocket);
    const link = createAbsintheSocketLink(absintheSocket);

    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
    });
}