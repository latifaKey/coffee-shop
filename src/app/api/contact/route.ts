import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Topic = "Umum" | "Kolaborasi" | "Kemitraan" | "Komplain" | "Lainnya";

type ContactRecord = {
	id: string;
	createdAt: string; // ISO string
	name: string;
	email: string;
	code: string; // e.g. +62
	phone: string;
	topic?: Topic;
	subject: string;
	message: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "contacts.json");

async function ensureDataFile() {
	await fs.mkdir(DATA_DIR, { recursive: true });
	try {
		await fs.access(DATA_FILE);
	} catch {
		await fs.writeFile(DATA_FILE, "[]", "utf8");
	}
}

async function readAll(): Promise<ContactRecord[]> {
	await ensureDataFile();
	const raw = await fs.readFile(DATA_FILE, "utf8");
	try {
		const data = JSON.parse(raw);
		return Array.isArray(data) ? (data as ContactRecord[]) : [];
	} catch {
		// if file is corrupted, reset to empty array
		await fs.writeFile(DATA_FILE, "[]", "utf8");
		return [];
	}
}

async function appendRecord(record: ContactRecord) {
	const all = await readAll();
	all.push(record);
	await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function GET(req: NextRequest) {
	try {
		const ADMIN_KEY = process.env.ADMIN_KEY || "barizta-dev";
		const keyFromHeader = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
		const keyFromQuery = req.nextUrl.searchParams.get("key");
		if ((keyFromHeader || keyFromQuery) !== ADMIN_KEY) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const all = await readAll();
		return Response.json({ ok: true, data: all });
	} catch {
		return Response.json({ ok: false, error: "Gagal membaca data." }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => null);
		if (!body || typeof body !== "object") {
			return Response.json({ error: "Payload tidak valid" }, { status: 400 });
		}

		const name = String(body.name || "").trim();
		const email = String(body.email || "").trim();
		const code = String(body.code || "").trim();
		const phone = String(body.phone || "").trim();
		const topic = body.topic as Topic | undefined;
		const subject = String(body.subject || "").trim();
		const message = String(body.message || "").trim();

		const emailOk = /^\S+@\S+\.\S+$/.test(email);
		const phoneOk = /\d{8,}/.test(phone.replace(/[^\d]/g, ""));

		if (!name || !emailOk || !phoneOk || !subject || !message) {
			return Response.json(
				{ error: "Validasi gagal. Pastikan data lengkap dan benar." },
				{ status: 400 }
			);
		}

		const record: ContactRecord = {
			id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			createdAt: new Date().toISOString(),
			name,
			email,
			code,
			phone,
			topic,
			subject,
			message,
		};

		await appendRecord(record);
		return Response.json({ ok: true, data: record }, { status: 201 });
		} catch {
			return Response.json({ error: "Gagal menyimpan data." }, { status: 500 });
		}
}

export const dynamic = "force-dynamic";

