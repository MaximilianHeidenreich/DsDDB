import { KvDDB } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

// Utils for working with test environment.
function resetTestEnv() {
    Deno.removeSync("./test/.dsddb", { recursive: true });
}

Deno.test("KvDDB - Create store file", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.write(true);
    //assertEquals(existsSync("./.dsddb/.kvddb.json"), true); // TODO: impl
});

Deno.test("KvDDB - Set", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.write(true);

    assertEquals(db.cache.get("hello"), "world");
});

Deno.test("KvDDB - Get", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.write(true);

    assertEquals(db.get("hello"), "world");
    assertEquals(db.get("fifi"), null);
});

Deno.test("KvDDB - Has", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.write(true);

    assertEquals(db.has("hello"), true);
    assertEquals(db.has("foo"), false);
});

Deno.test("KvDDB - Size", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.set("foo", "bar");
    db.set("fizz", 123);
    db.write(true);

    assertEquals(db.size, 3);
});

Deno.test("KvDDB - Delete", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.set("foo", "bar");
    db.write(true);

    assertEquals(db.size, 2);

    db.delete("hello");

    assertEquals(db.size, 1);
    assertEquals(db.has("hello"), false);
    assertEquals(db.cache.has("hello"), false);
    assertEquals(db.has("foo"), true);
    assertEquals(db.get("hello"), null);
});

Deno.test("KvDDB - Clear", () => {
    resetTestEnv();
    const db = new KvDDB();
    db.set("hello", "world");
    db.set("foo", "bar");
    db.write(true);

    assertEquals(db.size, 2);

    db.clear();

    assertEquals(db.size, 0);
    assertEquals(db.has("hello"), false);
    assertEquals(db.cache.has("hello"), false);
    assertEquals(db.has("foo"), false);
    assertEquals(db.get("hello"), null);
});
