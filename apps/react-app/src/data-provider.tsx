import qs from 'query-string';
import { DataProvider } from '@refinedev/core';
import { generateSort, generateFilter } from '@refinedev/simple-rest';
import { axiosInstance } from './utils/axios';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

export const dataProvider = (
  apiUrl: string,
): Omit<
  Required<DataProvider>,
  'createMany' | 'updateMany' | 'deleteMany'
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {};

    const { headers, method } = meta ?? {};

    const requestMethod = (method as MethodTypes) ?? 'get';

    const queryFilters = generateFilter(filters);

    const query: {
      _start?: number;
      _end?: number;
      _sort?: string;
      _order?: string;
    } = {};

    if (mode === 'server') {
      query._start = (current - 1) * pageSize;
      query._end = current * pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;
      query._sort = _sort.join(',');
      query._order = _order.join(',');
    }

    // eslint-disable-next-line security/detect-object-injection
    const { data: httpRes } = await axiosInstance[requestMethod](
      `${url}?${qs.stringify(query)}&${qs.stringify(queryFilters)}`,
      {
        headers,
      },
    );

    return {
      data: httpRes.data,
      total: httpRes.meta.totalItems,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    // eslint-disable-next-line security/detect-object-injection
    const { data } = await axiosInstance[requestMethod](
      `${apiUrl}/${resource}?${qs.stringify({ id: ids })}`,
      { headers },
    );

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'post';

    // eslint-disable-next-line security/detect-object-injection
    const { data } = await axiosInstance[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'put';

    // eslint-disable-next-line security/detect-object-injection
    const { data } = await axiosInstance[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    // eslint-disable-next-line security/detect-object-injection
    const { data } = await axiosInstance[requestMethod](url, { headers });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'delete';

    // eslint-disable-next-line security/detect-object-injection
    const { data } = await axiosInstance[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  // eslint-disable-next-line complexity
  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
    let requestUrl = `${url}?`;

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = {
          _sort: _sort.join(','),
          _order: _order.join(','),
        };
        requestUrl = `${requestUrl}&${qs.stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${qs.stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${qs.stringify(query)}`;
    }

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch': {
        // eslint-disable-next-line security/detect-object-injection
        axiosResponse = await axiosInstance[method](url, payload, {
          headers,
        });
        break;
      }
      case 'delete': {
        axiosResponse = await axiosInstance.delete(url, {
          data: payload,
          headers: headers,
        });
        break;
      }
      default: {
        axiosResponse = await axiosInstance.get(requestUrl, {
          headers,
        });
        break;
      }
    }

    const { data } = axiosResponse;

    return { data };
  },
});
