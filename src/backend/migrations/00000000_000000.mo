import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OrderStatus = {
    #pendingPurchase;
    #purchased;
    #inTransit;
    #delivered;
    #settled;
  };

  type Order = {
    id : Nat;
    productName : Text;
    customerNickname : Text;
    foreignPrice : Float;
    shippingFeeCny : Float;
    quoteCny : Float;
    status : OrderStatus;
    createdAt : Int;
    settledRate : ?Float;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    orders : Map.Map<Nat, Order>;
    rateState : { var rate : Float };
    nextIdState : { var nextId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    let orders = Map.empty<Nat, Order>();
    orders.add(1, {
      id = 1;
      productName = "日本限定版保温杯";
      customerNickname = "小林";
      foreignPrice = 4800.0;
      shippingFeeCny = 45.0;
      quoteCny = 420.0;
      status = #settled;
      createdAt = 1_731_000_000_000_000_000;
      settledRate = ?0.048;
    });
    orders.add(2, {
      id = 2;
      productName = "韩国护肤套装";
      customerNickname = "阿May";
      foreignPrice = 89000.0;
      shippingFeeCny = 38.0;
      quoteCny = 560.0;
      status = #inTransit;
      createdAt = 1_731_200_000_000_000_000;
      settledRate = null;
    });
    orders.add(3, {
      id = 3;
      productName = "美国运动鞋";
      customerNickname = "David";
      foreignPrice = 129.0;
      shippingFeeCny = 88.0;
      quoteCny = 980.0;
      status = #purchased;
      createdAt = 1_731_400_000_000_000_000;
      settledRate = null;
    });
    orders.add(4, {
      id = 4;
      productName = "德国厨具三件套";
      customerNickname = "王女士";
      foreignPrice = 210.0;
      shippingFeeCny = 120.0;
      quoteCny = 1680.0;
      status = #pendingPurchase;
      createdAt = 1_731_600_000_000_000_000;
      settledRate = null;
    });
    orders.add(5, {
      id = 5;
      productName = "澳洲保健品礼盒";
      customerNickname = "陈先生";
      foreignPrice = 320.0;
      shippingFeeCny = 65.0;
      quoteCny = 890.0;
      status = #delivered;
      createdAt = 1_731_800_000_000_000_000;
      settledRate = null;
    });
    {
      accessControlState = AccessControl.initState();
      orders;
      rateState = { var rate = 0.048 };
      nextIdState = { var nextId = 6 };
    };
  };
};
