import { getBaseUrl } from '../index'

describe('getBaseUrl tests', () => {
  test('get base url with http in host return host', () => {
    const host = 'http://a.com/'
    const baseURL = getBaseUrl(host, 0)
    expect(baseURL).toEqual(host)
  })
  test('get base url with no http in host return http url', () => {
    const host = 'a.com'
    const port = 80
    const baseURL = getBaseUrl(host, port)
    expect(baseURL).toEqual(`http://${host}:${port}/`)
  })
  test('get base url starts with btcrpc replaced by http', () => {
    const host = 'btcrpc://a.com/'
    const baseURL = getBaseUrl(host, 0)
    expect(baseURL).toEqual('http://a.com/')
  })
  test('get base url starts with http with user and pass are preserved', () => {
    const host = 'http://user:pass@a.com/'
    const baseURL = getBaseUrl(host, 0)
    expect(baseURL).toEqual(host)
  })
  test('get base url starts with http with query params are removed', () => {
    const host = 'http://a.com/?a=b'
    const baseURL = getBaseUrl(host, 0)
    expect(baseURL).toEqual('http://a.com/')
  })
})
