---
title: "Markdown语法笔记"
date: 2018-08-09T21:46:49+08:00
draft: false
tags: ["Markdown"]
categories: ["学习记录"]
---
------
![图片链接已失效](https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.zhimg.com%2Fv2-45e8fd517c0481f4961ab1e1e1abc5a6_1440w.jpg%3Fsource%3D172ae18b&refer=http%3A%2F%2Fpic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648652881&t=d56e5122a7b1d4e32703de752ce0730c)

本文记录Markdown的一些常用语法。
## 插入图片
题图上图片插入格式如下：
```
![图片链接已失效](https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.zhimg.com%2Fv2-45e8fd517c0481f4961ab1e1e1abc5a6_1440w.jpg%3Fsource%3D172ae18b&refer=http%3A%2F%2Fpic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648652881&t=d56e5122a7b1d4e32703de752ce0730c)
```

------

## 行内缩进和换行
### 缩进  
&emsp;&emsp;不管是在段首还是在文章中间，都可以用以下几种方式实现word写作中的“空格”，也就算缩进。  
&ensp;&ensp;半方大的空白`&ensp;`或`&#8194`;  
&emsp;&emsp;全方大的空白`&emsp;`或`&#8195`;  
&nbsp;&nbsp;不断行的空白格`&nbsp;`或`&#160`;  
### 换行  
markdown语法中，在编辑时，文字中间空了一行，显示在网页上就是这两段文字被一行隔开<br>但有时，我们不需要两段文字有那么大的空隙，仅仅只是需要重起一行，有几种方法可以实现：<br>
1. 当想要重起一行时，按下两个空格，再按*Enter*  
2. 使用 &#60;br&#62;标签  
*注：我这里的br标签使用了转义符`&#60;`和`&#62;`，分别显示小于号和大于号*

------
## 关于文字
### 字体颜色以及大小 
在文档中的进行如下编辑
```html
<font color=#0ff9ff size=2 face="黑体">调整字体颜色可以内嵌html语法</font>  
<font color=#055900 size=4 face="微软雅黑">调整字体颜色可以内嵌html语法</font>  
<font color=#0ff90f size=5 face="STCAIYUN">调整字体颜色可以内嵌html语法</font>
```
网页实际显示如下：

<font color=#0ff9ff size=2 face="黑体">调整字体颜色可以内嵌html语法</font>  
<font color=#055900 size=4 face="微软雅黑">调整字体颜色可以内嵌html语法</font>  
<font color=#0ff90f size=5 face="STCAIYUN">调整字体颜色可以内嵌html语法</font>

### 黑体与斜体
对个别字进行强调时需要用到**黑体**或者*斜体*  
`**黑体**` : 想要某部分字显示黑体效果，用两个`*`把那部分字体包裹起来  
`*斜体*` : 同样地，斜体效果是用一个`*`将需要施加斜体效果的字包裹起来

------

## 代码注释
#### 单行注释
`单行代码注释用` 	&#180;这个字符不知道怎么转义，因此无法显示出来，就在键盘数字键‘1’左边，*Tab*键上面。  
#### 多行注释
多行代码注释也用单行注释的那个键，敲三次，紧接着写下编程语言类别，比如*C、python*，然后换行，写代码段，代码写完后，再敲三次，把整个代码段包裹起来。
```C
int main()
{
	printf("hello workd!");
    return 0;
}
```

------

##  列表
[我的博客](https://vicebery.github.io)主要包含以下几方面内容：

> * 学习记录
> * 读书札记
> * 人生体悟
> * 随笔

以上显示的语法如下：
```
> * 学习记录
> * 读书札记
> * 人生体悟
> * 随笔
```


### 制作` Todo 列表`
文本编辑如下：

```
- [ ] 学习记录
- [ ] 读书札记
- [x] 人生体悟
- [x] 随笔
```
文本实际显示如下：
- [ ] 学习记录
- [ ] 读书札记
- [x] 人生体悟
- [x] 随笔



------
作者 [@Vicebery][1]     
2018 年 8 月   

------

[1]: https://vicebery.github.io
