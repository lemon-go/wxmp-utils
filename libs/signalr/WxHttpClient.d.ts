import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger } from "./ILogger";
export declare class WxHttpClient extends HttpClient {
    private readonly logger;
    constructor(logger: ILogger);
    send(request: HttpRequest): Promise<HttpResponse>;
}
