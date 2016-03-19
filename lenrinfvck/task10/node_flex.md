# flex学习笔记
#### 学习资料
+ [Flexbox详解](https://segmentfault.com/a/1190000002910324#articleHeader0)  

#### 相关属性
**父级:**   
+ `display: flex | inline-flex;` flex容器  
+ `flex-direction` 设置flex元素放置方向  
[row]从左向右, [row-reverse]与row反向, [column]从上到下, [column-reverse]下上  
+ `flex-wrap` 设置换行方式, [nowrap]默认不换行, [wrap]换行, [wrap-reverse]行数反向排列也反向  
+ `flex-flow: <‘flex-direction’> || <‘flex-wrap’>` 以上两属性简写  
+ `justify-content` 当不足一行时的对齐方式  
[flex-start(默认)]左对齐, [flex-end]右对齐, [center]聚拢整体居中, [space-between]等间距分散，且两边左右对齐边界, [space-around]等间距分散，两边保留一半间距  
+ `align-content` 针对行间的对齐方式，类似justify-content, 比之多一个属性[stretch],将所有行拉伸至铺满容器  
+ `align-items` 行内垂直对齐方式  
[flex-start]顶对齐, [flex-end]底对齐, [center]中线对齐, [strench(默认)]拉升至铺满行, [baseline]基线对齐

**子级**
+ `order: <整数>;` 定义子元素的排序，默认是按DOM顺序  
+ `align-self` align-items垂直对齐的单体版，属性相同，默认为auto继承  
+ `flex-grow` 比例长度  
+ `flex-shrink` 伸缩基准值  
+ `flex: none | [<flex-grow> <flex-shrink> || <flex-basis>]` 默认为'0 1 auto'  
