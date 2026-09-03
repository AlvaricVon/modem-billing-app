import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSession, getSessionToken } from "../check/route";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const DATA_FILE_PATH = process.env.GITHUB_DATA_FILE_PATH ?? "data/customer-data.json";

export async function GET(req: NextRequest) {
  const token = getSessionToken(req);
  if (!isValidAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "Server configuration error: GitHub env vars missing" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json(
        { error: "Failed to fetch data from GitHub" },
        { status: res.status }
      );
    }

    const fileData = (await res.json()) as { content?: string };
    if (!fileData.content) {
      return NextResponse.json({ data: [] });
    }

    const decoded = Buffer.from(fileData.content, "base64")
      .toString("utf8")
      .replace(/^\uFEFF/, "");
    const data = JSON.parse(decoded);
    return NextResponse.json({ data: Array.isArray(data) ? data : [] });
  } catch (err) {
    console.error("Admin data fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
