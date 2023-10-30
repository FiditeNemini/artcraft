import GetApiHost from "./GetApiHost";

const [ apiHost, disableSSL = false ] = GetApiHost();

type UrlRoutingFunction<UrlRouteArgs> = (urlRouteArgs: UrlRouteArgs) => string;

interface RequestHeaders {
    [name: string]: string,
}

interface RouteSetup<UrlRouteArgs> {
    method: string;
    routingFunction: UrlRoutingFunction<UrlRouteArgs>;
}

const GrabPath = (endpoint = "") => `${ disableSSL ? "http" : "https" }://${ apiHost }/${ endpoint }`;

const GrabEndpoint = <UrlRouteArgs, Request, Response>(routeSetup: RouteSetup<UrlRouteArgs>) :  (urlRouteArgs: UrlRouteArgs, request: Request) => Promise<Response> => {
    return async function(urlRouteArgs: UrlRouteArgs, request: Request) : Promise<Response> {
        const endpoint = routeSetup.routingFunction(urlRouteArgs);
        const method = routeSetup.method;

        return fetch(GrabPath(endpoint), {
            method,
            headers: {
                "Accept": "application/json",
            },
            credentials: 'include',
            ...method === "GET" ? {} : { body: JSON.stringify(request) },
        })
        .then(res => res.json())
        .then(res => {
            if (res && 'success' in res) {
                return res;
            } else throw new Error;
        })
        .catch(e => ({ success : false }));
    }
};

export { GrabEndpoint, GrabPath };