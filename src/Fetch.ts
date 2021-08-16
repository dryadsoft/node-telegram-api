import axios from "axios";

class Fetch {
  constructor() {}

  async get(url: string, timeout = 1000) {
    try {
      const source = axios.CancelToken.source();
      setTimeout(() => {
        source.cancel(`request timeout: ${timeout}, ${url}`);
      }, timeout);
      const res = await axios.get(url, {
        cancelToken: source.token,
      });
      return res;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log(err);
      }
    }
  }
  async post(url: string, params: any, timeout = 1000) {
    try {
      const source = axios.CancelToken.source();
      setTimeout(() => {
        source.cancel(`request timeout: ${timeout}, ${url}`);
      }, timeout);
      const res = await axios.post(url, {
        cancelToken: source.token,
        ...params,
      });
      return res;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log(err);
      }
    }
  }
}

export default new Fetch();
