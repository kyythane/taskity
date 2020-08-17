import { Socket as PhoenixSocket } from 'phoenix';
import Cookies from 'js-cookie';
//import { create } from "@absinthe/socket";

/*import ApolloClient from 'apollo-client';
import type { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
*/

// TODO: if the apollo 3 version of this lands ever, upgrade to 3!
export const buildClient = () => {


    const phoenixSocket = new PhoenixSocket('ws://localhost:4000/socket', {
        params: () => {
            if (Cookies.get('token')) {
                return { token: Cookies.get('token') };
            } else {
                return {};
            }
        }
    });
    //const absintheSocket = create(phoenixSocket);
    //console.log('executing', !!absintheSocket ? 'socket loaded' : ':(');
    // The type defintions are wrong, but afaict the code is right?
    /*const link = createAbsintheSocketLink(absintheSocket) as unknown as ApolloLink;
 
    return new ApolloClient({
        //  link,
        cache: new InMemoryCache(),
    });*/
};
