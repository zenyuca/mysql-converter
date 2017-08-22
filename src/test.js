let scriptParser = require('./ScriptParser.js').parser
scriptParser.parseAll()
console.log(JSON.stringify(scriptParser.parseList, null, 2))
