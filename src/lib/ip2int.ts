/* tslint:disable:no-bitwise max-line-length */

/* https://www.regular-expressions.info/ip.html */
const ipv4re = /\b(?:\d{1,3}\.){3}\d{1,3}\b/

/* https://stackoverflow.com/a/17871737 */
const ipv6re = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/

/* tslint:enable:max-line-length */

/* https://stackoverflow.com/a/8105740 */
const ipv4ToInt = (ip: string): number => {
  ip = ip.startsWith("::ffff:") ? ip.substr(7) : ip
  const d = ip.split(".")
  return ((((((+d[0]) * 256) + (+d[1])) * 256)  + (+d[2])) * 256) + (+d[3])
}
const ipv6ToInt = (ip: string): number => {
  return 1
}

/* https://stackoverflow.com/a/8105740 */
export function intToIpv4 (num: number): string {
  let d = String(num % 256)
  for (let i = 3; i > 0; i--) {
    num = Math.floor(num / 256)
    d = num % 256 + "." + d
  }
  return d
}

export function intToIpv6 (num: number): string {
  return "bb"
}

export function ipToInt (ip: string): number {
  const t = ip.trim()
  /* ipv4 matched */
  if (ipv4re.test(t) === true) {
    return ipv4ToInt(t)
  }
  /* ipv6 matched */
  else if (ipv6re.test(t) === true) {
    return ipv6ToInt(t)
  }
  return null
}
