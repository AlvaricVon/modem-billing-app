import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const DATA_FILE_PATH = process.env.GITHUB_DATA_FILE_PATH ?? "data/customer-data.json";

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "Server configuration error: GitHub env vars missing" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const required = [
    "nama_pelanggan",
    "no_pelanggan",
    "ssid",
    "password",
    "no_hp",
    "email",
    "paket_internet",
    "tanggal_instalasi",
    "alamat",
  ];

  for (const key of required) {
    if (typeof body[key] !== "string" || !body[key]) {
      return NextResponse.json(
        { error: `Field "${key}" is required` },
        { status: 400 }
      );
    }
  }

  const record = {
    ...body,
    submitted_at: new Date().toISOString(),
  };

  const apiBase = "https://api.github.com";

  try {
    let fileSha: string | null = null;
    const getFileRes = await fetch(
      `${apiBase}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    let existingData: unknown[] = [];

    if (getFileRes.ok) {
      const fileData = (await getFileRes.json()) as {
        sha?: string;
        content?: string;
      };
      fileSha = fileData.sha ?? null;

      if (fileData.content) {
        const decoded = Buffer.from(fileData.content, "base64").toString("utf8");
        try {
          existingData = JSON.parse(decoded);
          if (!Array.isArray(existingData)) existingData = [];
        } catch {
          existingData = [];
        }
      }
    }

    existingData.push(record);

    const newContent = JSON.stringify(existingData, null, 2);
    const encodedContent = Buffer.from(newContent, "utf8").toString("base64");

    const commitRes = await fetch(
      `${apiBase}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add customer data: ${body.nama_pelanggan}`,
          content: encodedContent,
          ...(fileSha ? { sha: fileSha } : {}),
        }),
      }
    );

    if (!commitRes.ok) {
      const errText = await commitRes.text();
      console.error("GitHub commit error:", errText);
      return NextResponse.json(
        { error: "Failed to save data to GitHub" },
        { status: commitRes.status }
      );
    }

    return NextResponse.json(
      { message: "Data submitted successfully", record },
      { status: 200 }
    );
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
