import { DsDDB } from "./mod.ts";
import { exists } from "./deps.ts";
import { assertEquals } from "./test_deps.ts";

Deno.test("Empty DB", async () => {

    let db = new DsDDB();
    await db.load();
    await db.write();

    assertEquals(await exists(db.storePath), false);

});

Deno.test("Simple Numer DB", async () => {

    let db = new DsDDB();
    await db.load();

    db.set("number1", 5);
    db.set("number2", 10);

    await db.write();

    assertEquals(await exists(db.storePath), true);

    await Deno.remove(db.storePath);

});

Deno.test("DB delete store", async () => {

    let db = new DsDDB();
    await db.load();

    db.set("number1", 5);
    db.set("number2", 10);

    await db.write();

    assertEquals(await exists(db.storePath), true);

    await db.deleteStore()

    // Make sure to clean up first in case of assert failure.
    let x = await exists(db.storePath);
    if (x) await Deno.remove(db.storePath);

    assertEquals(x, false);
    

});