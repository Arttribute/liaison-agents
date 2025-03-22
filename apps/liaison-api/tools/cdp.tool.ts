import { Wallet } from "@coinbase/coinbase-sdk";
import type { Except, PickDeep } from "type-fest";

type ReplaceBigInt<T> = T extends bigint
  ? number
  : T extends (infer U)[]
  ? ReplaceBigInt<U>[]
  : T extends object
  ? { [K in keyof T]: ReplaceBigInt<T[K]> }
  : T;

// Transform function parameters
type TransformParams<T> = T extends (...args: infer A) => infer R
  ? A extends [infer First]
    ? (props: ReplaceBigInt<First>) => R
    : (...args: { [K in keyof A]: ReplaceBigInt<A[K]> }) => R
  : T;

type TransformClass<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? TransformParams<T[K]>
    : T[K];
};

export interface CDPTool
  extends PickDeep<TransformClass<Wallet>, "createTransfer"> {}

// Function to apply overrides only for missing methods
export function applyDefaults<T extends object>(
  baseInstance: T,
  defaults: Partial<T>
): T {
  return new Proxy(baseInstance, {
    get(target, prop, receiver) {
      // Check if the property exists in the class prototype
      if (prop in target) {
        return Reflect.get(target, prop, receiver); // Use class method if available
      }
      return (defaults as any)[prop]; // Otherwise, use override
    },
  });
}

// @ts-expect-error
export class CDPToolEngine implements Wallet {
  constructor(private wallet: Wallet) {}

  //   createTransfer(
}

// Example functions
type ExampleFn = (
  id: bigint,
  user: { name: string; balance: bigint; meta: { lastLogin: bigint | string } },
  transactions: Array<{ amount: bigint; date: string }>
) => boolean;

// Applying transformation
type TransformedFn = TransformParams<ExampleFn>;
// ^?

// const test: CDPTool;
// test["createTransfer"]({})
