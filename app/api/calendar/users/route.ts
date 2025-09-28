import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const DATA_PATH = path.join(process.cwd(), "data", "calendar-events.json");

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    return { events: [], users: [] };
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.users || []);
}
