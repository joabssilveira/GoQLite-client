/**
 * example
 */

import { ApiClientParams, ApiGetResponse, buildQueryParams, Nested, Where } from ".";

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

export const filterEq: Where<MyMaster> = {
  somefield: {
    $eq: 'some value'
  }
}

export const filterEqSimplified: Where<MyMaster> = {
  somefield: 'some value'
}

export const filterNe: Where<MyMaster> = {
  somefield: {
    $ne: 'some value'
  }
}

export const filterGt: Where<MyMaster> = {
  id: {
    $gt: 10
    // its the same way for lt
  }
}

export const filterGte: Where<MyMaster> = {
  id: {
    $gte: 10
    // its the same way for lte
  }
}

export const filterIn: Where<MyMaster> = {
  id: {
    $in: [1, 10]
    // its the same way for nin
  }
}

export const filterLike: Where<MyMaster> = {
  somefield: {
    $like: 'some value'
    // its the same way for ilike
  }
}

export const filterExists: Where<MyMaster> = {
  id: {
    $exists: true
  }
}

export const filterIsNotNull: Where<MyMaster> = {
  somefield: {
    $null: false
  }
}

export const filterAnd: Where<MyMaster> = {
  $and: [{
    id: 10
  }, {
    somefield: 'some value'
  }]
}

export const filterAndII: Where<MyMaster> = {
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

export const filterAndSimplified: Where<MyMaster> = {
  id: 10,
  somefield: 'some value'
}

export const filterAndIII: Where<MyMaster> = {
  id: {
    $eq: 10
  },
  somefield: {
    $eq: 'some value'
  }
}

export const filterOr: Where<MyMaster> = {
  $or: [{
    id: 10
  }, {
    somefield: 'some value'
  }]
}

export const filterNot: Where<MyMaster> = {
  $not: {
    id: 10
  }
}

export const filterByChildren: Where<MyMaster> = {
  // There's no Intellisense here.
  'myChildren.somefield': {
    // There's no Intellisense here.
    $eq: 'some value'
  }
}

export const filterByChildrenLevelN: Where<MyMaster> = {
  // There's no Intellisense here.
  'myChildren.myChildrenLevel2.somefield': {
    // There's no Intellisense here.
    $eq: 'some value'
  }
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
  const paramsObj: ApiClientParams<MyMaster> = {
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

  const data: ApiGetResponse<MyMaster> = await response.json();

  console.log(data.payload);
  console.log(data.pagination);
})();