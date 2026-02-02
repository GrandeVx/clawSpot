import { createTRPCRouter } from "@/lib/trpc/trpc";
import { agentRouter } from "./agent";

export const appRouter = createTRPCRouter({
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
