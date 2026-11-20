# Project Guidance

## User Preferences

- 界面全部使用简体中文
- 干净现代的浅色极简风格，主色深空蓝 #1E293B，搭配浅灰背景

## Accepted Requirements

- 顶部概览卡片实时统计总订单数、总垫付成本、预计总利润与未结清订单金额
- 汇率设置栏默认 0.048，修改后自动重算所有未结清订单的人民币成本
- 新增订单表单含商品名称、客户昵称、外币采购原价、国际运费、国内报价、订单状态，并自动计算单笔净利润与利润率
- 订单列表支持按订单状态与客户昵称筛选，每行支持一键切换状态、编辑与删除
- 预置 5 条逼真测试数据
- 界面全部使用简体中文，深空蓝 #1E293B 主色搭配浅灰背景的浅色极简风格

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend order endpoints live in src/backend/mixins/orders-api.mo with pure calculations in src/backend/lib/orders.mo; main.mo composes them with the OQL Expose mixin and mixins/api-doc.mo.
- OQL manual entities need .sample(...) in addition to .payload(...) so an empty table still exposes schema fields.
- Settled orders lock their rate in Order.settledRate at the transition into #settled so later rate changes do not alter their cost.
- Frontend data access is centralized in src/frontend/src/hooks/use-orders.ts with formatters in src/frontend/src/lib/format.ts; formatPercent defaults to 1 decimal, pass 2 for two-decimal margins.
- TanStack Router root route must render Outlet; App returns RouterProvider and Layout wraps the Outlet.
- Biome rejects role="group" on a div; use fieldset with legend for filter button groups.
