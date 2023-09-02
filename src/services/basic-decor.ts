import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import data from '@/services/mock/data.json'

const mock = new MockAdapter(axios)
mock.onGet('/favorite').reply(200, data)
mock.onDelete(/\/favorite\/\d+/).reply(200, data)

export default axios
