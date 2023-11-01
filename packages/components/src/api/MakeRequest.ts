import GetApiHost from "./GetApiHost";

const { host = "", useSsl = true } = GetApiHost();

type UrlRoutingFunction<UrlRouteArgs> = (urlRouteArgs: UrlRouteArgs) => string;

interface RequestHeaders {
    [name: string]: string,
}

interface RouteSetup<UrlRouteArgs> {
    method: string;
    routingFunction: UrlRoutingFunction<UrlRouteArgs>;
}

const formatUrl = (endpoint = "") => `${ useSsl ? "https" : "http" }://${ host + endpoint }`;

const MakeRequest = <UrlRouteArgs, Request, Response>(routeSetup: RouteSetup<UrlRouteArgs>) :  (urlRouteArgs: UrlRouteArgs, request: Request) => Promise<Response> => {
    return async function(urlRouteArgs: UrlRouteArgs, request: Request) : Promise<Response> {
        const endpoint = routeSetup.routingFunction(urlRouteArgs);
        const method = routeSetup.method;
        const noBodyMethods = ["GET","HEAD", "DELETE", "OPTIONS"].indexOf(method) > -1;
        const isGet = method === "GET";

        return fetch(formatUrl(endpoint), {
            method,
            headers: {
                "Accept": "application/json",
                ...isGet ? {} : { "Content-Type": "application/json" }
            },
            credentials: 'include',
            ...noBodyMethod ? {} : { body: JSON.stringify(request) },
        })
        .then(res => res.json())
        .then(res => {
            if (res && "success" in res) {
                return res;
            } else Promise.reject();
        })
        .catch(e => ({ success : false }));
    }
};

export default MakeRequest;