import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from './api';
import { storageRefreshToken } from './storage';

jest.mock('./storage');

describe('when requesting the API with Axios', () => {
  const mockApi = new MockAdapter(api);
  const mockAxios = new MockAdapter(axios);

  afterAll(() => {
    mockApi.restore();
    mockAxios.restore();
  });

  describe('when the token has not expired', () => {
    describe('when making a GET request', () => {
      beforeAll(() => {
        const expectedToken = 'Bearer 123456';

        mockApi.onGet('/auth').reply((config) => {
          return new Promise((resolve) => {
            if (expectedToken === config.headers.Authorization) {
              resolve([200, { message: 'authorized' }]);
            }

            resolve(401);
          });
        });
      });

      it('should return status 200', async () => {
        const response = await api.get('/auth', {
          headers: { Authorization: 'Bearer 123456' },
        });

        expect(response.status).toEqual(200);
      });

      it('should return message authorized', async () => {
        const expectedResponse = { message: 'authorized' };
        const response = await api.get('/auth', {
          headers: { Authorization: 'Bearer 123456' },
        });

        expect(response.data).toEqual(expectedResponse);
      });
    });

    // describe('when making a POST request', () => {
    //   beforeAll(async () => {
    //     api.post.mockImplementation((route, body) => {
    //       if (route === '/todo') {
    //         if (body && body.task) {
    //           return Promise.resolve({
    //             status: 201,
    //             data: {
    //               id: 1,
    //               task: body.task,
    //             },
    //           });
    //         }
    //       }
    //       return new Promise.reject();
    //     });
    //   });
    //   afterAll(() => {
    //     api.mockClear();
    //   });
    //   it('should return status 201', async () => {
    //     const response = await api.post('/todo', { task: 'test' });
    //     expect(response.status).toEqual(201);
    //   });
    //   it('should return new task', async () => {
    //     const response = await api.post('/todo', { task: 'test' });
    //     const expectedResponse = {
    //       id: 1,
    //       task: 'test',
    //     };
    //     expect(response.data).toEqual(expectedResponse);
    //   });
    // });
  });

  describe('when the token expires but has a valid refresh token', () => {
    describe('when making a GET request', () => {
      beforeAll(async () => {
        storageRefreshToken.get.mockImplementation(() => 'abcd');

        const expectedRefreshToken = storageRefreshToken.get();
        const expectedToken = 'Bearer 123456';

        mockApi.onGet('/auth').reply(401);

        mockApi.onPost('/refresh-token').reply((config) => {
          return new Promise((resolve) => {
            const responseRefreshToken = JSON.parse(config.data).refresh_token;

            if (responseRefreshToken === expectedRefreshToken) {
              resolve([200, { token: '123456' }]);
            }

            resolve(400);
          });
        });

        mockAxios.onGet('/auth').reply((config) => {
          return new Promise((resolve) => {
            if (expectedToken === config.headers.Authorization) {
              resolve([200, { message: 'authorized' }]);
            }

            resolve(401);
          });
        });
      });

      it('should return status 200', async () => {
        const response = await api.get('/auth');

        expect(response.status).toEqual(200);
      });

      it('should return message authorized', async () => {
        const response = await api.get('/auth');

        expect(response.data.message).toEqual('authorized');
      });
    });
  });

  describe("when the token expires but doesn't have a valid refresh token", () => {});
});
