import { type Server } from "node:http";
interface ServerOptions {
    projectRoot?: string;
    host?: string;
    port?: number;
}
export interface RunningServer {
    server: Server;
    baseUrl: string;
    close: () => Promise<void>;
}
export declare function createApplicationServer(options?: ServerOptions): Server;
export declare function startServer(options?: ServerOptions): Promise<RunningServer>;
export {};
