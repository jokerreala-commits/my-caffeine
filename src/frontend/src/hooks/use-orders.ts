import { createActor } from "@/backend";
import type { Order, OrderInput } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ordersQueryKey = ["orders"] as const;
export const exchangeRateQueryKey = ["exchange-rate"] as const;
export const overviewStatsQueryKey = ["overview-stats"] as const;

function invalidateOrderData(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ordersQueryKey });
  void queryClient.invalidateQueries({ queryKey: overviewStatsQueryKey });
}

/** All orders, newest first. */
export function useOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ordersQueryKey,
    queryFn: async () => {
      if (!actor) return [];
      const rows = await actor.listOrders();
      return [...rows].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

/** Current USD → CNY exchange rate. */
export function useExchangeRate() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<number>({
    queryKey: exchangeRateQueryKey,
    queryFn: async () => {
      if (!actor) return 0.048;
      return actor.getExchangeRate();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Aggregate overview statistics. */
export function useOverviewStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: overviewStatsQueryKey,
    queryFn: async () => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.getOverviewStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OrderInput) => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.createOrder(input);
    },
    onSuccess: () => {
      invalidateOrderData(queryClient);
    },
  });
}

export function useUpdateOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: OrderInput }) => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.updateOrder(id, input);
    },
    onSuccess: () => {
      invalidateOrderData(queryClient);
    },
  });
}

export function useDeleteOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.deleteOrder(id);
    },
    onSuccess: () => {
      invalidateOrderData(queryClient);
    },
  });
}

export function useAdvanceOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.advanceOrderStatus(id);
    },
    onSuccess: () => {
      invalidateOrderData(queryClient);
    },
  });
}

export function useSetExchangeRate() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rate: number) => {
      if (!actor) throw new Error("后端尚未就绪");
      return actor.setExchangeRate(rate);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: exchangeRateQueryKey });
      invalidateOrderData(queryClient);
    },
  });
}
