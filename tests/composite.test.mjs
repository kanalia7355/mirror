import { test } from "node:test";
import assert from "node:assert/strict";
import { composite } from "../lib/imageProcessing/composite.ts";
globalThis.ImageData = class {
  constructor(a, b, c) {
    if (typeof a === "number") {
      this.width = a;
      this.height = b;
      this.data = new Uint8ClampedArray(a * b * 4);
    } else {
      this.data = a;
      this.width = b;
      this.height = c;
    }
  }
};
const current = new ImageData(
  new Uint8ClampedArray([100, 80, 60, 255, 200, 180, 160, 255]),
  2,
  1,
);
const background = new ImageData(
  new Uint8ClampedArray([20, 40, 50, 255, 30, 50, 70, 255]),
  2,
  1,
);
test("person pixels are replaced, background pixels remain live", () => {
  const out = composite(
    current,
    background,
    new Float32Array([1, 0]),
    2,
    1,
    "Transparent",
    0.5,
    0,
  );
  assert.deepEqual([...out.data], [20, 40, 50, 255, 200, 180, 160, 255]);
  assert.equal(current.data[0], 100);
});
test("ghost blends at 50% and low-resolution masks scale to every pixel", () => {
  const out = composite(
    current,
    background,
    new Float32Array([1]),
    1,
    1,
    "Ghost",
    0.5,
    0,
  );
  assert.deepEqual([...out.data], [60, 60, 55, 255, 115, 115, 115, 255]);
});
test("mask threshold yields a feathered boundary instead of an abrupt step", () => {
  const out = composite(
    current,
    background,
    new Float32Array([0.5, 0]),
    2,
    1,
    "Transparent",
    0.5,
    0,
  );
  assert.equal(out.data[0], 60);
});
