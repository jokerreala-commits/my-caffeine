mixin () {
  public query func getApiDoc() : async Text {
    "# 跨境代购与订单追踪管理系统 — 后端 API\n\n" #
    "## 用途\n" #
    "单用户使用的跨境代购订单管理后台。管理订单（商品名称、客户昵称、外币采购原价、国际运费、国内报价、订单状态），维护外币对人民币汇率，并计算概览统计。所有金额单位为人民币（CNY），以浮点数表示，前端展示保留两位小数。\n\n" #
    "## 认证与授权\n" #
    "- 所有方法均可由匿名或已登录调用者访问；本应用为单用户后台，未对业务方法施加角色限制。\n" #
    "- 应用前端固定 Internet Identity 的 derivation origin（若可用，发布于 `/.well-known/ii-derivation-origin`）。已持有用户 Internet Identity 授权的 agent 会针对该 origin 派生正确的每应用 principal（例如 `icp identity link web <name> --app <host>`）。该委托在过期前以用户在本应用中的完整权限行事。\n" #
    "- 授权管理方法（`_initialize_access_control` 等）由授权组件提供；首次调用者获得管理员角色，后续调用者获得普通角色。业务方法不依赖注册状态。\n\n" #
    "## 方法\n" #
    "- `listOrders() : query [Order]` — 返回全部订单。\n" #
    "- `createOrder(input : OrderInput) : OrderId` — 新建订单并返回其 id。\n" #
    "- `updateOrder(id : OrderId, input : OrderInput) : ()` — 编辑订单。\n" #
    "- `deleteOrder(id : OrderId) : ()` — 删除订单。\n" #
    "- `advanceOrderStatus(id : OrderId) : OrderStatus` — 将订单推进到下一状态并返回新状态。\n" #
    "- `getExchangeRate() : query Float` — 读取当前汇率。\n" #
    "- `setExchangeRate(rate : Float) : ()` — 保存新汇率。\n" #
    "- `getOverviewStats() : query OverviewStats` — 读取概览统计。\n\n" #
    "## 单位与编码\n" #
    "- `OrderId` 为 `Nat`。\n" #
    "- `createdAt` 为 `Int` 纳秒时间戳（Unix epoch，来自 `Time.now()`）。\n" #
    "- `foreignPrice` 为外币金额；`shippingFeeCny`、`quoteCny` 为人民币金额。\n" #
    "- `rate` 为「1 单位外币折合人民币」的汇率，默认 0.048。\n" #
    "- `settledRate : ?Float` 在订单结款时锁定当时汇率，未结款为 `null`。\n" #
    "- `OrderStatus` 变体：`#pendingPurchase`（待采购）、`#purchased`（已采购）、`#inTransit`（国际运输中）、`#delivered`（已签收）、`#settled`（已结款）。\n\n" #
    "## 生命周期与轮询\n" #
    "- 状态按 `#pendingPurchase → #purchased → #inTransit → #delivered → #settled` 顺序推进；`#settled` 为最终状态，再次推进保持不变。\n" #
    "- 订单进入 `#settled` 时锁定当前汇率；此后修改汇率不影响已结款订单的成本与利润。\n" #
    "- 未结清订单的人民币成本按当前汇率实时计算。\n" #
    "- 查询方法（`listOrders`、`getExchangeRate`、`getOverviewStats`）为只读，可安全轮询。\n\n" #
    "## 变更重试与幂等性\n" #
    "- `createOrder` 非幂等：每次成功调用都会新建一条订单，重试会产生重复记录。\n" #
    "- `updateOrder`、`deleteOrder`、`setExchangeRate` 幂等：以相同参数重复调用结果一致。\n" #
    "- `advanceOrderStatus` 非幂等：每次调用都会推进一个状态，重试会多推进一次。\n\n" #
    "## 错误与限制\n" #
    "- 校验失败会以 trap 拒绝：商品名称或客户昵称为空、任一金额为负数、汇率小于等于 0、订单 id 不存在。\n" #
    "- 金额为浮点数，前端负责两位小数展示。\n";
  };
};
