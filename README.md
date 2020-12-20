
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/MaximilianHeidenreich/DsDDB">
    <img src="https://deno.land/images/deno_matrix.png" alt="Deno Logo" width="80" height="80">
  </a>

  <h2 align="center">DsDDB</h2>

  <p align="center">
    A lightweight, develoepr friendly, key-value persistant storage solution for Deno projects</a>.
    <br />
    <a href="https://doc.deno.land/https/deno.land/x/dsddb/mod.ts"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/MaximilianHeidenreich/DsDDB/issues">Report Bug</a>
    ·
    <a href="https://github.com/MaximilianHeidenreich/DsDDB/issues">Request Feature</a>
  </p>
</p>

<br><br>
<!-- ABOUT THE PROJECT -->
## About The Project

I created this project because I needed a super simple key-value database which could store data between script restarts. This is the result of that attempt.

Obviously it can't hold up with "real" databases but if you are just starting out developing a new project and you want a dead simple way to store data, this probably is the solution for you.

If you want to use it, please check out the docs for the project.

### Project Goals

- Store & Access key-value pairs (support for primitive & custom values)
- Write stored data to disk
- Load stored data from disk
- Expose a dead simple API to developers
- Don't include anything else other than Deno std

<br>

<!-- USAGE -->
## Usage

This is the most basic example to get DsDDB up and running within your project. For further infroamtion check out the [API Documentation](https://doc.deno.land/https/deno.land/x/dsddb/mod.ts).

```TypeScript
// 1. Import DsDDB
import { DsDDB } from "https://deno.land/x/dsddb@v2.0.0/mod.ts";

// 2. Create new DsDDB instance
const database = new DsDDB();

// 3. Load from disk
await database.load();

// 4. Use database
database.set("key1", "value 1")                 // Always override value.
database.set("myKey", "Hello World", false);    // Never  override value.

console.log(database.get("myKey"));

// 5. Write data to disk
await database.write();
```


If you want to store custom data structures, there's a solution to that as well.

```TypeScript
// 1. Import DsDDB
import { DsDDB } from "https://deno.land/x/dsddb@v2.0.0/mod.ts";

// 2. Define your data structure.
interface IDino {
    name: string;
    size: number;
    birthday: Date;
}

// 3. Define your data.
let data1: IDino = {
    name: "Deno",
    size: 69,
    birthday: new Date()
};

// 4. Create new DsDDB instance
const database = new DsDDB<IDino>();

// 5. Load from disk
await database.load();

// 6. Use database
database.set("deno", data1)

console.log(database.get("deno"));

// 7. Write data to disk
await database.write();
```