import { readFileSync } from 'fs'
import { inspect } from 'util'
function abort(s: string) {
    console.trace('backtrace')
    console.log(s)
    process.exit(69)
}
const s = readFileSync('x.lang').toString()

let expr: () => Node;

enum TokenType {
    Keyword,
    Ident,
    Punct,
    Number,
    String,
    Symbol,
    Lolnope
}

function lex(s: string): [TokenType, string][] {
    let o: [TokenType, string][] = []

    let mr: RegExpMatchArray

    const punct = ['=>'].concat('=;,()+{}'.split(''))
    const keywords = ['if', 'match', 'let']

    lexloop: while (s.length) {
        if ((mr = s.match(/^[0-9]+[^a-zA-Z_]/))) {
            o.push([TokenType.Number, mr[0].slice(0, -1)])
            s = s.slice(mr[0].length - 1)
            continue
        }
        for (let sym of punct) {
            if (s.startsWith(sym)) {
                s = s.slice(sym.length)
                o.push([TokenType.Punct, sym])
                continue lexloop
            }
        }
        if ((mr = s.match(/^[a-zA-Z_][a-zA-Z_0-9]*/))) {
            if (keywords.includes(mr[0])) {
                o.push([TokenType.Keyword, mr[0]])
            } else {
                o.push([TokenType.Ident, mr[0]])
            }
            s = s.slice(mr[0].length)
            continue
        }
        if ((mr = s.match(/^:[a-zA-Z_][a-zA-Z_0-9]*/))) {
            o.push([TokenType.Symbol, mr[0]])
            s = s.slice(mr[0].length)
            continue
        }
        if (s[0].match(/^\s/)) {
            s = s.slice(1)
            continue
        }
        if (s[0] == "'") {
            // haha we got no time for a real string parser. this will do:
            let g = "'"
            s = s.slice(1)
            while (1) {
                try {
                    o.push([TokenType.String, eval(g)])
                    continue lexloop
                } catch {
                    g += s[0]
                    s = s.slice(1)
                }
            }
        }
        if (s[0] == '"') {
            // haha we got no time for a real string parser. this will do:
            let g = '"'
            s = s.slice(1)
            while (1) {
                try {
                    o.push([TokenType.String, eval(g)])
                    break
                } catch {
                    g += s[0]
                    s = s.slice(1)
                }
            }
            continue
        }
        console.log('[+] Error lexing, context: ' + s.split('\n', 1)[0].slice(0, 10))
        console.log('                           ^')
        process.exit(2)
    }

    return o
}

const ts = lex(s)

export interface Node {
    name: string
    children: Record<string, Node>
    params: Record<string, string>
}

function Node(name: string, children: Record<string, Node>, params: Record<string, string>): Node {
    return { name, children, params }
}

function gettoken(tok: TokenType, s: string | null = null): string {
    if (ts.length == 0) abort(`parse error: expected (${TokenType[tok]}, ${s}) got EOF`)
    if (ts[0][0] != tok) abort(`parse error: expected (${TokenType[tok]}, ${s}) got (${TokenType[ts[0][0]]}, ${ts[0][1]})`)
    if (ts[0][1] != s && s !== null) abort(`parse error: expected (${TokenType[tok]}, ${s}) got (${TokenType[ts[0][0]]}, ${ts[0][1]})`)
    return ts.shift()[1]
}
function istoken(tok: TokenType, s: string | null = null): boolean {
    if (ts.length == 0) return false
    if (ts[0][0] != tok) return false
    if (ts[0][1] != s && s !== null) return false
    return true
}

// blockatom = "{" ([^"}"]stmt)* "}";
function blockatom(): Node {
    gettoken(TokenType.Punct, '{')
    let res = Node('BlockTrailer', {}, {})
    while (!istoken(TokenType.Punct, '}')) {
        res = Node('BlockElem', { prev: res, handler: stmt() }, {})
    }
    gettoken(TokenType.Punct, '}')
    return res
}
// ifatom = kw:"if" expr blockatom ["else"]("else" blockatom);
function ifatom(): Node {
    gettoken(TokenType.Keyword, 'if')
    const test = expr()
    const conseq = blockatom()
    let alt = Node('Noop', {}, {})
    if (istoken(TokenType.Keyword, 'else')) {
        gettoken(TokenType.Keyword, 'else')
        alt = blockatom()
    }
    return Node('If', { test, conseq, alt }, {})
}

// pattern = symbolatom | ident;
function pattern(): Node {
    if (istoken(TokenType.Symbol)) {
        return Node('SymbolPattern', {}, { pat: gettoken(TokenType.Symbol) })
    }
    return Node('ValuePattern', {}, { pat: gettoken(TokenType.Ident) })
}
// match_body = [","](",") pattern "=>" expr match_body;
function match_body(): Node {
    let clauses = Node('MatchTrailer', {}, {})
    while (1) {
        while (istoken(TokenType.Punct, ',')) gettoken(TokenType.Punct, ',')
        if (istoken(TokenType.Punct, '}')) return clauses
        let pat = pattern()
        gettoken(TokenType.Punct, '=>')
        let resultingexpr = expr()
        clauses = Node('MatchClause', { prev: clauses, pattern: pat, expr: resultingexpr }, {})
    }
}

// matchatom = kw:"match" expr "{" match_body "}";
function matchatom(): Node {
    gettoken(TokenType.Keyword, 'match')
    const matchover = expr()
    gettoken(TokenType.Punct, '{')
    const result = match_body()
    gettoken(TokenType.Punct, '}')
    return Node('Match', { body: result, over: matchover }, {})
}
// symbolatom = ":" ident;
function symbolatom(): Node {
    return Node('SymbolAtom', {}, { sym: gettoken(TokenType.Symbol) })
}
// identatom = ident;
function identatom(): Node {
    return Node('IdentAtom', {}, { sym: gettoken(TokenType.Ident) })
}
// stringatom = __str;
function stringatom(): Node {
    return Node('StringAtom', {}, { sym: gettoken(TokenType.String) })
}
// numberatom = __num;
function numberatom(): Node {
    return Node('NumberAtom', {}, { sym: gettoken(TokenType.Number) })
}

// atom = stratom | symbolatom | identatom | ifatom | blockatom | matchatom;
function atom(): Node {
    if (istoken(TokenType.String)) return stringatom()
    if (istoken(TokenType.Symbol)) return symbolatom()
    if (istoken(TokenType.Ident)) return identatom()
    if (istoken(TokenType.Number)) return numberatom()
    if (istoken(TokenType.Punct, '{')) return blockatom()
    if (istoken(TokenType.Keyword, 'match')) return matchatom()
    if (istoken(TokenType.Keyword, 'if')) return ifatom()
    gettoken(TokenType.Lolnope, 'lol nope')
}

// (* prec climber *)
// expr = prec_climb[* / - +] atom;
expr = (() => {
    let result = () => {
        const a = atom()
        if (istoken(TokenType.Punct, '(')) {
            gettoken(TokenType.Punct, '(')
            let args: Node[] = []
            while (!istoken(TokenType.Punct, ')')) {
                args.push(expr())
                if (!istoken(TokenType.Punct, ')')) gettoken(TokenType.Punct, ',')
            }
            gettoken(TokenType.Punct, ')')
        }
        return a
    }
    function precclimber(nodekind: string, sym: string) {
        const ogr = result
        const selfr = () => {
            const r = ogr()
            if (istoken(TokenType.Punct, sym)) {
                gettoken(TokenType.Punct, sym)
                const nr = selfr()
                return Node(nodekind, { lhs: r, rhs: nr }, {})
            }
            return r
        }
        result = selfr
    }
    precclimber('MulExpr', '*')
    precclimber('DivExpr', '/')
    precclimber('SubExpr', '-')
    precclimber('AddExpr', '+')
    return result
})()

// letstmt = kw:"let" ident:* "=" expr;
function letstmt(): Node {
    gettoken(TokenType.Keyword, 'let')
    const name = gettoken(TokenType.Ident)
    gettoken(TokenType.Punct, '=')
    const init = expr()
    return Node('Let', { init }, { name })
}
// stmt = ";" | letstmt | expr;
function stmt(): Node {
    if (istoken(TokenType.Punct, ';')) {
        gettoken(TokenType.Punct, ';')
        return Node('Noop', {}, {})
    }
    if (istoken(TokenType.Keyword, 'let')) {
        return letstmt()
    }
    return expr()
}
// program = [^eof](stmt program);
function program(): Node {
    if (ts.length) {
        return Node('RootStmt', { stmt: stmt(), next: program() }, {})
    }
    return Node('Noop', {}, {})
}

// inspect.defaultOptions.depth = Infinity

export const ast = program()