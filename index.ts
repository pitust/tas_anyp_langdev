import { readFileSync } from 'fs'

const s = readFileSync('x.lang').toString()

enum TokenType {
    Keyword,
    Ident,
    Symbol,
    Number
}

function lex(s: string): [TokenType, string][] {
    let o: [TokenType, string][] = []

    let mr: RegExpMatchArray

    while (s.length) {
        if (mr = s.match(/^[0-9]+/)) {
            o.push([TokenType.Number, mr[0]])
            s = s.slice(mr[0].length)
            continue
        }
        if (mr = s.match(/^[0-9]+/)) {
            o.push([TokenType.Number, mr[0]])
            s = s.slice(mr[0].length)
            continue
        }
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
