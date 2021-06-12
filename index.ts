import { readFileSync } from 'fs'

const s = readFileSync('x.lang').toString()

enum TokenType {
    Keyword,
    Ident,
    Punct,
    Number,
    String,
}

function lex(s: string): [TokenType, string][] {
    let o: [TokenType, string][] = []

    let mr: RegExpMatchArray

    const punct = ['=>'].concat('=:;,()+{}'.split(''))
    const keywords = ['if', 'match', 'let']

    while (s.length) {
        if ((mr = s.match(/^[0-9]+[^a-zA-Z_]/))) {
            o.push([TokenType.Number, mr[0].slice(0, -1)])
            s = s.slice(mr[0].length - 1)
            continue
        }
        for (let sym of punct) {
            if (s.startsWith(sym)) {
                s = s.slice(sym.length)
                o.push([TokenType.Punct, ])
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
                    break
                } catch {
                    g += s[0]
                    s = s.slice(1)
                }
            }
            continue
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

console.log(lex(s))

// sc = ";";

// (* compiler magic *)
// stratom = __;

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
// stmt = sc | letstmt | exprstmt;
// program = [^eof](stmt program);
