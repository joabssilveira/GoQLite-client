/**
 * WHERE
 */

export type ComparisonOperators<T> = {
  $eq?: T;
  $ne?: T;

  $gt?: T;
  $gte?: T;

  $lt?: T;
  $lte?: T;

  $in?: T extends (infer U)[] ? U[] : T[];
  $nin?: T extends (infer U)[] ? U[] : T[];

  $like?: T extends string ? string : never;
  $ilike?: T extends string ? string : never;

  $between?: [T, T];

  $exists?: boolean;
  $null?: boolean;
};

export type FieldCondition<T> =
  | T
  | ComparisonOperators<T>;

export type LogicalOperators<T> = {
  $and?: Where<T>[];
  $or?: Where<T>[];
  $not?: Where<T>;
  [key: string]: any;
};

export type Where<T> = {
  [P in keyof T]?: FieldCondition<T[P]>;
} & LogicalOperators<T>;

/**
 * NESTED
 */

type Primitive = string | number | boolean | Date | null | undefined;

type IsRelation<T> =
  NonNullable<T> extends Primitive ? false :
  NonNullable<T> extends Array<any> ? true :
  NonNullable<T> extends object ? true :
  false;

type RelationKeys<T> = {
  [K in keyof T]: IsRelation<T[K]> extends true ? K : never
}[keyof T];

export type NestedQuery<T> = {
  where?: Where<T>;
  sort?: Partial<Record<keyof T, "asc" | "desc">>;
  select?: (keyof T)[];
  limit?: number;
  skip?: number;
  page?: number;
};

export type NestedNode<T> = {
  [K in RelationKeys<T>]?: true | NestedConfig<T[K]>;
};

export type NestedConfig<T> = T extends (infer U)[]
  ? {
    query?: NestedQuery<U>;
    nested?: NestedNode<U>;
  }
  : {
    query?: NestedQuery<T>;
    nested?: NestedNode<T>;
  };


export type Nested<T> = NestedNode<T>;

///////////////////////////////////////////////////////////////////////////

export function buildNestedString<T>(nested: Nested<T>): string {
  return Object.entries(nested)
    .map(([key, value]) => serializeNode(key, value as any))
    .join(",");
}

function serializeNode(name: string, config: true | NestedConfig<any>): string {
  const nodeName = name; // mantém no padrão do model (courses_def, CoursesDef, etc)

  if (config === true) {
    return nodeName;
  }

  const parts: string[] = [];

  // 1) query
  if (config.query) {
    parts.push(JSON.stringify(config.query));
  }

  // 2) children
  if (config.nested) {
    const childrenStr = Object.entries(config.nested)
      .map(([childName, childConfig]) =>
        serializeNode(childName, childConfig as any)
      )
      .join(",");

    parts.push(childrenStr);
  }

  if (parts.length === 0) {
    return nodeName;
  }

  return `${nodeName}{${parts.join(",")}}`;
}

///////////////////////////////////////////////////////////////////////////

export type ApiClientParams<T> = {
  where?: Where<T>;
  sort?: Partial<Record<keyof T, "asc" | "desc">>;
  select?: (keyof T)[];
  nested?: Nested<T>;
  limit?: number;
  skip?: number;
  page?: number,
}

export function buildQueryParams<T>(params: ApiClientParams<T>) {
  const query: Record<string, string> = {};

  if (params.where) query.where = JSON.stringify(params.where);
  if (params.sort) query.sort = JSON.stringify(params.sort);
  if (params.select) query.select = JSON.stringify(params.select);
  if (params.nested) query.nested = buildNestedString(params.nested);
  if (params.limit != null) query.limit = String(params.limit);
  if (params.skip != null) query.skip = String(params.skip);
  if (params.page != null) query.page = String(params.page);

  return query;
}

/**
 * HTTP RESPONSE
 */

export type ApiGetResponse<T> = {
  payload?: T[],
  pagination?: {
    skip?: number,
    limit?: number,
    count?: number,
    pageCount?: number,
    currentPage?: number,
  }
}