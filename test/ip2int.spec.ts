import { expect } from "chai"
import { intToIpv4, ipToInt } from "../src/lib/ip2int"

describe("Convert IP address to Integer, vice versa", () => {
  describe("Int to Ipv4", () => {
    it("Should return 192.168.0.1 when int = 3232235521", () => {
      const int: number = 3232235521
      const ip: string = "192.168.0.1"
      const result: string = intToIpv4(int)

      expect(result).to.equal(ip)
    })
  })
  describe("Ip to Int", () => {
    it("Should return 3232235521 when ipv4 = 192.168.0.1", () => {
      const int: number = 3232235521
      const ip: string = "192.168.0.1"
      const result: number = ipToInt(ip)

      expect(result).to.equal(int)
    })
  })
})
