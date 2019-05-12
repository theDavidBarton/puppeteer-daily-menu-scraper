let replacementMap = [
  ['i\.\.|i\.|1\.', 'l'],
  ['\/eves', 'leves'],
  ['zóld', 'zöld'],
  ['fustblt|fostólt', 'füstölt'],
  ['gyijmolcs|gvümõlcs', 'gyümölcs'],
  ['c.sirkf.|c:s1rkf.', 'csirke'],
  ['\/VaCeďZö|\/VoCeďZö', 'nokedli'],
  ['kórte', 'körte'],
  ['¿', 'á'],
  ['pbrkblt', 'pörkölt'],
  ['fóétel', 'főétel'],
  ['tóltve', 'töltve'],
  ['siilt', 'sült'],
  ['hagvm', 'hagym'],
  ['gulv', 'guly'],
  ['c,s', 'cs'],
  ['0s', 'ös'],
  ['ggv', 'ggy'],
  ['hcs', 'hús']
]

let str1 = 'A mai \/eves hagvm gulv¿s'
let str2
for (let k = 0; k < replacementMap.length; k++) {
  str2 = str1.replace(new RegExp(replacementMap[k][0]), replacementMap[k][1])
}
console.log(str2)
let rstr = JSON.stringify(replacementMap)
let rstr2 = JSON.parse(rstr)
console.log(rstr)
console.log(rstr2)
