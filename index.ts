import { readFileSync } from 'fs'

const s = readFileSync('x.lang').toString()

enum TokenType {
    Keyword,
    Ident,
    Symbol
}

function lex(s: string): [TokenType, string][] {
    let o: [TokenType, string][]
}

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
