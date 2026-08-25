import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../src/lib/password";
import * as schema from "../src/db/schema";

const { users } = schema;

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.SEED_ADMIN_EMAIL ?? "info@nillihcband.com";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        role: "superadmin",
        name: "Nillihc Superadmin",
      })
      .where(eq(users.id, existing.id));

    console.log(`Updated superadmin user: ${email}`);
  } else {
    await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      role: "superadmin",
      name: "Nillihc Superadmin",
    });

    console.log(`Created superadmin user: ${email}`);
  }

  await client.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
