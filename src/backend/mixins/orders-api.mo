import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/orders";
import OrdersLib "../lib/orders";

mixin (
  orders : Map.Map<Types.OrderId, Types.Order>,
  rateState : { var rate : Float },
  nextIdState : { var nextId : Types.OrderId },
) {
  func validateInput(input : Types.OrderInput) {
    if (input.productName.trim(#char ' ') == "") {
      Runtime.trap("商品名称不能为空");
    };
    if (input.customerNickname.trim(#char ' ') == "") {
      Runtime.trap("客户昵称不能为空");
    };
    if (input.foreignPrice < 0.0) {
      Runtime.trap("外币采购原价不能为负数");
    };
    if (input.shippingFeeCny < 0.0) {
      Runtime.trap("国际运费不能为负数");
    };
    if (input.quoteCny < 0.0) {
      Runtime.trap("国内报价不能为负数");
    };
  };

  /// List all orders.
  public query func listOrders() : async [Types.Order] {
    orders.values().toArray();
  };

  /// Create a new order and return its id.
  public shared ({ caller }) func createOrder(input : Types.OrderInput) : async Types.OrderId {
    ignore caller;
    validateInput(input);
    let id = nextIdState.nextId;
    nextIdState.nextId := id + 1;
    let order : Types.Order = {
      id;
      productName = input.productName;
      customerNickname = input.customerNickname;
      foreignPrice = input.foreignPrice;
      shippingFeeCny = input.shippingFeeCny;
      quoteCny = input.quoteCny;
      status = input.status;
      createdAt = Time.now();
      settledRate = if (input.status == #settled) { ?rateState.rate } else { null };
    };
    orders.add(id, order);
    id;
  };

  /// Edit an existing order.
  public shared ({ caller }) func updateOrder(id : Types.OrderId, input : Types.OrderInput) : async () {
    ignore caller;
    validateInput(input);
    let existing = orders.get(id) ?? Runtime.trap("订单不存在");
    let settledRate = switch (existing.settledRate) {
      case (?locked) { ?locked };
      case null {
        if (input.status == #settled) { ?rateState.rate } else { null };
      };
    };
    let updated : Types.Order = {
      id = existing.id;
      productName = input.productName;
      customerNickname = input.customerNickname;
      foreignPrice = input.foreignPrice;
      shippingFeeCny = input.shippingFeeCny;
      quoteCny = input.quoteCny;
      status = input.status;
      createdAt = existing.createdAt;
      settledRate;
    };
    orders.add(id, updated);
  };

  /// Delete an order.
  public shared ({ caller }) func deleteOrder(id : Types.OrderId) : async () {
    ignore caller;
    if (not orders.containsKey(id)) {
      Runtime.trap("订单不存在");
    };
    orders.remove(id);
  };

  /// Advance an order to the next status.
  public shared ({ caller }) func advanceOrderStatus(id : Types.OrderId) : async Types.OrderStatus {
    ignore caller;
    let existing = orders.get(id) ?? Runtime.trap("订单不存在");
    let next = OrdersLib.nextStatus(existing.status);
    let settledRate = switch (existing.settledRate) {
      case (?locked) { ?locked };
      case null {
        if (next == #settled) { ?rateState.rate } else { null };
      };
    };
    let updated : Types.Order = {
      id = existing.id;
      productName = existing.productName;
      customerNickname = existing.customerNickname;
      foreignPrice = existing.foreignPrice;
      shippingFeeCny = existing.shippingFeeCny;
      quoteCny = existing.quoteCny;
      status = next;
      createdAt = existing.createdAt;
      settledRate;
    };
    orders.add(id, updated);
    next;
  };

  /// Read the current exchange rate.
  public query func getExchangeRate() : async Float {
    rateState.rate;
  };

  /// Save a new exchange rate.
  public shared ({ caller }) func setExchangeRate(rate : Float) : async () {
    ignore caller;
    if (rate <= 0.0) {
      Runtime.trap("汇率必须大于 0");
    };
    rateState.rate := rate;
  };

  /// Read aggregate overview statistics.
  public query func getOverviewStats() : async Types.OverviewStats {
    OrdersLib.computeStats(orders, rateState.rate);
  };
};
