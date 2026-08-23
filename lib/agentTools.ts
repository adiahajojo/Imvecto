import { prisma } from "@/lib/prisma";
import type { ToolDefinition } from "@/lib/llama";

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_projects",
      description: "Search for impact projects by keyword in the title/description, or filter by category.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword to search for, e.g. 'water' or 'school'." },
          category: { type: "string", description: "Category filter, e.g. BUILD, CARE." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project",
      description: "Get full details for a single project by its id or token symbol.",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          tokenSymbol: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_progress",
      description: "Get funding progress (raised vs target, percent, contributor count) for a project.",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_impact_passport",
      description: "Get the full impact passport for a project: funding, milestones, impact metrics, on-chain record.",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_milestones",
      description: "Get the list of milestones and their status for a project.",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_evidence",
      description: "Flag a milestone as needing evidence from the project owner. Does not send a notification yet — just acknowledges the request.",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          milestoneId: { type: "string" },
          note: { type: "string", description: "What evidence is being requested." },
        },
        required: ["projectId", "milestoneId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepare_funding",
      description: "Prepare a funding action for the person to review and approve. Does NOT execute anything or touch a wallet — only proposes the action.",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          amount: { type: "number", description: "Amount in whole USDT tokens." },
        },
        required: ["projectId", "amount"],
      },
    },
  },
];

export async function runTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "search_projects": {
      const where: any = { status: { in: ["ACTIVE", "FUNDED", "COMPLETED"] } };
      if (args.category) where.category = args.category;
      if (args.query) {
        where.OR = [
          { title: { contains: args.query, mode: "insensitive" } },
          { description: { contains: args.query, mode: "insensitive" } },
        ];
      }
      const projects = await prisma.project.findMany({
        where,
        take: 10,
        select: { id: true, title: true, category: true, location: true, tokenSymbol: true, raisedAmount: true, targetAmount: true, status: true },
      });
      return { projects };
    }

    case "get_project": {
      const where = args.projectId ? { id: args.projectId } : { tokenSymbol: args.tokenSymbol };
      const project = await prisma.project.findUnique({ where });
      if (!project) return { error: "Project not found." };
      return { project };
    }

    case "get_project_progress": {
      const project = await prisma.project.findUnique({
        where: { id: args.projectId },
        include: { contributions: true },
      });
      if (!project) return { error: "Project not found." };
      const contributorCount = new Set(project.contributions.map((c) => c.userId)).size;
      const percent = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));
      return {
        title: project.title,
        raisedAmount: project.raisedAmount,
        targetAmount: project.targetAmount,
        percent,
        contributorCount,
        status: project.status,
      };
    }

    case "get_impact_passport": {
      const project = await prisma.project.findUnique({
        where: { id: args.projectId },
        include: { milestones: true, impactMetrics: true, contributions: true },
      });
      if (!project) return { error: "Project not found." };
      const contributorCount = new Set(project.contributions.map((c) => c.userId)).size;
      return {
        projectId: project.id,
        title: project.title,
        category: project.category,
        location: project.location,
        status: project.status,
        tokenSymbol: project.tokenSymbol,
        funding: {
          raisedAmount: project.raisedAmount,
          targetAmount: project.targetAmount,
          contributorCount,
        },
        milestones: project.milestones.map((m) => ({
          title: m.title,
          status: m.status,
          description: m.description,
          completedAt: m.completedAt,
        })),
        impact: project.impactMetrics.map((metric) => ({
          metricName: metric.metricName,
          currentValue: metric.currentValue,
          targetValue: metric.targetValue,
          unit: metric.unit,
        })),
      };
    }

    case "get_milestones": {
      const milestones = await prisma.milestone.findMany({ where: { projectId: args.projectId } });
      return { milestones };
    }

    case "request_evidence": {
      const milestone = await prisma.milestone.findUnique({ where: { id: args.milestoneId } });
      if (!milestone) return { error: "Milestone not found." };
      return {
        acknowledged: true,
        message: `Evidence request noted for milestone "${milestone.title}"${args.note ? `: ${args.note}` : ""}. (Notification delivery not yet wired up.)`,
      };
    }

    case "prepare_funding": {
      const project = await prisma.project.findUnique({ where: { id: args.projectId } });
      if (!project) return { error: "Project not found." };
      return {
        action: "fund_project",
        projectId: project.id,
        projectTitle: project.title,
        tokenSymbol: project.tokenSymbol,
        amount: args.amount,
        note: "This only prepares the action. The person must review and approve it, then sign each transaction in their wallet.",
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
