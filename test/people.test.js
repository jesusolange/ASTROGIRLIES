import test from "node:test";
import assert from "node:assert/strict";
import * as Store from "../src/scripts/storage.js";
import {
  PEOPLE_KEY, PIN_MAX, PIN_MIN, activePerson, addToList, clearPinFor, isValidPin, makePin, newId,
  personById, pinEntryErrors, prepareDevice, removeFromList, savePinFor, verifyPin
} from "../src/scripts/people.js";

const fake = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};

function deviceWith(list) {
  const api = Store.create(fake({ [PEOPLE_KEY]: JSON.stringify(list) }));
  globalThis.window = { AstroMedStore: { store: api } };
  return api;
}

const storedPeople = (api) => api.registry.get(PEOPLE_KEY, []);

test("the list adds, finds and removes people by id", () => {
  const list = addToList([], { id: "a", name: "Ada" });
  const withB = addToList(list, { id: "b", name: "Bo" });
  assert.deepEqual(withB.map((person) => person.name), ["Ada", "Bo"]);
  assert.equal(personById(withB, "b").name, "Bo");
  assert.equal(activePerson(withB, "a").name, "Ada");
  assert.equal(activePerson(withB, null), null);
  assert.deepEqual(removeFromList(withB, "a").map((person) => person.id), ["b"]);
});

test("a person needs a name and a unique id", () => {
  assert.throws(() => addToList([], { id: "a", name: "  " }), /name/i);
  assert.throws(() => addToList([{ id: "a", name: "Ada" }], { id: "a", name: "Bo" }), /already/i);
  assert.throws(() => addToList([], { name: "No id" }), /identifier/i);
});

test("added records keep the pin fields and trim the name", () => {
  const [person] = addToList([], { id: "a", name: "  Ada  ", pinSalt: "s", pinHash: "h" });
  assert.equal(person.name, "Ada");
  assert.equal(person.pinSalt, "s");
  assert.equal(person.pinHash, "h");
});

test("new ids do not collide with the people already on the device", () => {
  const list = [{ id: "fixed" }];
  for (let i = 0; i < 20; i++) assert.notEqual(newId(list), "fixed");
});

test("a PIN is 4 to 8 digits and nothing else", () => {
  assert.equal(isValidPin("1234"), true);
  assert.equal(isValidPin("12345678"), true);
  assert.equal(isValidPin("123"), false);
  assert.equal(isValidPin("123456789"), false);
  assert.equal(isValidPin("12a4"), false);
  assert.equal(isValidPin("１２３４"), false);
  assert.equal(isValidPin(null), false);
  assert.equal(PIN_MIN, 4);
  assert.equal(PIN_MAX, 8);
});

test("the stored PIN is a salted hash, not the digits", async () => {
  const a = await makePin("2468");
  const b = await makePin("2468");
  assert.ok(a.pinSalt && a.pinHash);
  assert.notEqual(a.pinSalt, b.pinSalt);
  assert.notEqual(a.pinHash, b.pinHash);
  assert.doesNotMatch(a.pinHash, /2468/);
  assert.equal(Object.keys(a).sort().join(","), "pinHash,pinSalt");
});

test("a PIN verifies only with the right digits", async () => {
  const code = await makePin("13579");
  const person = { id: "a", name: "Ada", ...code };
  assert.equal(await verifyPin(person, "13579"), true);
  assert.equal(await verifyPin(person, "13578"), false);
  assert.equal(await verifyPin(person, "1357"), false);
  assert.equal(await verifyPin(person, ""), false);
});

test("a person without a PIN needs no digits", async () => {
  assert.equal(await verifyPin({ id: "a", name: "Ada", pinSalt: null, pinHash: null }, ""), true);
  assert.equal(await verifyPin(null, "1234"), true);
});

test("data saved before people existed becomes the first person with no PIN", () => {
  const s = Store.create(fake({
    "astromed-profile": '{"name":"Ada","missionType":"mars-planetary"}',
    "astrotwin-exercise-sessions": "[1]",
  }));
  const list = prepareDevice(s);
  assert.equal(list.length, 1);
  assert.equal(list[0].name, "Ada");
  assert.equal(list[0].pinHash, null);
  assert.equal(list[0].pinSalt, null);
  s.setActive(list[0].id);
  assert.deepEqual(s.get("astromed-profile"), { name: "Ada", missionType: "mars-planetary" });
  assert.deepEqual(s.get("astrotwin-exercise-sessions"), [1]);
});

test("an empty device gets no person until someone adds one", () => {
  const s = Store.create(fake());
  assert.deepEqual(prepareDevice(s), []);
});

test("a new PIN needs a 4 to 8 digit entry typed twice the same", () => {
  assert.deepEqual(pinEntryErrors("13579", "13578"), { repeat: "The new PINs do not match." });
  assert.deepEqual(pinEntryErrors("135", "135"), { pin: "Use 4 to 8 digits." });
  assert.deepEqual(pinEntryErrors("13579", "13579"), {});
});

test("a mismatched repeat stores nothing", async () => {
  const code = await makePin("2468");
  const api = deviceWith([{ id: "a", name: "Ada", ...code }]);
  try {
    const result = await savePinFor("a", "1357", "1358", "2468");
    assert.equal(result.ok, false);
    assert.ok(result.errors.repeat);
    assert.equal(storedPeople(api)[0].pinHash, code.pinHash);
  } finally {
    delete globalThis.window;
  }
});

test("changing a PIN fails with the wrong current PIN and succeeds with the right one", async () => {
  const code = await makePin("2468");
  const api = deviceWith([{ id: "a", name: "Ada", ...code }]);
  try {
    const refused = await savePinFor("a", "1357", "1357", "0000");
    assert.equal(refused.ok, false);
    assert.ok(refused.errors.current);
    assert.equal(await verifyPin(storedPeople(api)[0], "2468"), true);

    const changed = await savePinFor("a", "1357", "1357", "2468");
    assert.equal(changed.ok, true);
    assert.equal(await verifyPin(storedPeople(api)[0], "1357"), true);
    assert.equal(await verifyPin(storedPeople(api)[0], "2468"), false);
  } finally {
    delete globalThis.window;
  }
});

test("removing a PIN fails with the wrong current PIN and succeeds with the right one", async () => {
  const code = await makePin("2468");
  const api = deviceWith([{ id: "a", name: "Ada", ...code }]);
  try {
    const refused = await clearPinFor("a", "0000");
    assert.equal(refused.ok, false);
    assert.ok(refused.errors.current);
    assert.equal(storedPeople(api)[0].pinHash, code.pinHash);

    const removed = await clearPinFor("a", "2468");
    assert.equal(removed.ok, true);
    assert.equal(storedPeople(api)[0].pinHash, null);
    assert.equal(storedPeople(api)[0].pinSalt, null);
  } finally {
    delete globalThis.window;
  }
});
