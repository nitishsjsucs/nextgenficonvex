/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as campaigns from "../campaigns.js";
import type * as debug from "../debug.js";
import type * as debugUser from "../debugUser.js";
import type * as earthquakes from "../earthquakes.js";
import type * as http from "../http.js";
import type * as kyc from "../kyc.js";
import type * as listUsers from "../listUsers.js";
import type * as scoutData from "../scoutData.js";
import type * as weatherEvents from "../weatherEvents.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  campaigns: typeof campaigns;
  debug: typeof debug;
  debugUser: typeof debugUser;
  earthquakes: typeof earthquakes;
  http: typeof http;
  kyc: typeof kyc;
  listUsers: typeof listUsers;
  scoutData: typeof scoutData;
  weatherEvents: typeof weatherEvents;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
