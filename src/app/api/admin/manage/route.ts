import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
import { getAuthUser } from "@/lib/auth";

const configurations: Record<string, {
  table: string;
  id: string;
  fields: string[];
  required: string[];
}> = {
  assets: {
    table: "ASSET",
    id: "AssetID",
    fields: ["AssetID", "OwnerID", "Title", "Type", "Description", "Format", "ReleaseDate", "Status"],
    required: ["AssetID", "OwnerID", "Title"],
  },
  owners: {
    table: "OWNER",
    id: "OwnerID",
    fields: ["OwnerID", "Name", "Organization", "Type", "ContactInfo"],
    required: ["OwnerID", "Name"],
  },
  licensees: {
    table: "LICENSEE",
    id: "LicenseeID",
    fields: ["LicenseeID", "Name", "Organization", "Type", "ContactInfo"],
    required: ["LicenseeID", "Name"],
  },
  territories: {
    table: "TERRITORY",
    id: "TerritoryID",
    fields: ["TerritoryID", "Name", "Region", "Country", "Description"],
    required: ["TerritoryID", "Name"],
  },
  rights: {
    table: "RIGHT_ENT",
    id: "RightID",
    fields: ["RightID", "RightName", "Description", "Category"],
    required: ["RightID", "RightName"],
  },
};

async function authorize() {
  const user = await getAuthUser();
  return user?.role === "ADMIN";
}

function getConfig(entity: string) {
  return configurations[entity];
}

function normalizeRecord(record: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    normalized[key] = typeof value === "string"
      ? value.trim()
      : value;
  }

  return normalized;
}

function validateRecord(config: NonNullable<ReturnType<typeof getConfig>>, body: Record<string, unknown>) {
  for (const field of config.required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "") {
      return `${field} is required.`;
    }
  }

  const idValue = body[config.id];

  if (
    typeof idValue !== "string" ||
    !/^[A-Za-z0-9_-]+$/.test(idValue)
  ) {
    return `${config.id} must contain only letters, numbers, hyphens or underscores.`;
  }

  for (const field of config.fields) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string" && typeof body[field] !== "number" && typeof body[field] !== "boolean") {
      return `${field} has an invalid value.`;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!(await authorize())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  const entity = request.nextUrl.searchParams.get("entity") || "";
  const config = getConfig(entity);

  if (!config) {
    return NextResponse.json({ message: "Invalid entity." }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${config.table}\` ORDER BY \`${config.id}\``
    );

    return NextResponse.json({ success: true, records: rows });
  } catch (error) {
    console.error("Admin records error:", error);
    return NextResponse.json({ message: "Unable to retrieve records." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await authorize())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const config = getConfig(String(body.entity || ""));

    if (!config || !body.record || typeof body.record !== "object" || Array.isArray(body.record)) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    const record = normalizeRecord(
  body.record as Record<string, unknown>
);
    const validationError = validateRecord(config, record);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const fields = config.fields.filter((field) => record[field] !== undefined);
    const values = fields.map((field) => record[field] === "" ? null : record[field]);

    const placeholders = fields.map(() => "?").join(", ");
    const columns = fields.map((field) => `\`${field}\``).join(", ");

    await pool.query(
      `INSERT INTO \`${config.table}\` (${columns}) VALUES (${placeholders})`,
      values
    );

    return NextResponse.json({ success: true, message: "Record created successfully." });
  } catch (error) {
    console.error("Admin create error:", error);
     return NextResponse.json(
      { message: "Unable to create record. Check the server terminal for details." },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await authorize())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const config = getConfig(String(body.entity || ""));

    if (!config || !body.record || typeof body.record !== "object" || Array.isArray(body.record)) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    const record = normalizeRecord(
  body.record as Record<string, unknown>
);
    const idValue = record[config.id];

    if (idValue === undefined || String(idValue).trim() === "") {
      return NextResponse.json({ message: `${config.id} is required.` }, { status: 400 });
    }

    const validationError = validateRecord(config, record);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const fields = config.fields.filter((field) => field !== config.id && record[field] !== undefined);

    if (fields.length === 0) {
      return NextResponse.json({ message: "No fields to update." }, { status: 400 });
    }

    const values = fields.map((field) => record[field] === "" ? null : record[field]);
    values.push(idValue);

    const assignments = fields.map((field) => `\`${field}\` = ?`).join(", ");

    const [result] = await pool.query(
      `UPDATE \`${config.table}\` SET ${assignments} WHERE \`${config.id}\` = ?`,
      values
    );

    const affected = (result as { affectedRows: number }).affectedRows;

    if (!affected) {
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Record updated successfully." });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ message: "Unable to update record. Check related records and field values." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await authorize())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const config = getConfig(String(body.entity || ""));
    const id = body.id;

    if (!config || id === undefined || String(id).trim() === "") {
      return NextResponse.json({ message: "Invalid entity or record ID." }, { status: 400 });
    }

    const [result] = await pool.query(
      `DELETE FROM \`${config.table}\` WHERE \`${config.id}\` = ?`,
      [id]
    );

    const affected = (result as { affectedRows: number }).affectedRows;

    if (!affected) {
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ message: "Cannot delete this record because it may be referenced by other records." }, { status: 409 });
  }
}