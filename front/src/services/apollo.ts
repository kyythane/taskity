import ApolloClient from 'apollo-client';
import { create } from '@absinthe/socket';
import type { ApolloLink } from 'apollo-link';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix';
import { InMemoryCache } from 'apollo-cache-inmemory';
import Cookies from 'js-cookie';

// TODO: if the apollo 3 version of this lands ever, upgrade to 3!
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
    const absintheSocket = create(phoenixSocket);
    // The type defintions are wrong, but afaict the code is right?
    const link = createAbsintheSocketLink(absintheSocket) as unknown as ApolloLink;

    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
    });
}