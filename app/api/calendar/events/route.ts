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

async function writeData(data: any) {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.events || []);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const data = await readData();

  const event = { ...payload };
  // ensure id
  if (!event.id) event.id = Date.now();

  data.events = data.events || [];
  data.events.push(event);

  await writeData(data);

  return NextResponse.json(event, { status: 201 });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const data = await readData();

  data.events = data.events || [];
  const index = data.events.findIndex((e: any) => String(e.id) === String(payload.id));
  if (index === -1) return new NextResponse(null, { status: 404 });

  data.events[index] = payload;
  await writeData(data);

  return NextResponse.json(payload);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse(null, { status: 400 });

  const data = await readData();
  data.events = (data.events || []).filter((e: any) => String(e.id) !== String(id));
  await writeData(data);

  return new NextResponse(null, { status: 204 });
}
