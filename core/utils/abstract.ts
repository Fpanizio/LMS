import { Core } from "../core.ts";
import type { Handler } from "../router.ts";

export abstract class CoreProvider {
    core: Core;
    router: Core['router'];
    db: Core['db'];
    constructor(core: Core) {
        this.core = core;
        this.router = core.router;
        this.db = core.db;
    }
}

export abstract class Api extends CoreProvider {
    handlers: Record<string, Handler> = {}
    /**
     * @description Utilize para criar a tabela no banco de dados
     */
    table() { }

    /**
     * @description Utilize para criar as rotas da API
     */
    routes() { }

    /**
     * @description Inicializa a API
     */
    init() {
        this.table();
        this.routes();
    }
}