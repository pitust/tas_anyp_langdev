import { readFileSync } from 'fs'

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
    if (ts[0][0] == tok)
}


// blockatom = "{" ([^"}"]stmt)* "}";
// ifatom = kw:"if" expr blockatom ["else"]("else" blockatom);

// pattern = symbolatom | ident;
// match_body = [","](",") pattern "=>" expr;

// matchatom = kw:"match" "{" match_body "}";
// symbolatom = ":" ident;
// identatom = ident;

// atom = stratom | symbolatom | identatom | ifatom | blockatom | matchatom;

// (* prec climber *)
// expr = prec_climb[* / - +] atom;

// letstmt = kw:"let" ident:* "=" expr;
// exprstmt = expr;
// stmt = ";" | letstmt | exprstmt;
// program = [^eof](stmt program);
