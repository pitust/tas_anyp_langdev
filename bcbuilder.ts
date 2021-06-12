import { abort, ast, Node } from './index'
import { SmartBuffer } from 'smart-buffer'

abstract class VMValue {
    abstract string(): string
    abstract clone(): VMValue
    abstract toBytes(): Buffer
    abstract eq(other: VMValue): boolean
}
class StringVMValue extends VMValue {
    constructor(public str: string) {
        super()
    }
    string(): string {
        return JSON.stringify(this.str)
    }
    clone(): VMValue {
        return new StringVMValue(this.str)
    }
    toBytes(): Buffer {
        return new SmartBuffer().writeStringNT(this.str).toBuffer()
    }
    eq(other: VMValue): boolean {
        if (other instanceof StringVMValue) return other.str == this.str
        return false
    }
}
class SymbolVMValue extends VMValue {
    symvmmap: 
    constructor(public ctx: Context, name: string) {
        super()
    }
    string(): string {
        return ':' + this.name
    }
    clone(): VMValue {
        
    }
    toBytes(): Buffer {
        return new SmartBuffer().writeStringNT(this.name).toBuffer()
    }
    eq(other: VMValue): boolean {
        if (other instanceof StringVMValue) return other.str == this.name
        return false
    }
}

interface Context {
    regs: Map<symbol, VMValue>
    locals: Map<symbol, VMValue>
    symbolmap: Map<string, symbol>
    symbolrevmap: Map<string, symbol>
}

abstract class Opcode {
    abstract interpret(ctx: Context): void
    abstract string(): string
}

const idpool = new Map<symbol, number>()
const idsrc = (
    i => () =>
        i++
)(1)
function id(s: symbol): string {
    return (
        'r' +
        idpool
            .set(s, idpool.get(s) ?? idsrc())
            .get(s)
            .toString()
    )
}

class CreateStringOpcode extends Opcode {
    interpret(ctx: Context): void {
        ctx.regs.set(this.reg, new StringVMValue(this.str))
    }
    string(): string {
        return this.strrepr
    }
    strrepr: string
    constructor(public reg: symbol, public str: string) {
        super()
        this.strrepr = `lds ${id(reg)}, ${JSON.stringify(str)}`
    }
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
    if (o.name == 'StringAtom') {
        out.push(new CreateStringOpcode(tgd, o.params.sym))
        return
    }
    if (o.name == 'SymbolAtom') {
        out.push(new CreateSymbolOpcode(tgd, o.params.sym))
        return
    }

    abort('Unknown op ' + o.name)
}

writeOp(ast)
