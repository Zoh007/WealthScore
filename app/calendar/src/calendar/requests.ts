import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "calendar-events.json");

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

export const getEvents = async () => {
  const data = await readData();
  if (data && Array.isArray(data.events)) return data.events;
  return CALENDAR_ITENS_MOCK;
};

export const getUsers = async () => {
  const data = await readData();
  if (data && Array.isArray(data.users)) return data.users;
  return USERS_MOCK;
};
