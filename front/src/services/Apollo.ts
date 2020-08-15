import ApolloClient from 'apollo-client';
import * as AbsintheSocket from '@absinthe/socket';
import type { ApolloLink } from 'apollo-link';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix';
import { InMemoryCache } from 'apollo-cache-inmemory';
import Cookies from 'js-cookie';

export function buildClient() {

    const phoenixSocket = new PhoenixSocket('ws://localhost:4000/socket', {
        params: () => {
            if (Cookies.get('token')) {
                return { token: Cookies.get('token') };
            } else {
                return {};
            }
        }
    });
    const absintheSocket = AbsintheSocket.create(phoenixSocket);
    // The type defintions are wrong, but afaict the code is right?
    const link = createAbsintheSocketLink(absintheSocket) as unknown as ApolloLink;

    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
    });
}