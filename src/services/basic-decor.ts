import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import data from "@/services/mock/data.json";


const mock = new MockAdapter(axios);
mock.onGet("/favorite").reply(200, data);

// basicDecor.interceptors.response.use((config: AxiosResponse<unknown, unknown>) => config, (error: AxiosError | Error) => {
//     if (error instanceof AxiosError) {
//         const errorMsg = error?.response?.data?.message || error?.message;
//         return Promise.reject({error: errorMsg, failed: true, code: error?.code} as RejectedRequest);
//     }
//     return Promise.reject({error: error?.message, failed: true, code: '500'} as RejectedRequest);
// });

// export default axios;
export default axios;