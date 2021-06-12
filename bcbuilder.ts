import { abort, ast, Node } from './index'

abstract class VMValue {
    abstract string(): string
    abstract clone(): VMValue
    abstract toBytes(): Buffer
    abstract eq(other: VMValue): boolean
}

interface Context {
    regs: Map<symbol, VMValue>
    locals: Map<symbol, VMValue>
}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

const idpool = new Map< symbol, number>()
const idsrc = ((i) => () => i++)(1)
function id(s: symbol): string {
    return 'r' + idpool.set(s, idpool.get(s) ?? idsrc()).get(s).toString()
}

class AxeTempOpcode extends Opcode {
    interpret(ctx: Context): void {
        ctx.locals.delete(this.reg)
    }
    string(): string {
        return this.str
    }
    str: string
    constructor(public reg: symbol) {
        super()
        this.str = `axe ${id(reg)}`
    }
}

class StoreOpcode extends Opcode {
    to: symbol
    str: string
    constructor(public reg: symbol, to: string) {
        super()
        this.to = Symbol.for(to)
        this.str = `str ${to}, ${id(reg)}`
    }
    interpret(ctx: Context): void {
        ctx.locals.set(this.to, ctx.regs.get(this.reg))
    }
    string(): string {
        return this.str
    }
}

const out: Opcode[] = []

function writeOp(o: Node, tgd: symbol = null) {
    if (o.name == 'RootStmt') {
        writeOp(o.children.stmt)
        writeOp(o.children.next)
        return
    }
    if (o.name == 'Let') {
        let s = Symbol('init$' + o.params.name)
        writeOp(o.children.init, s)
        out.push(new StoreOpcode(s, o.params.name))
        out.push(new AxeTempOpcode(s))
        return
    }
    if 

    abort('Unknown op ' + o.name)
}

writeOp(ast)
