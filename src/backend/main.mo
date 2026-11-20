import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Map "mo:core/Map";
import Types2 "types/orders";
import OrdersApi "mixins/orders-api";
import ApiDocMixin "mixins/api-doc";

actor {
  func statusText(status : Types2.OrderStatus) : Text {
    switch (status) {
      case (#pendingPurchase) { "pendingPurchase" };
      case (#purchased) { "purchased" };
      case (#inTransit) { "inTransit" };
      case (#delivered) { "delivered" };
      case (#settled) { "settled" };
    };
  };

  let accessControlState : AccessControl.AccessControlState;
  let orders : Map.Map<Types2.OrderId, Types2.Order>;
  let rateState : { var rate : Float };
  let nextIdState : { var nextId : Types2.OrderId };

  include MixinAuthorization(accessControlState, null);
  include OrdersApi(orders, rateState, nextIdState);
  include Expose({
    entities = [
      Entity.manual<Types2.Order>("order", func () = orders.values(), "Order", "id")
        .payload("id", func (o : Types2.Order) : Nat = o.id)
        .payload("productName", func (o : Types2.Order) : Text = o.productName)
        .payload("customerNickname", func (o : Types2.Order) : Text = o.customerNickname)
        .payload("foreignPrice", func (o : Types2.Order) : Float = o.foreignPrice)
        .payload("shippingFeeCny", func (o : Types2.Order) : Float = o.shippingFeeCny)
        .payload("quoteCny", func (o : Types2.Order) : Float = o.quoteCny)
        .payload("status", func (o : Types2.Order) : Text = statusText(o.status))
        .payload("createdAt", func (o : Types2.Order) : Int = o.createdAt)
        .payload("settledRate", func (o : Types2.Order) : ?Float = o.settledRate)
        .domain("status", [
          #text "pendingPurchase",
          #text "purchased",
          #text "inTransit",
          #text "delivered",
          #text "settled",
        ])
        .auth(#controllerOnly)
        .build(),
    ];
  });
  include ApiDocMixin();
};
