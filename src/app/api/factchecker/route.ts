import { NextRequest, NextResponse } from "next/server";
import { runFactChecker } from "@/lib/agents/factchecker";
import * as Diff from "diff";

export const maxDuration = 120; // 120s max for fact-checker

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, clientWebsite } = body;

        if (!content || !clientWebsite) {
            return NextResponse.json({ error: "Missing content or clientWebsite" }, { status: 400 });
        }

        console.log(`[Fact Checker API] Processing content for ${clientWebsite}...`);
        const finalOutput = await runFactChecker(content, clientWebsite);

        // Diff calculation
        const changes = Diff.diffWords(content, finalOutput)
            .filter(part => part.added || part.removed)
            .map(part => ({
                type: part.added ? "addition" : "deletion",
                value: part.value
            }));

        return NextResponse.json({
            final: finalOutput,
            changes
        });

    } catch (error) {
        const e = error as Error;
        console.error("[Fact Checker API] Error:", e);
        return NextResponse.json(
            { error: e.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
