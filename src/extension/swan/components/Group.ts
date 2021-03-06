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

module swan {

    /**
     * @private
     */
    const enum Keys{
        contentWidth,
        contentHeight,
        scrollH,
        scrollV,
        scrollEnabled,
        touchThrough
    }

    /**
     * @language en_US
     * The Group class is defines the base class for layout component.
     * If the contents of the sub items are too large to scroll to show, you can wrap a Scroller component outside the
     * group (Give the instance of Group to <code>viewport</code> property of Scroller component).
     * The scroller component can adds a scrolling touch operation for the Group.
     *
     * @version Lark 1.0
     * @version Swan 1.0
     * @platform Web,Native
     */
    /**
     * @language zh_CN
     * Group 是自动布局的容器基类。如果包含的子项内容太大需要滚动显示，可以在在 Group 外部包裹一层 Scroller 组件
     * (将 Group 实例赋值给 Scroller 组件的 viewport 属性)。Scroller 会为 Group 添加滚动的触摸操作功能，并显示垂直或水平的滚动条。
     *
     * @version Lark 1.0
     * @version Swan 1.0
     * @platform Web,Native
     */
    export class Group extends lark.Sprite implements IViewport {

        /**
         * @language en_US
         * Constructor.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 构造函数。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public constructor() {
            super();
            this.initializeUIValues();
            this.$Group = {
                0: 0,        //contentWidth,
                1: 0,        //contentHeight,
                2: 0,        //scrollH,
                3: 0,        //scrollV,
                4: false,    //scrollEnabled,
                5: false,    //touchThrough
            };
            this.$stateValues.parent = this;
        }

        $Group:Object;

        /**
         * @language en_US
         * [write-only] This property is Usually invoked in resolving an EXML for adding multiple children quickly.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * [只写] 此属性通常在 EXML 的解析器中调用，便于快速添加多个子项。
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public set elementsContent(value:lark.DisplayObject[]) {
            if (value) {
                var length = value.length;
                for (var i = 0; i < length; i++) {
                    this.addChild(value[i]);
                }
            }
        }

        /**
         * @private
         */
        $layout:LayoutBase = null;

        /**
         * @language en_US
         * The layout object for this container.
         * This object is responsible for the measurement and layout of
         * the UIcomponent in the container.
         *
         * @default swan.BasicLayout
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 此容器的布局对象。
         *
         * s@default swan.BasicLayout
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get layout():LayoutBase {
            return this.$layout;
        }

        public set layout(value:LayoutBase) {
            this.$setLayout(value);
        }

        /**
         * @private
         * 
         * @param value 
         */
        $setLayout(value:LayoutBase):void {
            if (this.$layout == value)
                return;
            if (this.$layout) {
                this.$layout.target = null;
            }

            this.$layout = value;

            if (value) {
                value.target = this;
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }

        /**
         * @copy swan.IViewport#contentWidth
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get contentWidth():number {
            return this.$Group[Keys.contentWidth];
        }

        /**
         * @copy swan.IViewport#contentHeight
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get contentHeight():number {
            return this.$Group[Keys.contentHeight];
        }

        /**
         * @language en_US
         *
         * Sets the <code>contentWidth</code> and <code>contentHeight</code>
         * properties.
         *
         * This method is intended for layout class developers who should
         * call it from <code>updateDisplayList()</code> methods.
         *
         * @param width The new value of <code>contentWidth</code>.
         * @param height The new value of <code>contentHeight</code>.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         *
         * 设置 <code>contentWidth</code> 和 <code>contentHeight</code> 属性。
         * 此方法由布局来调用，开发者应该在布局类的 <code>updateDisplayList()</code> 方法中对其进行调用。
         *
         * @param width <code>contentWidth</code> 的新值。
         * @param height <code>contentHeight</code> 的新值。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public setContentSize(width:number, height:number):void {
            width = Math.ceil(+width || 0);
            height = Math.ceil(+height || 0);
            var values = this.$Group;
            var wChange = (values[Keys.contentWidth] !== width);
            var hChange = (values[Keys.contentHeight] !== height);
            if (!wChange && !hChange) {
                return;
            }
            values[Keys.contentWidth] = width;
            values[Keys.contentHeight] = height;
            if (wChange) {
                PropertyEvent.emitPropertyEvent(this, PropertyEvent.PROPERTY_CHANGE, "contentWidth");
            }
            if (hChange) {
                PropertyEvent.emitPropertyEvent(this, PropertyEvent.PROPERTY_CHANGE, "contentHeight");
            }
        }
        /**
         * @copy swan.IViewport#scrollEnabled
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get scrollEnabled():boolean {
            return this.$Group[Keys.scrollEnabled];
        }

        public set scrollEnabled(value:boolean) {
            value = !!value;
            var values = this.$Group;
            if (value === values[Keys.scrollEnabled])
                return;
            values[Keys.scrollEnabled] = value;
            this.updateScrollRect();
        }

        /**
         * @copy swan.IViewport#scrollH
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get scrollH():number {
            return this.$Group[Keys.scrollH];
        }

        public set scrollH(value:number) {
            value = +value || 0;
            var values = this.$Group;
            if (value === values[Keys.scrollH])
                return;
            values[Keys.scrollH] = value;
            if (this.updateScrollRect() && this.$layout) {
                this.$layout.scrollPositionChanged();
            }
            PropertyEvent.emitPropertyEvent(this, PropertyEvent.PROPERTY_CHANGE, "scrollH");
        }

        /**
         * @copy swan.IViewport#scrollV
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get scrollV():number {
            return this.$Group[Keys.scrollV];
        }

        public set scrollV(value:number) {
            value = +value || 0;
            var values = this.$Group;
            if (value == values[Keys.scrollV])
                return;
            values[Keys.scrollV] = value;
            if (this.updateScrollRect() && this.$layout) {
                this.$layout.scrollPositionChanged();
            }
            PropertyEvent.emitPropertyEvent(this, PropertyEvent.PROPERTY_CHANGE, "scrollV");
        }

        /**
         * @private
         * 
         * @returns 
         */
        private updateScrollRect():boolean {
            var values = this.$Group;
            var hasClip = values[Keys.scrollEnabled];
            if (hasClip) {
                var uiValues = this.$UIComponent;
                this.scrollRect = lark.$TempRectangle.setTo(values[Keys.scrollH],
                    values[Keys.scrollV],
                    uiValues[sys.UIKeys.width], uiValues[sys.UIKeys.height]);
            }
            else if (this.$scrollRect) {
                this.scrollRect = null;
            }
            return hasClip;
        }

        /**
         * @language en_US
         * The number of layout element in this container.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 布局元素子项的数量。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get numElements():number {
            return this.$children.length;
        }

        /**
         * @language en_US
         * Returns the layout element at the specified index.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 获取一个布局元素子项。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public getElementAt(index:number):lark.DisplayObject {
            return this.$children[index];
        }

        /**
         * @language en_US
         * Set the index range of the sub Visual element in container which support virtual layout.
         * This method is invalid in container which do not support virtual layout.
         * This method is usually invoked before layout. Override this method to release the invisible elements.
         *
         * @param startIndex the start index of sub visual elements（include）
         * @param endIndex the end index of sub visual elements（include）
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 在支持虚拟布局的容器中，设置容器内可见的子元素索引范围。此方法在不支持虚拟布局的容器中无效。
         * 通常在即将重新布局子项之前会被调用一次，容器覆盖此方法提前释放已经不可见的子元素。
         *
         * @param startIndex 可视元素起始索引（包括）
         * @param endIndex 可视元素结束索引（包括）
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public setVirtualElementIndicesInView(startIndex:number, endIndex:number):void {

        }

        /**
         * @language en_US
         * When <code>true</code>, this property
         * ensures that the entire bounds of the Group respond to
         * touch events such as begin.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 触摸组件的背景透明区域是否可以穿透。设置为true表示可以穿透，反之透明区域也会响应触摸事件。默认 false。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public get touchThrough():boolean{
            return this.$Group[Keys.touchThrough];
        }

        public set touchThrough(value:boolean){
            this.$Group[Keys.touchThrough] = !!value;
        }

        /**
         * @private
         * 
         * @param stageX 
         * @param stageY 
         * @param shapeFlag 
         * @returns 
         */
        $hitTest(stageX:number, stageY:number, shapeFlag?:boolean):lark.DisplayObject {
            var target = super.$hitTest(stageX, stageY, shapeFlag);
            if (target || this.$Group[Keys.touchThrough] || shapeFlag ||
                this.$displayFlags & lark.sys.DisplayObjectFlags.PixelHitTest) {
                return target;
            }
            if (!this.$visible || !this.$hasFlags(lark.sys.DisplayObjectFlags.TouchEnabled)) {
                return null;
            }
            var point = this.globalToLocal(stageX, stageY, lark.$TempPoint);
            var values = this.$UIComponent;
            var bounds = lark.$TempRectangle.setTo(0, 0, values[sys.UIKeys.width], values[sys.UIKeys.height]);
            var scrollRect = this.$scrollRect;
            if(scrollRect){
                bounds.x = scrollRect.x;
                bounds.y = scrollRect.y;
            }
            if (bounds.contains(point.x, point.y)) {
                return this;
            }
            return null;
        }


        /**
         * @private
         */
        $stateValues:sys.StateValues = new sys.StateValues();

        /**
         * @language en_US
         * The list of state for this component.
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        /**
         * @language zh_CN
         * 为此组件定义的视图状态。
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public states:State[];

        /**
         * @copy swan.Component#currentState
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public currentState:string;

        /**
         * @copy swan.Skin#hasState()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public hasState:(stateName:string)=>boolean;
        /**
         * @private
         * 初始化所有视图状态
         */
        private initializeStates:(stage:lark.Stage)=>void;
        /**
         * @private
         * 应用当前的视图状态。子类覆盖此方法在视图状态发生改变时执行相应更新操作。
         */
        private commitCurrentState:()=>void;

        /**
         * @copy swan.Component#invalidateState()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public invalidateState():void {
            var values = this.$stateValues;
            if (values.stateIsDirty) {
                return;
            }
            values.stateIsDirty = true;
            this.invalidateProperties();
        }

        /**
         * @copy swan.Component#getCurrentState()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected getCurrentState():string {
            return "";
        }


        //=======================UIComponent接口实现===========================
        /**
         * @private
         * UIComponentImpl 定义的所有变量请不要添加任何初始值，必须统一在此处初始化。
         */
        private initializeUIValues:()=>void;

        /**
         * @copy swan.Component#createChildren()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected createChildren():void {
            if (!this.$layout) {
                this.$setLayout(new BasicLayout());
            }
            this.initializeStates(this.$stage);
        }

        /**
         * @copy swan.Component#childrenCreated()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected childrenCreated():void {

        }

        /**
         * @copy swan.Component#commitProperties()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected commitProperties():void {
            sys.UIComponentImpl.prototype["commitProperties"].call(this);
            var values = this.$stateValues;
            if (values.stateIsDirty) {
                values.stateIsDirty = false;
                if (!values.explicitState) {
                    values.currentState = this.getCurrentState();
                    this.commitCurrentState();
                }
            }
        }

        /**
         * @copy swan.Component#measure()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected measure():void {
            if (!this.$layout) {
                this.setMeasuredSize(0, 0);
                return;
            }
            this.$layout.measure();
        }

        /**
         * @copy swan.Component#updateDisplayList()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected updateDisplayList(unscaledWidth:number, unscaledHeight:number):void {
            if (this.$layout) {
                this.$layout.updateDisplayList(unscaledWidth, unscaledHeight);
            }
            this.updateScrollRect();
        }


        /**
         * @copy swan.Component#invalidateParentLayout()
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        protected invalidateParentLayout():void {
        }

        /**
         * @private
         */
        $UIComponent:Object;

        /**
         * @private
         */
        $includeInLayout:boolean;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public includeInLayout:boolean;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public left:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public right:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public top:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public bottom:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public horizontalCenter:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public verticalCenter:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public percentWidth:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public percentHeight:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public explicitWidth:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public explicitHeight:number;


        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public minWidth:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public maxWidth:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public minHeight:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public maxHeight:number;

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public setMeasuredSize(width:number, height:number):void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public invalidateProperties():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public validateProperties():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public invalidateSize():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public validateSize(recursive?:boolean):void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public invalidateDisplayList():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public validateDisplayList():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public validateNow():void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public setLayoutBoundsSize(layoutWidth:number, layoutHeight:number):void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public setLayoutBoundsPosition(x:number, y:number):void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public getLayoutBounds(bounds:lark.Rectangle):void {
        }

        /**
         * @inheritDoc
         *
         * @version Lark 1.0
         * @version Swan 1.0
         * @platform Web,Native
         */
        public getPreferredBounds(bounds:lark.Rectangle):void {
        }
    }

    sys.implementUIComponent(Group, lark.Sprite, true);
    sys.mixin(Group, sys.StateClient);
    registerProperty(Group, "elementsContent", "Array", true);
    registerProperty(Group, "states", "State[]");

    if(DEBUG){
        lark.$markReadOnly(Group.prototype,"contentWidth");
        lark.$markReadOnly(Group.prototype,"contentHeight");
        lark.$markReadOnly(Group.prototype,"numElements");
    }
}