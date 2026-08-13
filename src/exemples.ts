/**
 * example
 */

import { GQLGetRequestParams, GQLGetResponse, buildQueryParams, Nested, GQLWhere } from ".";

interface MyMaster {
  id: number;
  somefield: string;
  myChildren: MyChild[];
}

interface MyChild {
  id: number;
  somefield: string;
  myMasterId: number;
  myMaster: MyMaster;

  myChildrenLevel2: MyChildLevel2[],
}

interface MyChildLevel2 {
  id: number,
  somefield: string,
  myChildAsMasterId: number,
  myChildAsMaster: MyChild,
}

/**
 * WHERE
 */

export const filterEq: GQLWhere<MyMaster> = {
  somefield: {
    $eq: 'some value'
  }
}

export const filterEqSimplified: GQLWhere<MyMaster> = {
  somefield: 'some value'
}

export const filterNe: GQLWhere<MyMaster> = {
  somefield: {
    $ne: 'some value'
  }
}

export const filterGt: GQLWhere<MyMaster> = {
  id: {
    $gt: 10
    // its the same way for lt
  }
}

export const filterGte: GQLWhere<MyMaster> = {
  id: {
    $gte: 10
    // its the same way for lte
  }
}

export const filterIn: GQLWhere<MyMaster> = {
  id: {
    $in: [1, 10]
    // its the same way for nin
  }
}

export const filterLike: GQLWhere<MyMaster> = {
  somefield: {
    $like: 'some value'
    // its the same way for ilike
  }
}

export const filterExists: GQLWhere<MyMaster> = {
  id: {
    $exists: true
  }
}

export const filterIsNotNull: GQLWhere<MyMaster> = {
  somefield: {
    $null: false
  }
}

export const filterAnd: GQLWhere<MyMaster> = {
  $and: [{
    id: 10
  }, {
    somefield: 'some value'
  }]
}

export const filterAndII: GQLWhere<MyMaster> = {
  $and: [{
    id: {
      $eq: 10
    }
  }, {
    somefield: {
      $eq: 'some value'
    }
  }]
}

export const filterAndSimplified: GQLWhere<MyMaster> = {
  id: 10,
  somefield: 'some value'
}

export const filterAndIII: GQLWhere<MyMaster> = {
  id: {
    $eq: 10
  },
  somefield: {
    $eq: 'some value'
  }
}

export const filterOr: GQLWhere<MyMaster> = {
  $or: [{
    id: 10
  }, {
    somefield: 'some value'
  }]
}

export const filterNot: GQLWhere<MyMaster> = {
  $not: {
    id: 10
  }
}

export const filterByChildren: GQLWhere<MyMaster> = {
  // There's no Intellisense here.
  // 'myChildren.somefield': {
  //   // There's no Intellisense here.
  //   $eq: 'some value'
  // }
}

export const filterByChildrenLevelN: GQLWhere<MyMaster> = {
  // There's no Intellisense here.
  // 'myChildren.myChildrenLevel2.somefield': {
  //   // There's no Intellisense here.
  //   $eq: 'some value'
  // }
}

/**
 * NESTED
 */

export const nestedMyMaster: Nested<MyMaster> = {
  myChildren: {
    nested: {
      myChildrenLevel2: true,
      // myChildrenLevel2: {
      //   if there are more children at the next level
      //   nested: {

      //   },
      //   filters the result set of the children (myChildrenLevel2)
      //   query: {

      //   }
      // }
    },
    query: {
      // filters the result set of the children (myChildren)
      where: {
        somefield: 'some value'
      },
      // only shows the children's IDs.
      select: ['id'],
      // sort the result set children
      sort: { somefield: 'asc' },
    }
  }
}

export let nestedMyChild: Nested<MyChild> = {
  myMaster: true
}

nestedMyChild = {
  myMaster: {
    // if you have another levels
    nested: {

    },
  }
}

export const nestedMyChildLevel2: Nested<MyChildLevel2> = {
  myChildAsMaster: {
    nested: {
      myMaster: {
        nested: {
          // some children
        },
        query: {
          // some query
        },
      }
    },
    query: {
      // some query
    }
  }
};

/**
 * HTTP REQUEST
 */

(async function main() {
  const paramsObj: GQLGetRequestParams<MyMaster> = {
    where: {
      somefield: {
        $ilike: 'some value'
      }
    },
    nested: {
      myChildren: true,
    },
    // rows per page
    limit: 10,
    // page 2
    page: 2,
  }

  const params = buildQueryParams<MyMaster>(paramsObj)
  const searchParams = new URLSearchParams(params).toString();

  const response = await fetch(`http://host:port/gohandler?${searchParams}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: GQLGetResponse<MyMaster> = await response.json();

  console.log(data.payload);
  console.log(data.pagination);
})();