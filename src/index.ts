// import { NestedKeys } from 'fwork-jsts-common'

export type NestedKeys<
  T,
  MaxDepth extends number = 3,
  CurrentDepth extends number[] = []
> = CurrentDepth['length'] extends MaxDepth
  ? never
  : {
    [K in keyof T & (string | number)]: NonNullable<T[K]> extends Date | Array<any> | Function
    ? `${K}`
    : NonNullable<T[K]> extends object
    ? `${K}` | `${K}.${NestedKeys<NonNullable<T[K]>, MaxDepth, [...CurrentDepth, 1]>}`
    : `${K}`;
  }[keyof T & (string | number)];

/**
 * WHERE
 */

// FieldExprOp on goqlite lib
export type GQLComparisonOperatorsOp<T> = {
  op: string
  value: T
}

// FieldExpr on goqlite lib
export type GQLComparisonOperators<T> = {
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

  $op?: GQLComparisonOperatorsOp<T>
};

export type GQLFieldCondition<T> =
  | T
  | GQLComparisonOperators<T>;

export type GQLLogicalOperators<T, MaxDepth extends number = 3> = {
  $and?: GQLWhere<T, MaxDepth>[];
  $or?: GQLWhere<T, MaxDepth>[];
  $not?: GQLWhere<T, MaxDepth>;

  // isso aqui era usando antes do NestedKeys ser implementado no Where
  // antes, pra aceitar chaves aninhadas precisavamos permitir valores any, ja que o Where era limitado ao primeiro nivel
  // agora nao é mais necessario
  // [key: string]: any;

  // Aceita chaves dinâmicas que começam com $, mas bloqueia propriedades comuns desconhecidas como 'uuid'
  // caso precise habilitar algo nesse sentido no futuro
  [key: `$${string}`]: any;
};

export type GetPropertyType<T, Path extends string> = Path extends `${infer Parent}.${infer Child}`
  ? Parent extends keyof T
  ? GetPropertyType<NonNullable<T[Parent]>, Child>
  : never
  : Path extends keyof T
  ? T[Path]
  : never;

// export type Where<T> = {
//   [P in keyof T]?: FieldCondition<T[P]>;
// } & LogicalOperators<T>;
export type GQLWhere<T, MaxDepth extends number = 3> = {
  [K in NestedKeys<T, MaxDepth>]?: GQLFieldCondition<GetPropertyType<T, K>>;
} & GQLLogicalOperators<T, MaxDepth>;

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

export type GQLNestedQuery<T, MaxDepth extends number = 3> = {
  where?: GQLWhere<T, MaxDepth>;
  sort?: Partial<Record<keyof T, "asc" | "desc">>;
  select?: (keyof T)[];
  limit?: number;
  skip?: number;
  page?: number;
};

export type GQLNestedNode<T> = {
  [K in RelationKeys<T>]?: true | GQLNestedConfig<T[K]>;
};

export type GQLNestedConfig<T> = T extends (infer U)[]
  ? {
    query?: GQLNestedQuery<U>;
    nested?: GQLNestedNode<U>;
  }
  : {
    query?: GQLNestedQuery<T>;
    nested?: GQLNestedNode<T>;
  };


export type Nested<T> = GQLNestedNode<T>;

///////////////////////////////////////////////////////////////////////////

function serializeNode(name: string, config: true | GQLNestedConfig<any>): string {
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

export function buildNestedString<T>(nested: Nested<T>): string {
  return Object.entries(nested)
    .map(([key, value]) => serializeNode(key, value as any))
    .join(",");
}

export function buildQueryParams<T>(params: GQLGetRequestParams<T>) {
  const query: Record<keyof typeof params, any> = {} as any;

  if (params.where) query.where = JSON.stringify(params.where);
  if (params.sort) query.sort = JSON.stringify(params.sort);
  if (params.select) query.select = JSON.stringify(params.select);
  if (params.nested) query.nested = buildNestedString(params.nested);
  if (params.limit != null) query.limit = String(params.limit);
  if (params.skip != null) query.skip = String(params.skip);
  if (params.page != null) query.page = String(params.page);

  return query;
}

///////////////////////////////////////////////////////////////////////////

/**
 * HTTP REQUEST
 */

// QueryPayload on goqlite lib
export type GQLGetRequestParams<T, MaxDepth extends number = 3> = {
  where?: GQLWhere<T, MaxDepth>;
  sort?: Partial<Record<keyof T, "asc" | "desc">>;
  select?: (keyof T)[];
  nested?: Nested<T>;
  limit?: number;
  skip?: number;
  page?: number,
}

/**
 * HTTP RESPONSE
 */

// GetListData on goqlite lib
export type GQLGetResponse<T> = {
  payload?: T[],

  // PaginationMeta on goqlite lib
  pagination?: {
    skip?: number,
    limit?: number,
    count?: number,
    pageCount?: number,
    currentPage?: number,
  }
}