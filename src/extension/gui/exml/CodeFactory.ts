//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

module lark.player {

    var STATE = "lark.gui.State";
    var ADD_ITEMS = "lark.gui.AddItems";
    var SET_PROPERTY = "lark.gui.SetProperty";
    var BINDING_PROPERTY = "lark.gui.Binding.bindProperty";

    /**
     * 代码生成工具基类
     */
    export class CodeBase {

        public toCode():string {
            return "";
        }

        public indent:number = 0;

        /**
         * 获取缩进字符串
         */
        public getIndent(indent?:number):string {
            if (indent === void 0)
                indent = this.indent;
            var str = "";
            for (var i = 0; i < indent; i++) {
                str += "	";
            }
            return str;
        }
    }


    export class EXClass extends CodeBase {

        /**
         * 构造函数代码块
         */
        public constructCode:EXCodeBlock;
        /**
         * 类名,不包括模块名
         */
        public className:string = "";

        /**
         * 父类类名,包括完整模块名
         */
        public superClass:string = "";

        /**
         * 内部类区块
         */
        private innerClassBlock:EXClass[] = [];

        /**
         * 添加一个内部类
         */
        public addInnerClass(clazz:EXClass):void {
            if (this.innerClassBlock.indexOf(clazz) == -1) {
                this.innerClassBlock.push(clazz);
            }
        }

        /**
         * 变量定义区块
         */
        private variableBlock:EXVariable[] = [];

        /**
         * 添加变量
         */
        public addVariable(variableItem:EXVariable):void {
            if (this.variableBlock.indexOf(variableItem) == -1) {
                this.variableBlock.push(variableItem);
            }
        }

        /**
         * 根据变量名获取变量定义
         */
        public getVariableByName(name:string):EXVariable {
            var list = this.variableBlock;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var item = list[i];
                if (item.name == name) {
                    return item;
                }
            }
            return null;
        }

        /**
         * 函数定义区块
         */
        private functionBlock:EXFunction[] = [];

        /**
         * 添加函数
         */
        public addFunction(functionItem:EXFunction):void {
            if (this.functionBlock.indexOf(functionItem) == -1) {
                this.functionBlock.push(functionItem);
            }
        }

        /**
         * 根据函数名返回函数定义块
         */
        public getFuncByName(name:string):EXFunction {
            var list = this.functionBlock;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                var item = list[i];
                if (item.name == name) {
                    return item;
                }
            }
            return null;
        }

        public toCode():string {

            var indent = this.indent;
            var indentStr = this.getIndent(indent);
            var indent1Str = this.getIndent(indent + 1);
            var indent2Str = this.getIndent(indent + 2);

            //打印类起始块
            var returnStr = indentStr + "(function (";
            if (this.superClass) {
                returnStr += "_super) {\n" + indent1Str + "__extends(" + this.className + ", _super);\n";
            }
            else {
                returnStr += ") {\n";
            }

            //打印内部类列表
            var innerClasses = this.innerClassBlock;
            var length = innerClasses.length;
            for (var i = 0; i < length; i++) {
                var clazz = innerClasses[i];
                clazz.indent = indent+1;
                returnStr += indent1Str+"var "+clazz.className+" = "+clazz.toCode()+"\n\n";
            }

            returnStr += indent1Str + "function " + this.className + "() {\n";
            if (this.superClass) {
                returnStr += indent2Str + "_super.call(this);\n";
            }

            //打印变量列表
            var variables = this.variableBlock;
            length = variables.length;
            for (i = 0; i < length; i++) {
                var variable = variables[i];
                if (variable.defaultValue) {
                    returnStr += indent2Str + variable.toCode() + "\n";
                }
            }

            //打印构造函数
            if (this.constructCode) {
                var codes = this.constructCode.toCode().split("\n");
                length = codes.length;
                for (i = 0; i < length; i++) {
                    var code = codes[i];
                    returnStr += indent2Str + code + "\n";
                }
            }
            returnStr += indent1Str + "}\n";
            returnStr += indent1Str + "var _proto = " + this.className + ".prototype;\n\n";

            //打印函数列表
            var functions = this.functionBlock;
            length = functions.length;
            for (i = 0; i < length; i++) {
                var functionItem = functions[i];
                functionItem.indent = indent + 1;
                returnStr += functionItem.toCode() + "\n";
            }

            //打印类结尾
            returnStr += indent1Str + "return " + this.className + ";\n" + indentStr;
            if (this.superClass) {
                returnStr += "})(" + this.superClass + ");";
            }
            else {
                returnStr += "})();";
            }
            return returnStr;
        }

    }

    export class EXCodeBlock extends CodeBase {

        /**
         * 添加变量声明语句
         * @param name 变量名
         * @param value 变量初始值
         */
        public addVar(name:string, value?:string):void {
            var valueStr = value ? " = " + value : "";
            this.addCodeLine("var " + name + valueStr + ";");
        }

        /**
         * 添加赋值语句
         * @param target 要赋值的目标
         * @param value 值
         * @param prop 目标的属性(用“.”访问)，不填则是对目标赋值
         */
        public addAssignment(target:string, value:string, prop?:string):void {
            var propStr = prop ? "." + prop : "";
            this.addCodeLine(target + propStr + " = " + value + ";");
        }

        /**
         * 添加返回值语句
         */
        public addReturn(data:string):void {
            this.addCodeLine("return " + data + ";");
        }

        /**
         * 添加一条空行
         */
        public addEmptyLine():void {
            this.addCodeLine("");
        }

        /**
         * 开始添加if语句块,自动调用startBlock();
         */
        public startIf(expression:string):void {
            this.addCodeLine("if(" + expression + ")");
            this.startBlock();
        }

        /**
         * 开始else语句块,自动调用startBlock();
         */
        public startElse():void {
            this.addCodeLine("else");
            this.startBlock();
        }

        /**
         * 开始else if语句块,自动调用startBlock();
         */
        public startElseIf(expression:string):void {
            this.addCodeLine("else if(" + expression + ")");
            this.startBlock();
        }

        /**
         * 添加一个左大括号，开始新的语句块
         */
        public startBlock():void {
            this.addCodeLine("{");
            this.indent++;
        }

        /**
         * 添加一个右大括号,结束当前的语句块
         */
        public endBlock():void {
            this.indent--;
            this.addCodeLine("}");
        }

        /**
         * 添加执行函数语句块
         * @param functionName 要执行的函数名称
         * @param args 函数参数列表
         */
        public doFunction(functionName:string, args:string[]):void {
            var argsStr = args.join(",");
            this.addCodeLine(functionName + "(" + argsStr + ")");
        }

        private lines:string[] = [];

        /**
         * 添加一行代码
         */
        public addCodeLine(code:string):void {
            this.lines.push(this.getIndent() + code);
        }

        /**
         * 添加一行代码到指定行
         */
        public addCodeLineAt(code:string, index:number):void {
            this.lines.splice(index, 0, this.getIndent() + code);
        }

        /**
         * 是否存在某行代码内容
         */
        public containsCodeLine(code:string):boolean {
            return this.lines.indexOf(code) != -1;
        }

        /**
         * 在结尾追加另一个代码块的内容
         */
        public concat(cb:EXCodeBlock):void {
            this.lines = this.lines.concat(cb.lines);
        }

        public toCode():string {
            return this.lines.join("\n");
        }
    }

    export class EXFunction extends CodeBase {

        /**
         * 代码块
         */
        public codeBlock:EXCodeBlock = null;

        public isGet:boolean = false;

        /**
         * 函数名
         */
        public name:string = "";

        public toCode():string {
            var indentStr:string = this.getIndent();
            var indent1Str:string = this.getIndent(this.indent + 1);
            var codeIndent:string;
            var returnStr = indentStr;
            if (this.isGet) {
                codeIndent = this.getIndent(this.indent + 2);
                returnStr += 'Object.defineProperty(_proto, "skinParts", {\n';
                returnStr += indent1Str + "get: function () {\n";
            }
            else {
                codeIndent = indent1Str;
                returnStr += "_proto." + this.name + " = function () {\n";
            }

            if (this.codeBlock) {
                var lines = this.codeBlock.toCode().split("\n");
                var length = lines.length;
                for (var i = 0; i < length; i++) {
                    var line = lines[i];
                    returnStr += codeIndent + line + "\n";
                }
            }
            if (this.isGet) {
                returnStr += indent1Str + "},\n" + indent1Str + "enumerable: true,\n" +
                    indent1Str + "configurable: true\n" + indentStr + "});";
            }
            else {
                returnStr += indentStr + "};";
            }

            return returnStr;
        }
    }

    export class EXVariable extends CodeBase {

        public constructor(name:string, defaultValue?:string) {
            super();
            this.indent = 2;
            this.name = name;
            this.defaultValue = defaultValue;
        }

        /**
         * 变量名
         */
        public name:string;
        /**
         * 默认值
         */
        public defaultValue:string;

        public toCode():string {
            if (!this.defaultValue) {
                return "";
            }
            return "this." + this.name + " = " + this.defaultValue + ";";
        }
    }


    export class EXState extends CodeBase {

        public constructor(name:string, stateGroups?:Array<any>) {
            super();
            this.name = name;
            if (stateGroups)
                this.stateGroups = stateGroups;
        }

        /**
         * 视图状态名称
         */
        public name:string = "";

        public stateGroups:Array<any> = [];

        public addItems:Array<any> = [];

        public setProperty:Array<any> = [];

        /**
         * 添加一个覆盖
         */
        public addOverride(item:CodeBase):void {
            if (item instanceof EXAddItems)
                this.addItems.push(item);
            else
                this.setProperty.push(item);
        }

        public toCode():string {
            var indentStr:string = this.getIndent(1);
            var returnStr:string = "new " + STATE + " (\"" + this.name + "\",\n" + indentStr + "[\n";
            var index:number = 0;
            var isFirst:boolean = true;
            var overrides:Array<any> = this.addItems.concat(this.setProperty);
            while (index < overrides.length) {
                if (isFirst)
                    isFirst = false;
                else
                    returnStr += ",\n";
                var item:CodeBase = overrides[index];
                var codes:Array<any> = item.toCode().split("\n");
                var length:number = codes.length;
                for (var i:number = 0; i < length; i++) {
                    var code:string = codes[i];
                    codes[i] = indentStr + indentStr + code;
                }
                returnStr += codes.join("\n");
                index++;
            }
            returnStr += "\n" + indentStr + "])";
            return returnStr;
        }
    }

    export class EXAddItems extends CodeBase {
        public constructor(target:string, property:string, position:number, relativeTo:string) {
            super();
            this.target = target;
            this.property = property;
            this.position = position;
            this.relativeTo = relativeTo;
        }

        /**
         * 要添加的实例
         */
        public target:string;

        /**
         * 要添加到的属性
         */
        public property:string;

        /**
         * 添加的位置
         */
        public position:number;

        /**
         * 相对的显示元素
         */
        public relativeTo:string;

        public toCode():string {
            var returnStr:string = "new " + ADD_ITEMS + "(\"" + this.target + "\",\"" + this.property + "\"," + this.position + ",\"" + this.relativeTo + "\")";
            return returnStr;
        }
    }

    export class EXSetProperty extends CodeBase {
        public constructor(target:string, name:string, value:string) {
            super();
            this.target = target;
            this.name = name;
            this.value = value;
        }

        /**
         * 要修改的属性名
         */
        public name:string;

        /**
         * 目标实例名
         */
        public target:string;

        /**
         * 属性值
         */
        public value:string;

        public toCode():string {
            return "new " + SET_PROPERTY + "(\"" + this.target + "\",\"" + this.name + "\"," + this.value + ")";
        }
    }


    export class EXBinding extends CodeBase {

        public constructor(target:string,property:string,expression:string){
            super();
            this.target = target;
            this.property = property;
            this.expression = expression;
        }

        /**
         * 目标实例名
         */
        public target:string;
        /**
         * 目标属性名
         */
        public property:string;
        /**
         * 绑定表达式
         */
        public expression:string;

        public toCode():string {
            return BINDING_PROPERTY+"(this, [\""+this.expression+"\"], this[\""+this.target+"\"],\""+this.property+"\");";
        }
    }

}