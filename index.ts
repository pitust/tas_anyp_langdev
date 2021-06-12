import { readFileSync } from 'fs'
function abort(s: string) {
    console.log(s)
    process.exit(69)
}
const s = readFileSync('x.lang').toString()

enum TokenType {
    Keyword,
    Ident,
    Punct,
    Number,
    String,
    Symbol,
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

interface Node {
    name: string
    children: Record<string, Node>
    params: Record<string, string>
}

function Node(name: string, children: Record<string, Node>, params: Record<string, string>): Node {
    return { name, children, params }
}

function gettoken(tok: TokenType, s: string | null = null): string {
    if (ts[0][0] != tok) abort('parse error')
    if (ts[0][1] != s && s !== null) abort('parse error')
    return ts.shift()[1]
}
function istoken(tok: TokenType, s: string | null = null): boolean {
    if (ts[0][0] != tok) return false
    if (ts[0][1] != s && s !== null) return false
    return true
}

// blockatom = "{" ([^"}"]stmt)* "}";
function blockatom() {
    gettoken(TokenType.Punct, '{')
    let res = Node('BlockTrailer', {}, {})
    while (!istoken(TokenType.Punct, '}')) {
        res = Node('BlockElem', { prev: res, handler: stmt() }, {})
    }
    gettoken(TokenType.Punct, '}')
    return res
}
// ifatom = kw:"if" expr blockatom ["else"]("else" blockatom);
function ifatom() {
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
function pattern() {
    if (istoken(TokenType.Symbol)) {
        return Node('SymbolPattern', {}, { pat: gettoken(TokenType.Symbol) })
    }
    return Node('ValuePattern', {}, { pat: gettoken(TokenType.Ident) })
}
// match_body = [","](",") pattern "=>" expr match_body;
function match_body() {
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

// matchatom = kw:"match" "{" match_body "}";
function matchatom() {
    gettoken(TokenType.Keyword, 'match')
    gettoken(TokenType.Punct, '{')
    const result = match_body()
    gettoken(TokenType.Punct, '{')
    return result
}
// symbolatom = ":" ident;
function symbolatom() {
    retur
}
// identatom = ident;

// atom = stratom | symbolatom | identatom | ifatom | blockatom | matchatom;

// (* prec climber *)
// expr = prec_climb[* / - +] atom;

// letstmt = kw:"let" ident:* "=" expr;
// exprstmt = expr;
// stmt = ";" | letstmt | exprstmt;
// program = [^eof](stmt program);
