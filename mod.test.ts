import { DsDDB } from "./mod.ts";
import { assertExists, assertThrows } from "./test_deps.ts";

Deno.test("Empty DB", async () => {
  let db = new DsDDB();
  await db.load();
  await db.write();

  assertThrows(() => Deno.readFileSync(db.storePath));
});

Deno.test("Simple Numer DB", async () => {
  let db = new DsDDB();
  await db.load();

  db.set("number1", 5);
  db.set("number2", 10);

  await db.write();

  assertExists(Deno.readFileSync(db.storePath));
  await Deno.remove(db.storePath);
});

Deno.test("DB delete store", async () => {
  let db = new DsDDB();
  await db.load();

  db.set("number1", 5);
  db.set("number2", 10);

  await db.write();
  assertExists(Deno.readFileSync(db.storePath));
  await db.deleteStore();
  assertThrows(() => Deno.readFileSync(db.storePath));
});
