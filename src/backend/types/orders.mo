import Common "../types/common";

module {
  public type OrderId = Common.OrderId;
  public type Timestamp = Common.Timestamp;

  /// Order lifecycle status, advanced in declaration order.
  public type OrderStatus = {
    #pendingPurchase; // 待采购
    #purchased; // 已采购
    #inTransit; // 国际运输中
    #delivered; // 已签收
    #settled; // 已结款
  };

  /// A cross-border purchasing order.
  public type Order = {
    id : OrderId;
    productName : Text;
    customerNickname : Text;
    /// Foreign-currency purchase price (in the foreign currency).
    foreignPrice : Float;
    /// International shipping cost in CNY.
    shippingFeeCny : Float;
    /// Domestic quoted price in CNY.
    quoteCny : Float;
    status : OrderStatus;
    createdAt : Timestamp;
    /// Exchange rate locked when the order was settled; null while unsettled.
    settledRate : ?Float;
  };

  /// Input payload for creating or editing an order.
  public type OrderInput = {
    productName : Text;
    customerNickname : Text;
    foreignPrice : Float;
    shippingFeeCny : Float;
    quoteCny : Float;
    status : OrderStatus;
  };

  /// Exchange-rate setting: foreign currency units per 1 CNY.
  public type ExchangeRate = {
    rate : Float;
  };

  /// Aggregate overview statistics in CNY.
  public type OverviewStats = {
    totalOrders : Nat;
    totalCostCny : Float;
    totalProfitCny : Float;
    unsettledAmountCny : Float;
  };
};
