import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = process.env.GITHUB_TOKEN;
        const repoUrl = process.env.GITHUB_REPO; // Expected format: owner/repo

        if (!token || !repoUrl) {
            console.error("Missing GITHUB_TOKEN or GITHUB_REPO env vars");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const [owner, repo] = repoUrl.split("/");
        const octokit = new Octokit({ auth: token });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        let issues = [];

        if (query) {
            // Search mode
            const { data } = await octokit.rest.search.issuesAndPullRequests({
                q: `repo:${owner}/${repo} is:issue is:open ${query}`,
                per_page: 20
            });
            issues = data.items;
        } else {
            // List mode (default to enhancement/bugs or just all open issues)
            // For backlog backlog, we probably want all open issues, maybe filtered by enhancement if desired
            const { data } = await octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: "open",
                per_page: 20,
                sort: "updated",
                direction: "desc"
            });
            issues = data;
        }

        // Simplify response
        const simplifiedIssues = issues.map((issue: any) => ({
            id: issue.number,
            title: issue.title,
            html_url: issue.html_url,
            state: issue.state,
            labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color })),
            created_at: issue.created_at,
            user: issue.user ? issue.user.login : "Unknown"
        }));

        return NextResponse.json({ issues: simplifiedIssues });

    } catch (error: any) {
        console.error("Error fetching issues:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch issues"
        }, { status: 500 });
    }
}
