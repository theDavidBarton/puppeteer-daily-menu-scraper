let replacementMap = [
  ["¿", "á"],
  ["c,s", "cs"],
  ["c.sirkf.|c:s1rkf.", "csirke"],
  ["fóétel", "főétel"],
  ["fustblt|fostólt", "füstölt"],
  ["hcs|11ts", "hús"],
  ["hagvm", "hagym"],
  ["ggv", "ggy"],
  ["gulv", "guly"],
  ["gyijmolcs|gvümõlcs", "gyümölcs"],
  ["kórte", "körte"],
  ["i\\.\\.|i\\.|1\\.", "l"],
  ["\\/eves", "leves"],
  ["\\/VaCeďZö|\\/VoCeďZö", "nokedli"],
  ["0s", "ös"],
  ["pbrkblt", "pörkölt"],
  ["siilt", "sült"],
  ["tóltve", "töltve"],
  ["zóld", "zöld"]
]

console.log(replacementMap[13][0])
console.log(new RegExp(replacementMap[13][0])+'g', replacementMap[13][1])

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
