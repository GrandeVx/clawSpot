import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/trpc";

const AGENT_FILES = ["SOUL.md", "USER.md", "MEMORY.md", "TOOLS.md", "AGENTS.md"] as const;

export const agentRouter = createTRPCRouter({
  // List all public agents
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const agents = await ctx.prisma.agent.findMany({
        where: {
          isListed: true,
          isPublic: true,
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { description: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              files: true,
            },
          },
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof input.cursor = undefined;
      if (agents.length > input.limit) {
        const nextItem = agents.pop();
        nextCursor = nextItem!.id;
      }

      return {
        agents,
        nextCursor,
      };
    }),

  // Get single agent by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const agent = await ctx.prisma.agent.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          files: {
            select: {
              id: true,
              filename: true,
              updatedAt: true,
            },
          },
          tools: true,
        },
      });

      if (!agent || (!agent.isPublic && agent.authorId !== ctx.session?.user?.id)) {
        throw new Error("Agent not found");
      }

      return agent;
    }),

  // Get agent file content
  getFile: publicProcedure
    .input(z.object({ agentId: z.string(), filename: z.enum(AGENT_FILES) }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.agentFile.findUnique({
        where: {
          agentId_filename: {
            agentId: input.agentId,
            filename: input.filename,
          },
        },
      });

      return file;
    }),

  // Create new agent
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.prisma.agent.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new Error("Slug already exists");
      }

      const agent = await ctx.prisma.agent.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
        },
      });

      // Create empty agent files
      await ctx.prisma.agentFile.createMany({
        data: AGENT_FILES.map((filename) => ({
          agentId: agent.id,
          filename,
          content: filename === "SOUL.md" 
            ? "# SOUL.md\n\n_Define who this agent is..._\n"
            : filename === "USER.md"
            ? "# USER.md\n\n_Information about the user..._\n"
            : filename === "MEMORY.md"
            ? "# MEMORY.md\n\n_Long-term memory..._\n"
            : filename === "TOOLS.md"
            ? "# TOOLS.md\n\n_Available tools..._\n\n- weather\n- summarize\n"
            : "# AGENTS.md\n\n_Sub-agent configuration..._\n",
        })),
      });

      return agent;
    }),

  // Update agent file
  updateFile: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        filename: z.enum(AGENT_FILES),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const agent = await ctx.prisma.agent.findUnique({
        where: { id: input.agentId },
        select: { authorId: true },
      });

      if (!agent || agent.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.prisma.agentFile.upsert({
        where: {
          agentId_filename: {
            agentId: input.agentId,
            filename: input.filename,
          },
        },
        update: { content: input.content },
        create: {
          agentId: input.agentId,
          filename: input.filename,
          content: input.content,
        },
      });

      return { success: true };
    }),

  // Update agent metadata
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        isListed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const agent = await ctx.prisma.agent.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!agent || agent.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return ctx.prisma.agent.update({
        where: { id },
        data,
      });
    }),

  // Delete agent
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.prisma.agent.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!agent || agent.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.prisma.agent.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get my agents
  myAgents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.agent.findMany({
      where: { authorId: ctx.session.user.id },
      include: {
        _count: {
          select: { files: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Increment download count
  incrementDownloads: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.agent.update({
        where: { id: input.id },
        data: { downloads: { increment: 1 } },
      });
      return { success: true };
    }),
});
