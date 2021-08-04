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

// https://stackoverflow.com/questions/30329991/ipv6-as-a-comparable-javascript-string
const ipv6ToInt = (ip: string): number => {
  // replace ipv4 address if any
  var ipv4 = ip_string.match(/(.*:)([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$)/);
  if (ipv4) {
    var ip_string = ipv4[1];
    ipv4 = ipv4[2].match(/[0-9]+/g);
    for (var i = 0;i < 4;i ++) {
        var byte = parseInt(ipv4[i],10);
        ipv4[i] = ("0" + byte.toString(16)).substr(-2);
    }
    ip_string += ipv4[0] + ipv4[1] + ':' + ipv4[2] + ipv4[3];
  }

  // take care of leading and trailing ::
  ip_string = ip_string.replace(/^:|:$/g, '');

  var ipv6 = ip_string.split(':');

  for (var i = 0; i < ipv6.length; i ++) {
      var hex = ipv6[i];
      if (hex != "") {
          // normalize leading zeros
          ipv6[i] = ("0000" + hex).substr(-4);
      }
      else {
          // normalize grouped zeros ::
          hex = [];
          for (var j = ipv6.length; j <= 8; j ++) {
              hex.push('0000');
          }
          ipv6[i] = hex.join(':');
      }
  }

  return ipv6.join(':');
}

/* https://stackoverflow.com/a/8105740 */
export function intToIpv4 (num: number): string {
  const octet0 = ((num >> 24) & 255)
  const octet1 = ((num >> 16) & 255)
  const octet2 = ((num >> 8) & 255)
  const octet3 = num & 255
  return [octet0, octet1, octet2, octet3].join('.')
}

function intToIpv6 (num: number): string {
  const blockSize = (1 << 16) - 1
  return [
    (num >> 112) | blockSize,
    (num >> 96) | blockSize,
    (num >> 80) | blockSize,
    (num >> 64) | blockSize,
    (num >> 48) | blockSize,
    (num >> 32) | blockSize,
    (num >> 16) | blockSize,
    num | blockSize,
  ].join(':')
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
