import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Order {
    id: OrderId;
    status: OrderStatus;
    createdAt: Timestamp;
    customerNickname: string;
    productName: string;
    foreignPrice: number;
    shippingFeeCny: number;
    quoteCny: number;
    settledRate?: number;
}
export type OrderId = bigint;
export interface OrderInput {
    status: OrderStatus;
    customerNickname: string;
    productName: string;
    foreignPrice: number;
    shippingFeeCny: number;
    quoteCny: number;
}
export interface OverviewStats {
    totalOrders: bigint;
    totalProfitCny: number;
    totalCostCny: number;
    unsettledAmountCny: number;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum OrderStatus {
    settled = "settled",
    inTransit = "inTransit",
    purchased = "purchased",
    delivered = "delivered",
    pendingPurchase = "pendingPurchase"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Advance an order to the next status.
     */
    advanceOrderStatus(id: OrderId): Promise<OrderStatus>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a new order and return its id.
     */
    createOrder(input: OrderInput): Promise<OrderId>;
    /**
     * / Delete an order.
     */
    deleteOrder(id: OrderId): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Read the current exchange rate.
     */
    getExchangeRate(): Promise<number>;
    /**
     * / Read aggregate overview statistics.
     */
    getOverviewStats(): Promise<OverviewStats>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all orders.
     */
    listOrders(): Promise<Array<Order>>;
    schema(): Promise<string>;
    /**
     * / Save a new exchange rate.
     */
    setExchangeRate(rate: number): Promise<void>;
    /**
     * / Edit an existing order.
     */
    updateOrder(id: OrderId, input: OrderInput): Promise<void>;
}
