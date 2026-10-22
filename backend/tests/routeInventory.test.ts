// WAJIB import pertama: menyiapkan env test sebelum modul aplikasi diimpor.
import "./helpers/testEnv";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import router from "../routes";
import app from "../app";

type BaselineHandler = { name: string; arity: number };
type BaselineRoute = {
  order: number;
  method: string;
  path: string;
  handlers: BaselineHandler[];
};
type Baseline = {
  mountPrefix: string;
  routeCount: number;
  routes: BaselineRoute[];
  appRoutes: BaselineRoute[];
};

/**
 * Bentuk internal layer Express yang dipakai untuk introspeksi. `methods`
 * dan `stack` ada pada objek Route, tapi tidak dideklarasikan di tipe
 * `IRoute` milik @types/express - jadi bentuknya dideklarasikan di sini.
 */
type RouteInfo = {
  methods: Record<string, boolean>;
  path: string;
  stack: Array<{ name: string; handle: { length: number } }>;
};
type RouteLayer = { route?: RouteInfo };

/**
 * Baseline dibaca dari FILE, bukan dihitung ulang saat test berjalan.
 * File baseline hanya diubah dengan sengaja (dalam review) - tidak ada
 * script yang memperbaruiinya secara otomatis, supaya perubahan kontrak
 * tidak bisa tersamarkan.
 */
const baseline: Baseline = JSON.parse(
  fs.readFileSync(path.join(__dirname, "baseline", "routes.json"), "utf8")
);

function describeLayers(layers: RouteLayer[]): BaselineRoute[] {
  return layers
    .filter((layer) => layer.route)
    .map((layer, index) => {
      const route = layer.route as RouteInfo;
      return {
        order: index + 1,
        method: Object.keys(route.methods)
          .filter((m) => m !== "_all")
          .map((m) => m.toUpperCase())
          .sort()
          .join(","),
        path: route.path,
        handlers: route.stack.map((handler) => ({
          name: handler.name,
          arity: handler.handle.length,
        })),
      };
    });
}

function liveRoutes(): BaselineRoute[] {
  return describeLayers(router.stack as unknown as RouteLayer[]);
}

function liveAppRoutes(): BaselineRoute[] {
  return describeLayers(app.router.stack as unknown as RouteLayer[]);
}

describe("L0 - inventaris routing", () => {
  it("jumlah route pada router sama dengan baseline", () => {
    const live = liveRoutes();
    assert.equal(
      live.length,
      baseline.routeCount,
      `Jumlah route berubah: baseline ${baseline.routeCount}, sekarang ${live.length}. ` +
        `Periksa routes.ts dan perbarui tests/baseline/routes.json bila perubahan itu disengaja.`
    );
    assert.equal(baseline.routeCount, 24);
  });

  it("method, path, urutan, dan rantai handler identik dengan baseline", () => {
    assert.deepEqual(
      liveRoutes(),
      baseline.routes,
      "Kontrak routing berubah (method/path/urutan/rantai handler)."
    );
  });

  it("route level aplikasi (health check) identik dengan baseline", () => {
    assert.deepEqual(liveAppRoutes(), baseline.appRoutes);
  });

  it("tidak ada method+path yang terdaftar ganda", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const route of liveRoutes()) {
      const key = `${route.method} ${route.path}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    assert.deepEqual(duplicates, [], "Route terdaftar ganda");
  });

  it("path yang sama dengan method berbeda tetap boleh ada", () => {
    // GET/POST /jobs memang berbagi path.
    const jobs = liveRoutes().filter((r) => r.path === "/jobs");
    assert.deepEqual(
      jobs.map((r) => r.method).sort(),
      ["GET", "POST"]
    );
  });

  it("handler inline GET /profile tetap arity 2, bukan middleware authorize", () => {
    // Keduanya '<anonymous>'; arity yang membedakan:
    //   authorize() -> (req, res, next) = 3
    //   inline /profile handler -> (req, res) = 2
    const profile = liveRoutes().find(
      (r) => r.method === "GET" && r.path === "/profile"
    );
    assert.ok(profile, "GET /profile harus terdaftar");
    assert.equal(profile.handlers.length, 2);
    assert.equal(profile.handlers[0].name, "verifyToken");
    assert.equal(profile.handlers[1].name, "<anonymous>");
    assert.equal(profile.handlers[1].arity, 2);
  });

  it("11 route memakai authorize() (verifyToken -> anonymous arity 3 -> handler)", () => {
    const roleGated = liveRoutes().filter(
      (r) =>
        r.handlers[0]?.name === "verifyToken" &&
        r.handlers[1]?.name === "<anonymous>" &&
        r.handlers[1]?.arity === 3
    );
    assert.equal(roleGated.length, 11);
  });
});
