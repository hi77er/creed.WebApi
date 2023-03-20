export abstract class BaseAuthEvent<TRest = unknown> {
  abstract statusCode: number;

  abstract serializeRest(): TRest;
};