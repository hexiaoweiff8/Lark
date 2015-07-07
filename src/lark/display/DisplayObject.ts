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


module lark.sys {
    /**
     * @private
     * 显示对象失效标志
     */
    export const enum DisplayObjectFlags {

        //DisplayObject剩余可用的：0x1000,0x2000,0x4000,0x8000,0x10000

        /**
         * @private
         * 显示对象是否开启像素级精确碰撞，开启后显示对象的透明区域将可以穿透，Graphics默认开启此功能，。
         */
        PixelHitTest = 0x0001,
        /**
         * @private
         * 显示对象自身的绘制区域尺寸失效
         */
        InvalidContentBounds = 0x0002,

        /**
         * @private
         * 显示对象的矩形区域尺寸失效，包括自身绘制区域和子项的区域集合
         */
        InvalidBounds = 0x0004,

        /**
         * @private
         * 显示对象的matrix属性失效标志，通常因为scaleX，width等属性发生改变。
         */
        InvalidMatrix = 0x0008,

        /**
         * @private
         * 显示对象祖代的矩阵失效。
         */
        InvalidConcatenatedMatrix = 0x0010,

        /**
         * @private
         * 显示对象祖代的逆矩阵失效。
         */
        InvalidInvertedConcatenatedMatrix = 0x0020,

        /**
         * @private
         * 显示对象祖代的透明度属性失效。
         */
        InvalidConcatenatedAlpha = 0x0040,
        /**
         * @private
         * 显示对象应该被缓存成位图的标志，即使没有设置这个标志，也有可能被缓存成位图，例如含有滤镜的情况。
         * 而当设置了这个标志，如果内存不足，也会放弃缓存。
         */
        CacheAsBitmap = 0x0080,

        /**
         * @private
         * 显示对象自身需要重绘的标志
         */
        DirtyRender = 0x0100,
        /**
         * @private
         * 子项中已经全部含有DirtyRender标志，无需继续遍历。
         */
        DirtyChildren = 0x200,
        /**
         * @private
         * 对象自身在舞台上的显示尺寸发生改变。
         */
        TouchEnabled = 0x400,
        /**
         * @private
         * 对象自身以及子项在舞台上显示尺寸发生改变。
         */
        TouchChildren = 0x800,
        /**
         * @private
         * DirtyRender|DirtyChildren
         */
        Dirty = DirtyRender | DirtyChildren,
        /**
         * @private
         * 添加或删除子项时，需要向子项传递的标志。
         */
        DownOnAddedOrRemoved = DisplayObjectFlags.InvalidConcatenatedMatrix |
            DisplayObjectFlags.InvalidInvertedConcatenatedMatrix |
            DisplayObjectFlags.InvalidConcatenatedAlpha |
            DisplayObjectFlags.DirtyChildren,
        /**
         * @private
         * 显示对象初始化时的标志量
         */
        InitFlags = DisplayObjectFlags.TouchEnabled |
            DisplayObjectFlags.TouchChildren |
            DisplayObjectFlags.InvalidConcatenatedMatrix |
            DisplayObjectFlags.InvalidInvertedConcatenatedMatrix |
            DisplayObjectFlags.InvalidConcatenatedAlpha |
            DisplayObjectFlags.Dirty

    }
}

module lark {

    /**
     * @private
     * 格式化旋转角度的值
     */
    function clampRotation(value):number {
        value %= 360;
        if (value > 180) {
            value -= 360;
        } else if (value < -180) {
            value += 360;
        }
        return value;
    }

    /**
     * @private
     */
    const enum Keys {
        scaleX,
        scaleY,
        skewX,
        skewY,
        rotation,
        name,
        matrix,
        invertedConcatenatedMatrix,
        bounds,
        contentBounds
    }

    /**
     * @language en_US
     * The DisplayObject class is the base class for all objects that can be placed on the display list. The display list
     * manages all objects displayed in the runtime. Use the DisplayObjectContainer class to arrange the display
     * objects in the display list. DisplayObjectContainer objects can have child display objects, while other display objects,
     * such as Shape and TextField objects, are "leaf" nodes that have only parents and siblings, no children.
     * The DisplayObject class supports basic functionality like the x and y position of an object, as well as more advanced
     * properties of the object such as its transformation matrix.<br/>
     * The DisplayObject class contains several broadcast events.Normally, the target of any particular event is a specific
     * DisplayObject instance. For example, the target of an added event is the specific DisplayObject instance that was added
     * to the display list. Having a single target restricts the placement of event listeners to that target and in some cases
     * the target's ancestors on the display list. With broadcast events, however, the target is not a specific DisplayObject
     * instance, but rather all DisplayObject instances, including those that are not on the display list. This means that you
     * can add a listener to any DisplayObject instance to listen for broadcast events.
     *
     * @event lark.Event.ADDED Emitted when a display object is added to the display list.
     * @event lark.Event.ADDED_TO_STAGE Emitted when a display object is added to the on stage display list, either directly or through the addition of a sub tree in which the display object is contained.
     * @event lark.Event.REMOVED Emitted when a display object is about to be removed from the display list.
     * @event lark.Event.REMOVED_FROM_STAGE Emitted when a display object is about to be removed from the display list, either directly or through the removal of a sub tree in which the display object is contained.
     * @event lark.Event.ENTER_FRAME [broadcast event] Emitted when the playhead is entering a new frame.
     * @event lark.Event.RENDER [broadcast event] Emitted when the display list is about to be updated and rendered.
     * @version Lark 1.0
     * @platform Web,Native
     */
    /**
     * @language zh_CN
     * DisplayObject 类是可放在显示列表中的所有对象的基类。该显示列表管理运行时中显示的所有对象。使用 DisplayObjectContainer 类排列
     * 显示列表中的显示对象。DisplayObjectContainer 对象可以有子显示对象，而其他显示对象（如 Shape 和 TextField 对象）是“叶”节点，没有子项，只有父级和
     * 同级。DisplayObject 类有一些基本的属性（如确定坐标位置的 x 和 y 属性），也有一些高级的对象属性（如 Matrix 矩阵变换）。<br/>
     * DisplayObject 类包含若干广播事件。通常，任何特定事件的目标均为一个特定的 DisplayObject 实例。例如，added 事件的目标是已添加到显示列表
     * 的目标 DisplayObject 实例。若只有一个目标，则会将事件侦听器限制为只能监听在该目标上（在某些情况下，可监听在显示列表中该目标的祖代上）。
     * 但是对于广播事件，目标不是特定的 DisplayObject 实例，而是所有 DisplayObject 实例（包括那些不在显示列表中的实例）。这意味着您可以向任何
     * DisplayObject 实例添加侦听器来侦听广播事件。
     *
     * @event lark.Event.ADDED 将显示对象添加到显示列表中时调度。
     * @event lark.Event.ADDED_TO_STAGE 在将显示对象直接添加到舞台显示列表或将包含显示对象的子树添加至舞台显示列表中时调度。
     * @event lark.Event.REMOVED 将要从显示列表中删除显示对象时调度。
     * @event lark.Event.REMOVED_FROM_STAGE 在从显示列表中直接删除显示对象或删除包含显示对象的子树时调度。
     * @event lark.Event.ENTER_FRAME [广播事件] 播放头进入新帧时调度。
     * @event lark.Event.RENDER [广播事件] 将要更新和呈现显示列表时调度。
     * @version Lark 1.0
     * @platform Web,Native
     */
    export class DisplayObject extends EventEmitter implements sys.Renderable {

        /**
         * @language en_US
         * Initializes a DisplayObject object
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 创建一个显示对象
         * @version Lark 1.0
         * @platform Web,Native
         */
        public constructor() {
            super();
            this.$displayFlags = sys.DisplayObjectFlags.InitFlags;
            this.$DisplayObject = {
                0: 1,                //scaleX,
                1: 1,                //scaleY,
                2: 0,                //skewX,
                3: 0,                //skewY,
                4: 0,                //rotation
                5: "",               //name
                6: new Matrix(),     //matrix,
                7: new Matrix(),     //invertedConcatenatedMatrix,
                8: new Rectangle(),  //bounds,
                9: new Rectangle(),  //contentBounds
            };
        }

        /**
         * @private
         */
        $DisplayObject:Object;

        /**
         * @private
         */
        $displayFlags:number;

        /**
         * @private
         * 添加一个标志量
         */
        $setFlags(flags:number):void {
            this.$displayFlags |= flags;
        }

        /**
         * @private
         * 开启或关闭一个标志量
         */
        $toggleFlags(flags:number, on:boolean):void {
            if (on) {
                this.$displayFlags |= flags;
            } else {
                this.$displayFlags &= ~flags;
            }
        }

        /**
         * @private
         * 移除一个标志量
         */
        $removeFlags(flags:number):void {
            this.$displayFlags &= ~flags;
        }

        /**
         * @private
         * 沿着显示列表向上移除标志量，如果标志量没被设置过就停止移除。
         */
        $removeFlagsUp(flags:number):void {
            if (!this.$hasAnyFlags(flags)) {
                return;
            }
            this.$removeFlags(flags)
            var parent = this.$parent;
            if (parent) {
                parent.$removeFlagsUp(flags);
            }
        }

        /**
         * @private
         * 是否含有指定的所有标志量
         */
        $hasFlags(flags:number):boolean {
            return (this.$displayFlags & flags) === flags;
        }

        /**
         * @private
         * 沿着显示列表向上传递标志量，如果标志量已经被设置过就停止传递。
         */
        $propagateFlagsUp(flags:number):void {
            if (this.$hasFlags(flags)) {
                return;
            }
            this.$setFlags(flags);
            var parent = this.$parent;
            if (parent) {
                parent.$propagateFlagsUp(flags);
            }
        }

        /**
         * @private
         * 沿着显示列表向下传递标志量，非容器直接设置自身的flag，此方法会在 DisplayObjectContainer 中被覆盖。
         */
        $propagateFlagsDown(flags:number):void {
            this.$setFlags(flags);
        }

        /**
         * @private
         * 是否含有多个标志量其中之一。
         */
        $hasAnyFlags(flags:number):boolean {
            return !!(this.$displayFlags & flags);
        }

        /**
         * @private
         * 标记矩阵失效
         */
        private invalidateMatrix():void {
            this.$setFlags(sys.DisplayObjectFlags.InvalidMatrix);
            this.invalidatePosition();
        }

        /**
         * @private
         * 标记这个显示对象在父级容器的位置发生了改变。
         */
        private invalidatePosition():void {
            this.$invalidateTransform();
            this.$propagateFlagsDown(sys.DisplayObjectFlags.InvalidConcatenatedMatrix |
                sys.DisplayObjectFlags.InvalidInvertedConcatenatedMatrix);
            if (this.$parent) {
                this.$parent.$propagateFlagsUp(sys.DisplayObjectFlags.InvalidBounds);
            }
        }

        /**
         * @private
         * 能够含有子项的类将子项列表存储在这个属性里。
         */
        $children:DisplayObject[] = null;

        /**
         * @language en_US
         * Indicates the instance name of the DisplayObject. The object can be identified in the child list of its parent
         * display object container by calling the getChildByName() method of the display object container.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示 DisplayObject 的实例名称。
         * 通过调用父显示对象容器的 getChildByName() 方法，可以在父显示对象容器的子列表中标识该对象。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get name():string {
            return this.$DisplayObject[Keys.name];
        }

        public set name(value:string) {
            this.$DisplayObject[Keys.name] = value;
        }

        /**
         * @private
         */
        $parent:DisplayObjectContainer = null;

        /**
         * @language en_US
         * Indicates the DisplayObjectContainer object that contains this display object. Use the parent property to specify
         * a relative path to display objects that are above the current display object in the display list hierarchy.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示包含此显示对象的 DisplayObjectContainer 对象。
         * 使用 parent 属性可以指定高于显示列表层次结构中当前显示对象的显示对象的相对路径。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get parent():DisplayObjectContainer {
            return this.$parent;
        }

        /**
         * @private
         * 设置父级显示对象
         */
        $setParent(parent:DisplayObjectContainer):void {
            this.$parent = parent;
        }

        /**
         * @private
         * 显示对象添加到舞台
         */
        $onAddToStage(stage:Stage, nestLevel:number):void {
            this.$stage = stage;
            this.$nestLevel = nestLevel;
            Sprite.$EVENT_ADD_TO_STAGE_LIST.push(this);
        }

        /**
         * @private
         * 显示对象从舞台移除
         */
        $onRemoveFromStage():void {
            this.$nestLevel = 0;
            Sprite.$EVENT_REMOVE_FROM_STAGE_LIST.push(this);
        }

        /**
         * @private
         */
        $stage:Stage = null;

        /**
         * @private
         * 这个对象在显示列表中的嵌套深度，舞台为1，它的子项为2，子项的子项为3，以此类推。当对象不在显示列表中时此属性值为0.
         */
        $nestLevel:number = 0;

        /**
         * @language en_US
         * The Stage of the display object. you can create and load multiple display objects into the display list, and
         * the stage property of each display object refers to the same Stage object.<br/>
         * If a display object is not added to the display list, its stage property is set to null.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 显示对象的舞台。
         * 例如，您可以创建多个显示对象并加载到显示列表中，每个显示对象的 stage 属性是指相同的 Stage 对象。<br/>
         * 如果显示对象未添加到显示列表，则其 stage 属性会设置为 null。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get stage():Stage {
            return this.$stage;
        }

        /**
         * @language en_US
         * A Matrix object containing values that alter the scaling, rotation, and translation of the display object.<br/>
         * Note: to change the value of a display object's matrix, you must make a copy of the entire matrix object, then copy
         * the new object into the matrix property of the display object.
         * @example the following code increases the tx value of a display object's matrix
         * <code>
         *     var myMatrix:Matrix = myDisplayObject.matrix;
         *     myMatrix.tx += 10;
         *     myDisplayObject.matrix = myMatrix;
         * </code>
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 一个 Matrix 对象，其中包含更改显示对象的缩放、旋转和平移的值。<br/>
         * 注意：要改变一个显示对象矩阵的值，您必引用整个矩阵对象，然后将它重新赋值给显示对象的 matrix 属性。
         * @example 以下代码改变了显示对象矩阵的tx属性值：
         * <code>
         *     var myMatrix:Matrix = myDisplayObject.matrix;
         *     myMatrix.tx += 10;
         *     myDisplayObject.matrix = myMatrix;
         * </code>
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get matrix():Matrix {
            return this.$getMatrix().clone();
        }

        /**
         * @private
         * 获取矩阵
         */
        $getMatrix():Matrix {
            var values = this.$DisplayObject;
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidMatrix)) {
                values[Keys.matrix].$updateScaleAndRotation(values[Keys.scaleX], values[Keys.scaleY], values[Keys.skewX], values[Keys.skewY]);
                this.$removeFlags(sys.DisplayObjectFlags.InvalidMatrix);
            }
            return values[Keys.matrix];
        }

        public set matrix(value:Matrix) {
            this.$setMatrix(value);
            if (value) {
                this.$DisplayObject[Keys.matrix].copyFrom(value);
            }
        }

        /**
         * @private
         * 设置矩阵
         */
        $setMatrix(matrix:Matrix):void {
            var values = this.$DisplayObject;
            var m = values[Keys.matrix];
            if (m.equals(matrix)) {
                return;
            }

            m.copyFrom(matrix);
            values[Keys.scaleX] = m.$getScaleX();
            values[Keys.scaleY] = m.$getScaleY();
            values[Keys.skewX] = matrix.$getSkewX();
            values[Keys.skewY] = matrix.$getSkewY();
            values[Keys.rotation] = clampRotation(values[Keys.skewY] * 180 / Math.PI);
            this.$removeFlags(sys.DisplayObjectFlags.InvalidMatrix);
            this.invalidatePosition();
        }


        /**
         * @private
         * 获得这个显示对象以及它所有父级对象的连接矩阵。
         */
        $getConcatenatedMatrix():Matrix {
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidConcatenatedMatrix)) {
                if (this.$parent) {
                    this.$parent.$getConcatenatedMatrix().$preMultiplyInto(this.$getMatrix(),
                        this.$renderMatrix);
                    var rect = this.$scrollRect;
                    if (rect) {
                        this.$renderMatrix.$preMultiplyInto($TempMatrix.setTo(1, 0, 0, 1, -rect.x, -rect.y), this.$renderMatrix)
                    }
                } else {
                    this.$renderMatrix.copyFrom(this.$getMatrix());
                }
                if (this.$displayList) {
                    this.$displayList.$renderRegion.moved = true;
                }
                if (this.$renderRegion) {
                    this.$renderRegion.moved = true;
                }
                this.$removeFlags(sys.DisplayObjectFlags.InvalidConcatenatedMatrix);
            }
            return this.$renderMatrix;
        }

        /**
         * @private
         * 获取链接矩阵
         */
        $getInvertedConcatenatedMatrix():Matrix {
            var values = this.$DisplayObject;
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidInvertedConcatenatedMatrix)) {
                this.$getConcatenatedMatrix().$invertInto(values[Keys.invertedConcatenatedMatrix]);
                this.$removeFlags(sys.DisplayObjectFlags.InvalidInvertedConcatenatedMatrix);
            }
            return values[Keys.invertedConcatenatedMatrix];
        }

        /**
         * @language en_US
         * Indicates the x coordinate of the DisplayObject instance relative to the local coordinates of the parent
         * DisplayObjectContainer.<br/>
         * If the object is inside a DisplayObjectContainer that has transformations, it is in
         * the local coordinate system of the enclosing DisplayObjectContainer. Thus, for a DisplayObjectContainer
         * rotated 90° counterclockwise, the DisplayObjectContainer's children inherit a coordinate system that is
         * rotated 90° counterclockwise. The object's coordinates refer to the registration point position.
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示 DisplayObject 实例相对于父级 DisplayObjectContainer 本地坐标的 x 坐标。<br/>
         * 如果该对象位于具有变形的 DisplayObjectContainer 内，则它也位于包含 DisplayObjectContainer 的本地坐标系中。
         * 因此，对于逆时针旋转 90 度的 DisplayObjectContainer，该 DisplayObjectContainer 的子级将继承逆时针旋转 90 度的坐标系。
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get x():number {
            return this.$getX();
        }

        /**
         * @private
         * 获取x坐标
         */
        $getX():number {
            return this.$DisplayObject[Keys.matrix].tx;
        }

        public set x(value:number) {
            this.$setX(value);
        }

        /**
         * @private
         * 设置x坐标
         */
        $setX(value:number):boolean {
            value = +value || 0;
            var m = this.$DisplayObject[Keys.matrix];
            if (value === m.tx) {
                return false;
            }
            m.tx = value;
            this.invalidatePosition();
            return true;
        }

        /**
         * @language en_US
         * Indicates the y coordinate of the DisplayObject instance relative to the local coordinates of the parent
         * DisplayObjectContainer. <br/>
         * If the object is inside a DisplayObjectContainer that has transformations, it is in
         * the local coordinate system of the enclosing DisplayObjectContainer. Thus, for a DisplayObjectContainer rotated
         * 90° counterclockwise, the DisplayObjectContainer's children inherit a coordinate system that is rotated 90°
         * counterclockwise. The object's coordinates refer to the registration point position.
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示 DisplayObject 实例相对于父级 DisplayObjectContainer 本地坐标的 y 坐标。<br/>
         * 如果该对象位于具有变形的 DisplayObjectContainer 内，则它也位于包含 DisplayObjectContainer 的本地坐标系中。
         * 因此，对于逆时针旋转 90 度的 DisplayObjectContainer，该 DisplayObjectContainer 的子级将继承逆时针旋转 90 度的坐标系。
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get y():number {
            return this.$getY();
        }

        /**
         * @private
         * 获取y坐标
         */
        $getY():number {
            return this.$DisplayObject[Keys.matrix].ty;
        }

        public set y(value:number) {
            this.$setY(value);
        }

        /**
         * @private
         * 设置y坐标
         */
        $setY(value:number):boolean {
            value = +value || 0;
            var m = this.$DisplayObject[Keys.matrix];
            if (value === m.ty) {
                return false;
            }
            m.ty = value;
            this.invalidatePosition();
            return true;
        }


        /**
         * @language en_US
         * Indicates the horizontal scale (percentage) of the object as applied from the registration point. <br/>
         * The default 1.0 equals 100% scale.Scaling the local coordinate system changes the x and y property values, which are
         * defined in whole pixels.
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示从注册点开始应用的对象的水平缩放比例（百分比）。<br/>
         * 1.0 等于 100% 缩放。缩放本地坐标系统将更改 x 和 y 属性值，这些属性值是以整像素定义的。
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get scaleX():number {
            return this.$DisplayObject[Keys.scaleX];
        }

        public set scaleX(value:number) {
            this.$setScaleX(value);
        }

        /**
         * @private
         * 设置水平缩放值
         */
        $setScaleX(value:number):boolean {
            value = +value || 0;
            var values = this.$DisplayObject;
            if (value === values[Keys.scaleX]) {
                return false;
            }
            values[Keys.scaleX] = value;
            this.invalidateMatrix();
            return true;
        }

        /**
         * @language en_US
         * Indicates the vertical scale (percentage) of an object as applied from the registration point of the object.
         * 1.0 is 100% scale.Scaling the local coordinate system changes the x and y property values, which are defined
         * in whole pixels.
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示从对象注册点开始应用的对象的垂直缩放比例（百分比）。1.0 是 100% 缩放。
         * 缩放本地坐标系统将更改 x 和 y 属性值，这些属性值是以整像素定义的。
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get scaleY():number {
            return this.$DisplayObject[Keys.scaleY];
        }

        public set scaleY(value:number) {
            this.$setScaleY(value);
        }

        /**
         * @private
         * 设置垂直缩放值
         */
        $setScaleY(value:number):boolean {
            value = +value || 0;
            if (value === this.$DisplayObject[Keys.scaleY]) {
                return false;
            }
            this.$DisplayObject[Keys.scaleY] = value;
            this.invalidateMatrix();
            return true;
        }

        /**
         * @language en_US
         * Indicates the rotation of the DisplayObject instance, in degrees, from its original orientation. Values from
         * 0 to 180 represent clockwise rotation; values from 0 to -180 represent counterclockwise rotation. Values outside
         * this range are added to or subtracted from 360 to obtain a value within the range. For example, the statement
         * myDisplayObject.rotation = 450 is the same as myDisplayObject.rotation = 90.
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示 DisplayObject 实例距其原始方向的旋转程度，以度为单位。
         * 从 0 到 180 的值表示顺时针方向旋转；从 0 到 -180 的值表示逆时针方向旋转。对于此范围之外的值，可以通过加上或
         * 减去 360 获得该范围内的值。例如，myDisplayObject.rotation = 450语句与 myDisplayObject.rotation = 90 是相同的。
         * @default 0
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get rotation():number {
            return this.$DisplayObject[Keys.rotation];
        }

        public set rotation(value:number) {
            value = +value || 0;
            value = clampRotation(value);
            var values = this.$DisplayObject;
            if (value === values[Keys.rotation]) {
                return;
            }
            var delta = value - values[Keys.rotation];
            var angle = delta / 180 * Math.PI;
            values[Keys.skewX] += angle;
            values[Keys.skewY] += angle;
            values[Keys.rotation] = value;
            this.invalidateMatrix();
        }

        /**
         * @language en_US
         * Indicates the width of the display object, in pixels. The width is calculated based on the bounds of the content
         * of the display object. When you set the width property, the scaleX property is adjusted accordingly.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示显示对象的宽度，以像素为单位。宽度是根据显示对象内容的范围来计算的。如果您设置了 width 属性，则 scaleX 属性会相应调整.
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get width():number {
            return this.$getWidth();
        }

        /**
         * @private
         * 获取显示宽度
         */
        $getWidth():number {
            return this.$getTransformedBounds(this.$parent, $TempRectangle).width;
        }

        public set width(value:number) {
            this.$setWidth(value);
        }

        /**
         * @private
         * 设置显示宽度
         */
        $setWidth(value:number) {
            value = +value || 0;
            if (value < 0) {
                return;
            }
            var values = this.$DisplayObject;
            var originalBounds = this.$getOriginalBounds();
            var bounds = this.$getTransformedBounds(this.$parent, $TempRectangle);
            var angle = values[Keys.rotation] / 180 * Math.PI;
            var baseWidth = originalBounds.$getBaseWidth(angle);
            if (!baseWidth) {
                return;
            }
            var baseHeight = originalBounds.$getBaseHeight(angle);
            values[Keys.scaleY] = bounds.height / baseHeight;
            values[Keys.scaleX] = value / baseWidth;
            this.invalidateMatrix();
        }

        /**
         * @language en_US
         * Indicates the height of the display object, in pixels. The height is calculated based on the bounds of the
         * content of the display object. When you set the height property, the scaleY property is adjusted accordingly.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示显示对象的高度，以像素为单位。高度是根据显示对象内容的范围来计算的。如果您设置了 height 属性，则 scaleY 属性会相应调整。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get height():number {
            return this.$getHeight();
        }

        /**
         * @private
         * 获取显示高度
         */
        $getHeight():number {
            return this.$getTransformedBounds(this.$parent, $TempRectangle).height;
        }

        public set height(value:number) {
            this.$setHeight(value);
        }

        /**
         * @private
         * 设置显示高度
         */
        $setHeight(value:number) {
            value = +value || 0;
            if (value < 0) {
                return;
            }
            var values = this.$DisplayObject;
            var originalBounds = this.$getOriginalBounds();
            var bounds = this.$getTransformedBounds(this.$parent, $TempRectangle);
            var angle = values[Keys.rotation] / 180 * Math.PI;
            var baseHeight = originalBounds.$getBaseHeight(angle);
            if (!baseHeight) {
                return;
            }
            var baseWidth = originalBounds.$getBaseWidth(angle);
            values[Keys.scaleY] = value / baseHeight;
            values[Keys.scaleX] = bounds.width / baseWidth;
            this.invalidateMatrix();
        }

        /**
         * @private
         */
        $visible:boolean = true;

        /**
         * @language en_US
         * Whether or not the display object is visible. Display objects that are not visible are disabled. For example,
         * if visible=false for an DisplayObject instance, it cannot receive touch or other user input.
         * @default true
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 显示对象是否可见。不可见的显示对象将被禁用。例如，如果实例的 visible 为 false，则无法接受触摸或用户交互操作。
         * @default true
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get visible():boolean {
            return this.$visible;
        }

        public set visible(value:boolean) {
            value = !!value;
            if (value === this.$visible) {
                return;
            }
            this.$visible = value;
            this.$invalidateTransform();
        }

        /**
         * @private
         * cacheAsBitmap创建的缓存位图节点。
         */
        $displayList:lark.sys.DisplayList = null;

        /**
         * @language en_US
         * If set to true, Lark runtime caches an internal bitmap representation of the display object. This caching can
         * increase performance for display objects that contain complex vector content. After you set the cacheAsBitmap
         * property to true, the rendering does not change, however the display object performs pixel snapping automatically.
         * The execution speed can be significantly faster depending on the complexity of the content.The cacheAsBitmap
         * property is best used with display objects that have mostly static content and that do not scale and rotate frequently.<br/>
         * Note: The display object will not create the bitmap caching when the memory exceeds the upper limit,even if you set it to true.
         * @default false
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 如果设置为 true，则 Lark 运行时将缓存显示对象的内部位图表示形式。此缓存可以提高包含复杂矢量内容的显示对象的性能。
         * 将 cacheAsBitmap 属性设置为 true 后，呈现并不更改，但是，显示对象将自动执行像素贴紧。执行速度可能会大大加快，
         * 具体取决于显示对象内容的复杂性。最好将 cacheAsBitmap 属性与主要具有静态内容且不频繁缩放或旋转的显示对象一起使用。<br/>
         * 注意：在内存超过上限的情况下，即使将 cacheAsBitmap 属性设置为 true，显示对象也不使用位图缓存。
         * @default false
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get cacheAsBitmap():boolean {
            return this.$hasFlags(sys.DisplayObjectFlags.CacheAsBitmap);
        }

        public set cacheAsBitmap(value:boolean) {
            value = !!value;
            this.$toggleFlags(sys.DisplayObjectFlags.CacheAsBitmap, value);
            var hasDisplayList = !!this.$displayList;
            if (hasDisplayList === value) {
                return;
            }
            if (value) {
                var displayList = sys.DisplayList.create(this);
                if (displayList) {
                    this.$displayList = displayList;
                    if (this.$parentDisplayList) {
                        this.$parentDisplayList.markDirty(displayList);
                    }
                    this.$cacheAsBitmapChanged();
                }
            }
            else {
                sys.DisplayList.release(this.$displayList);
                this.$displayList = null;
                this.$cacheAsBitmapChanged();
            }
        }

        /**
         * @private
         * cacheAsBitmap属性改变
         */
        $cacheAsBitmapChanged():void {
            var parentCache = this.$displayList || this.$parentDisplayList;
            if (this.$renderRegion) {
                parentCache.markDirty(this);
            }
        }

        /**
         * @private
         */
        $alpha:number = 1;

        /**
         * @language en_US
         * Indicates the alpha transparency value of the object specified. Valid values are 0 (fully transparent) to 1 (fully opaque).
         * The default value is 1. Display objects with alpha set to 0 are active, even though they are invisible.
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 表示指定对象的 Alpha 透明度值。
         * 有效值为 0（完全透明）到 1（完全不透明）。alpha 设置为 0 的显示对象是可触摸的，即使它们不可见。
         * @default 1
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get alpha():number {
            return this.$alpha;
        }

        public set alpha(value:number) {
            value = +value || 0;
            if (value === this.$alpha) {
                return;
            }
            this.$alpha = value;
            this.$propagateFlagsDown(sys.DisplayObjectFlags.InvalidConcatenatedAlpha);
            this.$invalidate(true);
        }

        /**
         * @private
         * 获取这个显示对象跟它所有父级透明度的乘积
         */
        $getConcatenatedAlpha():number {
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidConcatenatedAlpha)) {
                if (this.$parent) {
                    var parentAlpha = this.$parent.$getConcatenatedAlpha();
                    this.$renderAlpha = parentAlpha * this.$alpha;
                }
                else {
                    this.$renderAlpha = this.$alpha;
                }
                this.$removeFlags(sys.DisplayObjectFlags.InvalidConcatenatedAlpha);
            }
            return this.$renderAlpha;
        }

        /**
         * @language en_US
         * Specifies whether this object receives touch or other user input. The default value is true, which means that
         * by default any DisplayObject instance that is on the display list receives touch events. If touchEnabled is
         * set to false, the instance does not receive any touch events (or other user input events). Any children of
         * this instance on the display list are not affected. To change the touchEnabled behavior for all children of
         * an object on the display list, use DisplayObjectContainer.touchChildren.
         * @see lark.DisplayObjectContainer#touchChildren
         * @default true
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 指定此对象是否接收触摸或其他用户输入。默认值为 true，这表示默认情况下，显示列表上的任何 isplayObject 实例都会接收触摸事件或
         * 其他用户输入事件。如果将 touchEnabled 设置为 false，则实例将不接收任何触摸事件（或其他用户输入事件）。显示列表上的该实例的任
         * 何子级都不会受到影响。要更改显示列表上对象的所有子级的 touchEnabled 行为，请使用 DisplayObjectContainer.touchChildren。
         * @see lark.DisplayObjectContainer#touchChildren
         * @default true
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get touchEnabled():boolean {
            return this.$hasFlags(sys.DisplayObjectFlags.TouchEnabled);
        }

        public set touchEnabled(value:boolean) {
            this.$setTouchEnabled(value);
        }

        /**
         * @private
         */
        $setTouchEnabled(value:boolean):void {
            this.$toggleFlags(sys.DisplayObjectFlags.TouchEnabled, !!value);
        }

        /**
         * @language en_US
         * Specifies whether this object use precise hit testing by checking the alpha value of each pixel.If pixelHitTest
         * is set to true,the transparent area of the display object will be touched through.<br/>
         * Enabling this property will cause certain mount of performance loss. This property is set to true in the Shape class,
         * while the other is set to false by default.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 是否开启精确像素碰撞。设置为true显示对象本身的透明区域将能够被穿透，<br/>
         * 开启此属性将会有一定量的额外性能损耗，Shape等含有矢量图的类默认开启此属性，其他类默认关闭。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get pixelHitTest():boolean {
            return this.$hasFlags(sys.DisplayObjectFlags.PixelHitTest);
        }

        public set pixelHitTest(value:boolean) {
            this.$toggleFlags(sys.DisplayObjectFlags.PixelHitTest, !!value);
        }

        /**
         * @private
         */
        $scrollRect:Rectangle = null;

        /**
         * @language en_US
         * The scroll rectangle bounds of the display object. The display object is cropped to the size defined by the rectangle,
         * and it scrolls within the rectangle when you change the x and y properties of the scrollRect object. A scrolled display
         * object always scrolls in whole pixel increments.You can scroll an object left and right by setting the x property of
         * the scrollRect Rectangle object. You can scroll an object up and down by setting the y property of the scrollRect
         * Rectangle object. If the display object is rotated 90° and you scroll it left and right, the display object actually
         * scrolls up and down.<br/>
         *
         * Note: to change the value of a display object's scrollRect, you must make a copy of the entire scrollRect object, then copy
         * the new object into the scrollRect property of the display object.
         * @example the following code increases the x value of a display object's scrollRect
         * <code>
         *     var myRectangle:Rectangle = myDisplayObject.scrollRect;
         *     myRectangle.x += 10;
         *     myDisplayObject.scrollRect = myRectangle;
         * </code>
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 显示对象的滚动矩形范围。显示对象被裁切为矩形定义的大小，当您更改 scrollRect 对象的 x 和 y 属性时，它会在矩形内滚动。
         * 滚动的显示对象始终以整像素为增量进行滚动。您可以通过设置 scrollRect Rectangle 对象的 x 属性来左右滚动对象， 还可以通过设置
         * scrollRect 对象的 y 属性来上下滚动对象。如果显示对象旋转了 90 度，并且您左右滚动它，则实际上显示对象会上下滚动。<br/>
         *
         * 注意：要改变一个显示对象 scrollRect 属性的值，您必引用整个 scrollRect 对象，然后将它重新赋值给显示对象的 scrollRect 属性。
         * @example 以下代码改变了显示对象 scrollRect 的 x 属性值：
         * <code>
         *     var myRectangle:Rectangle = myDisplayObject.scrollRect;
         *     myRectangle.x += 10;
         *     myDisplayObject.scrollRect = myRectangle;
         * </code>
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get scrollRect():Rectangle {
            return this.$scrollRect ? this.$scrollRect.clone() : null;
        }

        public set scrollRect(value:Rectangle) {
            if (!value && !this.$scrollRect) {
                return;
            }
            if (value) {
                if (!this.$scrollRect) {
                    this.$scrollRect = new lark.Rectangle();
                    window['scrollRect'] = this.$scrollRect;
                }
                this.$scrollRect.copyFrom(value);
            }
            else {
                this.$scrollRect = null;
            }
            this.invalidatePosition();
        }

        /**
         * @private
         */
        $blendMode:number = 0;

        /**
         * @language en_US
         * A value from the BlendMode class that specifies which blend mode to use. Determine how a source image (new one)
         * is drawn on the target image (old one).<br/>
         * If you attempt to set this property to an invalid value, Lark runtime set the value to BlendMode.NORMAL.
         * @default lark.BlendMode.NORMAL
         * @see lark.BlendMode
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * BlendMode 枚举中的一个值，用于指定要使用的混合模式，确定如何将一个源（新的）图像绘制到目标（已有）的图像上<br/>
         * 如果尝试将此属性设置为无效值，则运行时会将此值设置为 BlendMode.NORMAL。
         * @default lark.BlendMode.NORMAL
         * @see lark.BlendMode
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get blendMode():string {
            return sys.numberToBlendMode(this.$blendMode);
        }

        public set blendMode(value:string) {
            var mode = sys.blendModeToNumber(value);
            if (mode === this.$blendMode) {
                return;
            }
            this.$blendMode = mode;
            this.$invalidateTransform();
        }

        /**
         * @private
         * 被遮罩的对象
         */
        $maskedObject:DisplayObject = null;

        /**
         * @private
         */
        $mask:DisplayObject = null;

        /**
         * @language en_US
         * The calling display object is masked by the specified mask object. To ensure that masking works when the Stage
         * is scaled, the mask display object must be in an active part of the display list. The mask object itself is not drawn.
         * Set mask to null to remove the mask. To be able to scale a mask object, it must be on the display list. To be
         * able to drag a mask Sprite object , it must be on the display list.<br/>
         * Note: A single mask object cannot be used to mask more than one calling display object. When the mask is assigned
         * to a second display object, it is removed as the mask of the first object, and that object's mask property becomes null.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 调用显示对象被指定的 mask 对象遮罩。要确保当舞台缩放时蒙版仍然有效，mask 显示对象必须处于显示列表的活动部分。
         * 但不绘制 mask 对象本身。将 mask 设置为 null 可删除蒙版。要能够缩放遮罩对象，它必须在显示列表中。要能够拖动蒙版
         * Sprite 对象，它必须在显示列表中。<br/>
         * 注意：单个 mask 对象不能用于遮罩多个执行调用的显示对象。在将 mask 分配给第二个显示对象时，会撤消其作为第一个对象的遮罩，
         * 该对象的 mask 属性将变为 null。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public get mask():DisplayObject {
            return this.$mask;
        }

        public set mask(value:DisplayObject) {
            if (value === this.$mask || value === this) {
                return;
            }
            if (value) {
                if (value.$maskedObject) {
                    value.$maskedObject.mask = null;
                }
                value.$maskedObject = this;
            }
            this.$mask = value;
            this.$invalidateTransform();
        }

        /**
         * @language en_US
         * Returns a rectangle that defines the area of the display object relative to the coordinate system of the targetCoordinateSpace object.
         * @param targetCoordinateSpace The display object that defines the coordinate system to use.
         * @param resultRect A reusable instance of Rectangle for saving the results. Passing this parameter can reduce the number of reallocate objects
         *, which allows you to get better code execution performance..
         * @returns The rectangle that defines the area of the display object relative to the targetCoordinateSpace object's coordinate system.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 返回一个矩形，该矩形定义相对于 targetCoordinateSpace 对象坐标系的显示对象区域。
         * @param targetCoordinateSpace 定义要使用的坐标系的显示对象。
         * @param resultRect 一个用于存储结果的可复用Rectangle实例，传入此参数能够减少内部创建对象的次数，从而获得更高的运行性能。
         * @returns 定义与 targetCoordinateSpace 对象坐标系统相关的显示对象面积的矩形。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public getBounds(targetCoordinateSpace:DisplayObject, resultRect?:Rectangle):Rectangle {
            targetCoordinateSpace = targetCoordinateSpace || this;
            return this.$getTransformedBounds(targetCoordinateSpace, resultRect);
        }

        /**
         * @private
         */
        $getTransformedBounds(targetCoordinateSpace:DisplayObject, resultRect?:Rectangle):Rectangle {
            var bounds = this.$getOriginalBounds();
            if (!resultRect) {
                resultRect = new Rectangle();
            }
            resultRect.copyFrom(bounds);
            if (targetCoordinateSpace === this || resultRect.isEmpty()) {
                return resultRect;
            }
            var m:Matrix;
            if (targetCoordinateSpace) {
                m = $TempMatrix;
                var invertedTargetMatrix = targetCoordinateSpace.$getInvertedConcatenatedMatrix();
                invertedTargetMatrix.$preMultiplyInto(this.$getConcatenatedMatrix(), m);
            } else {
                m = this.$getConcatenatedMatrix();
            }
            m.$transformBounds(resultRect);
            return resultRect;
        }

        /**
         * @language en_US
         * Converts the point object from the Stage (global) coordinates to the display object's (local) coordinates.
         * @param stageX the x value in the global coordinates
         * @param stageY the y value in the global coordinates
         * @param resultPoint A reusable instance of Point for saving the results. Passing this parameter can reduce the
         * number of reallocate objects, which allows you to get better code execution performance.
         * @returns A Point object with coordinates relative to the display object.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 将从舞台（全局）坐标转换为显示对象的（本地）坐标。
         * @param stageX 舞台坐标x
         * @param stageY 舞台坐标y
         * @param resultPoint 一个用于存储结果的可复用 Point 实例，传入此参数能够减少内部创建对象的次数，从而获得更高的运行性能。
         * @returns 具有相对于显示对象的坐标的 Point 对象。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public globalToLocal(stageX:number, stageY:number, resultPoint?:Point):Point {
            var m = this.$getInvertedConcatenatedMatrix();
            return m.transformPoint(stageX, stageY, resultPoint);
        }

        /**
         * @language en_US
         * Converts the point object from the display object's (local) coordinates to the Stage (global) coordinates.
         * @param localX the x value in the local coordinates
         * @param localY the x value in the local coordinates
         * @param resultPoint A reusable instance of Point for saving the results. Passing this parameter can reduce the
         * number of reallocate objects, which allows you to get better code execution performance.
         * @returns  A Point object with coordinates relative to the Stage.
         * @version Lark 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 将显示对象的（本地）坐标转换为舞台（全局）坐标。
         * @param localX 本地坐标 x
         * @param localY 本地坐标 y
         * @param resultPoint 一个用于存储结果的可复用 Point 实例，传入此参数能够减少内部创建对象的次数，从而获得更高的运行性能。
         * @returns 一个具有相对于舞台坐标的 Point 对象。
         * @version Lark 1.0
         * @platform Web,Native
         */
        public localToGlobal(localX:number, localY:number, resultPoint?:Point):Point {
            var m = this.$getConcatenatedMatrix();
            return m.transformPoint(localX, localY, resultPoint);
        }

        /**
         * @private
         * 标记自身的测量尺寸失效
         */
        $invalidateContentBounds():void {
            this.$invalidate();
            this.$setFlags(sys.DisplayObjectFlags.InvalidContentBounds);
            this.$propagateFlagsUp(sys.DisplayObjectFlags.InvalidBounds);
        }

        /**
         * @private
         * 获取显示对象占用的矩形区域集合，通常包括自身绘制的测量区域，如果是容器，还包括所有子项占据的区域。
         */
        $getOriginalBounds():Rectangle {
            var bounds = this.$DisplayObject[Keys.bounds];
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidBounds)) {
                bounds.copyFrom(this.$getContentBounds());
                this.$measureChildBounds(bounds);
                this.$removeFlags(sys.DisplayObjectFlags.InvalidBounds);
                if (this.$displayList) {
                    this.$displayList.$renderRegion.moved = true;
                }
            }
            return bounds;
        }

        /**
         * @private
         * 测量子项占用的矩形区域
         * @param bounds 测量结果存储在这个矩形对象内
         */
        $measureChildBounds(bounds:Rectangle):void {

        }

        /**
         * @private
         */
        $getContentBounds():Rectangle {
            var bounds = this.$DisplayObject[Keys.contentBounds];
            if (this.$hasFlags(sys.DisplayObjectFlags.InvalidContentBounds)) {
                this.$measureContentBounds(bounds);
                if (this.$renderRegion) {
                    this.$renderRegion.moved = true;
                }
                this.$removeFlags(sys.DisplayObjectFlags.InvalidContentBounds);
            }
            return bounds;
        }

        /**
         * @private
         * 测量自身占用的矩形区域，注意：此测量结果并不包括子项占据的区域。
         * @param bounds 测量结果存储在这个矩形对象内
         */
        $measureContentBounds(bounds:Rectangle):void {

        }

        /**
         * @private
         */
        $parentDisplayList:lark.sys.DisplayList = null;

        /**
         * @private
         * 标记此显示对象需要重绘。此方法会触发自身的cacheAsBitmap重绘。如果只是矩阵改变，自身显示内容并不改变，应该调用$invalidateTransform().
         * @param notiryChildren 是否标记子项也需要重绘。传入false或不传入，将只标记自身需要重绘。通常只有alpha属性改变会需要通知子项重绘。
         */
        $invalidate(notifyChildren?:boolean):void {
            if (!this.$renderRegion || this.$hasFlags(sys.DisplayObjectFlags.DirtyRender)) {
                return;
            }
            this.$setFlags(sys.DisplayObjectFlags.DirtyRender);
            var displayList = this.$displayList ? this.$displayList : this.$parentDisplayList;
            if (displayList) {
                displayList.markDirty(this);
            }
        }

        /**
         * @private
         * 标记自身以及所有子项在父级中变换叠加的显示内容失效。此方法不会触发自身的cacheAsBitmap重绘。
         * 通常用于矩阵改变或从显示列表添加和移除时。若自身的显示内容已经改变需要重绘，应该调用$invalidate()。
         */
        $invalidateTransform():void {
            if (this.$hasFlags(sys.DisplayObjectFlags.DirtyChildren)) {
                return;
            }
            this.$setFlags(sys.DisplayObjectFlags.DirtyChildren);
            var displayList = this.$displayList;
            if ((displayList || this.$renderRegion) && this.$parentDisplayList) {
                this.$parentDisplayList.markDirty(displayList || this);
            }
        }

        /**
         * @private
         * 是否需要重绘的标志，此属性在渲染时会被访问，所以单独声明一个直接的变量。
         */
        $isDirty:boolean = false;
        /**
         * @private
         * 这个对象在舞台上的整体透明度
         */
        $renderAlpha:number = 1;
        /**
         * @private
         * 在舞台上的矩阵对象
         */
        $renderMatrix:Matrix = new lark.Matrix();
        /**
         * @private
         * 此显示对象自身（不包括子项）在屏幕上的显示尺寸。
         */
        $renderRegion:sys.Region = null;

        /**
         * @private
         * 更新对象在舞台上的显示区域和透明度,返回显示区域是否发生改变。
         */
        $update():boolean {
            this.$removeFlagsUp(sys.DisplayObjectFlags.Dirty);
            this.$getConcatenatedAlpha();
            var matrix = this.$getConcatenatedMatrix();
            var bounds = this.$getContentBounds();
            var stage = this.$stage;
            if (!stage) {
                return false;
            }
            var region = this.$renderRegion;
            if (!region.moved) {
                return false;
            }
            region.moved = false;
            region.updateRegion(bounds, matrix);
            return true;
        }

        /**
         * @private
         * 执行渲染,绘制自身到屏幕
         */
        $render(context:sys.RenderContext):void {

        }

        /**
         * @private
         */
        $hitTest(stageX:number, stageY:number, shapeFlag?:boolean):DisplayObject {
            if (!this.$renderRegion || !this.$visible) {
                return null;
            }
            var m = this.$getInvertedConcatenatedMatrix();
            var bounds = this.$getContentBounds();
            var localX = m.a * stageX + m.c * stageY + m.tx;
            var localY = m.b * stageX + m.d * stageY + m.ty;
            if (bounds.contains(localX, localY)) {
                if (!this.$children) {//容器已经检查过scrollRect和mask，避免重复对遮罩进行碰撞。
                    if (this.$scrollRect && !this.$scrollRect.contains(localX, localY)) {
                        return null;
                    }
                    if (this.$mask && !this.$mask.$hitTest(stageX, stageY, true)) {
                        return null;
                    }
                }
                if (shapeFlag || this.$displayFlags & sys.DisplayObjectFlags.PixelHitTest) {
                    return this.hitTestPixel(localX, localY);
                }
                return this;
            }
            return null;
        }

        /**
         * @private
         */
        private hitTestPixel(localX:number, localY:number):DisplayObject {
            var alpha = this.$getConcatenatedAlpha();
            if (alpha === 0) {
                return null;
            }
            var context:sys.RenderContext;
            var data:Uint8Array;
            var displayList = this.$displayList;
            if (displayList) {
                context = displayList.renderContext;
                data = context.getImageData(localX - displayList.offsetX, localY - displayList.offsetY, 1, 1).data;
            }
            else {
                context = sys.sharedRenderContext;
                context.surface.width = context.surface.height = 3;
                context.translate(1 - localX, 1 - localY);
                this.$render(context);
                data = context.getImageData(1, 1, 1, 1).data;
            }
            if (data[3] === 0) {
                return null;
            }
            return this;
        }

        /**
         * @private
         */
        static $enterFrameCallBackList:DisplayObject[] = [];
        /**
         * @private
         */
        static $renderCallBackList:DisplayObject[] = [];

        /**
         * @private
         */
        $addListener(type:string, listener:(event:Event)=>void, thisObject:any, useCapture?:boolean, priority?:number, emitOnce?:boolean):void {
            super.$addListener(type, listener, thisObject, useCapture, priority, emitOnce);
            var isEnterFrame = (type == Event.ENTER_FRAME);
            if (isEnterFrame || type == Event.RENDER) {
                var list = isEnterFrame ? DisplayObject.$enterFrameCallBackList : DisplayObject.$renderCallBackList;
                if (list.indexOf(this) == -1) {
                    list.push(this);
                }
            }
        }

        /**
         * @inheritDoc
         * @version Lark 1.0
         * @platform Web,Native
         */
        public removeListener(type:string, listener:(event:Event)=>void, thisObject:any, useCapture?:boolean):void {
            super.removeListener(type, listener, thisObject, useCapture);
            var isEnterFrame:boolean = (type == Event.ENTER_FRAME);
            if ((isEnterFrame || type == Event.RENDER) && !this.hasListener(type)) {
                var list = isEnterFrame ? DisplayObject.$enterFrameCallBackList : DisplayObject.$renderCallBackList;
                var index = list.indexOf(this);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        }

        /**
         * @inheritDoc
         * @version Lark 1.0
         * @platform Web,Native
         */
        public emit(event:Event):boolean {
            if (!event.$bubbles) {
                return super.emit(event);
            }

            var list = this.$getPropagationList(this);
            var targetIndex = list.length * 0.5;
            event.$target = this;
            this.$emitPropagationEvent(event, list, targetIndex);
            return !event.$isDefaultPrevented;
        }

        /**
         * @private
         * 获取事件流列表。注意：Lark框架的事件流与Flash实现并不一致。
         *
         * 事件流有三个阶段：捕获，目标，冒泡。
         * Flash里默认的的事件监听若不开启useCapture将监听目标和冒泡阶段。若开始capture将只能监听捕获当不包括目标的事件。
         * 可以在Flash中写一个简单的测试：实例化一个非容器显示对象，例如TextField。分别监听useCapture为true和false时的鼠标事件。
         * 点击后将只有useCapture为false的回调函数输出信息。也就带来一个问题「Flash的捕获阶段不能监听到最内层对象本身，只在父级列表有效」。
         *
         * 而HTML里的事件流设置useCapture为true时是能监听到目标阶段的，也就是目标阶段会被触发两次，在捕获和冒泡过程各触发一次。这样可以避免
         * 前面提到的监听捕获无法监听目标本身的问题。
         *
         * Lark最终采用了HTML里目标节点触发两次的事件流方式。
         */
        $getPropagationList(target:DisplayObject):DisplayObject[] {
            var list:DisplayObject[] = [];
            while (target) {
                list.push(target);
                target = target.$parent;
            }
            var captureList = list.concat();
            captureList.reverse();//使用一次reverse()方法比多次调用unshift()性能高。
            list = captureList.concat(list);
            return list;
        }

        /**
         * @private
         */
        $emitPropagationEvent(event:Event, list:DisplayObject[], targetIndex:number):void {
            var length = list.length;
            var captureIndex = targetIndex-1;
            for (var i = 0; i < length; i++) {
                var currentTarget = list[i];
                event.$currentTarget = currentTarget;
                if (i < captureIndex)
                    event.$eventPhase = EventPhase.CAPTURING_PHASE;
                else if (i == targetIndex||i==captureIndex)
                    event.$eventPhase = EventPhase.AT_TARGET;
                else
                    event.$eventPhase = EventPhase.BUBBLING_PHASE;
                currentTarget.$notifyListener(event);
                if (event.$isPropagationStopped || event.$isPropagationImmediateStopped) {
                    return;
                }
            }
        }

        /**
         * @inheritDoc
         * @version Lark 1.0
         * @platform Web,Native
         */
        public willTrigger(type:string):boolean {
            var parent = this;
            while (parent) {
                if (parent.hasListener(type))
                    return true;
                parent = parent.$parent;
            }
            return false;
        }

    }

    registerClass(DisplayObject, Types.DisplayObject);

    if(DEBUG){
        lark.$markReadOnly(DisplayObject.prototype,"parent");
        lark.$markReadOnly(DisplayObject.prototype,"stage");
    }
}
