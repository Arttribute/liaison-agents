import { request, type RequestOptions, type Variables } from "graphql-request";

const graphAPI = `https://api.studio.thegraph.com/query/102152/agentcommons-testnet/version/latest`;

export interface GraphQLTool {
  request(options: { document: string }): Promise<any>;
}

export class GraphQLToolEngine {
  request<T, V extends Variables = Variables>(options: RequestOptions<V, T>) {
    return request<T, V>({ ...options, url: graphAPI });
  }
}
