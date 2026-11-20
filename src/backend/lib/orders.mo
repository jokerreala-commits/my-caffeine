import Map "mo:core/Map";
import Types "../types/orders";

module {
  public type Order = Types.Order;
  public type OrderId = Types.OrderId;
  public type OrderInput = Types.OrderInput;
  public type OrderStatus = Types.OrderStatus;
  public type OverviewStats = Types.OverviewStats;

  /// Return the next status in the lifecycle, or the same status when settled.
  public func nextStatus(status : OrderStatus) : OrderStatus {
    switch (status) {
      case (#pendingPurchase) { #purchased };
      case (#purchased) { #inTransit };
      case (#inTransit) { #delivered };
      case (#delivered) { #settled };
      case (#settled) { #settled };
    };
  };

  /// The rate that applies to an order: the locked rate once settled, else the live rate.
  public func effectiveRate(order : Order, rate : Float) : Float {
    switch (order.settledRate) {
      case (?locked) { locked };
      case null { rate };
    };
  };

  /// Compute the CNY cost of an order at the given rate.
  public func costCny(order : Order, rate : Float) : Float {
    order.foreignPrice * effectiveRate(order, rate) + order.shippingFeeCny;
  };

  /// Compute the net profit of an order in CNY at the given rate.
  public func profitCny(order : Order, rate : Float) : Float {
    order.quoteCny - costCny(order, rate);
  };

  /// Compute aggregate overview statistics across all orders.
  public func computeStats(orders : Map.Map<OrderId, Order>, rate : Float) : OverviewStats {
    var totalOrders = 0;
    var totalCost = 0.0;
    var totalProfit = 0.0;
    var unsettled = 0.0;
    for (order in orders.values()) {
      totalOrders += 1;
      totalCost += costCny(order, rate);
      totalProfit += profitCny(order, rate);
      if (order.settledRate == null) {
        unsettled += costCny(order, rate);
      };
    };
    {
      totalOrders;
      totalCostCny = totalCost;
      totalProfitCny = totalProfit;
      unsettledAmountCny = unsettled;
    };
  };
};
