// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class PoapToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoapToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoapToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoapToken", id.toString(), this);
  }

  static load(id: string): PoapToken | null {
    return store.get("PoapToken", id) as PoapToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get event(): string | null {
    let value = this.get("event");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set event(value: string | null) {
    if (value === null) {
      this.unset("event");
    } else {
      this.set("event", Value.fromString(value as string));
    }
  }

  get currentOwner(): string {
    let value = this.get("currentOwner");
    return value.toString();
  }

  set currentOwner(value: string) {
    this.set("currentOwner", Value.fromString(value));
  }

  get claimedBy(): string {
    let value = this.get("claimedBy");
    return value.toString();
  }

  set claimedBy(value: string) {
    this.set("claimedBy", Value.fromString(value));
  }

  get transferCount(): BigInt {
    let value = this.get("transferCount");
    return value.toBigInt();
  }

  set transferCount(value: BigInt) {
    this.set("transferCount", Value.fromBigInt(value));
  }

  get created(): BigInt {
    let value = this.get("created");
    return value.toBigInt();
  }

  set created(value: BigInt) {
    this.set("created", Value.fromBigInt(value));
  }
}

export class PoapOwner extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoapOwner entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoapOwner entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoapOwner", id.toString(), this);
  }

  static load(id: string): PoapOwner | null {
    return store.get("PoapOwner", id) as PoapOwner | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokensOwned(): BigInt {
    let value = this.get("tokensOwned");
    return value.toBigInt();
  }

  set tokensOwned(value: BigInt) {
    this.set("tokensOwned", Value.fromBigInt(value));
  }

  get tokensMinted(): BigInt {
    let value = this.get("tokensMinted");
    return value.toBigInt();
  }

  set tokensMinted(value: BigInt) {
    this.set("tokensMinted", Value.fromBigInt(value));
  }

  get tokens(): Array<string> | null {
    let value = this.get("tokens");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set tokens(value: Array<string> | null) {
    if (value === null) {
      this.unset("tokens");
    } else {
      this.set("tokens", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class PoapEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoapEvent entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoapEvent entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoapEvent", id.toString(), this);
  }

  static load(id: string): PoapEvent | null {
    return store.get("PoapEvent", id) as PoapEvent | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokenCount(): BigInt {
    let value = this.get("tokenCount");
    return value.toBigInt();
  }

  set tokenCount(value: BigInt) {
    this.set("tokenCount", Value.fromBigInt(value));
  }

  get created(): BigInt {
    let value = this.get("created");
    return value.toBigInt();
  }

  set created(value: BigInt) {
    this.set("created", Value.fromBigInt(value));
  }

  get tokens(): Array<string> | null {
    let value = this.get("tokens");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set tokens(value: Array<string> | null) {
    if (value === null) {
      this.unset("tokens");
    } else {
      this.set("tokens", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class PoapTransfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoapTransfer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoapTransfer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoapTransfer", id.toString(), this);
  }

  static load(id: string): PoapTransfer | null {
    return store.get("PoapTransfer", id) as PoapTransfer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): string {
    let value = this.get("token");
    return value.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get from(): string {
    let value = this.get("from");
    return value.toString();
  }

  set from(value: string) {
    this.set("from", Value.fromString(value));
  }

  get to(): string {
    let value = this.get("to");
    return value.toString();
  }

  set to(value: string) {
    this.set("to", Value.fromString(value));
  }

  get time(): BigInt {
    let value = this.get("time");
    return value.toBigInt();
  }

  set time(value: BigInt) {
    this.set("time", Value.fromBigInt(value));
  }
}
