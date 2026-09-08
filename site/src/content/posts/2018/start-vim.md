---
title: "初识vim"
date: 2018-08-13T10:30:49+08:00
draft: false
tags: ["Linux","vim"]
categories: ["学习记录"]
---
------
vim具有程序编辑的能力，可以主动以字体颜色辨别语法的正确性，方便程序设计；可以使用命令实现快速的文档编辑。  

------

vim共分为3种模式，分别是一般模式、编辑模式与命令行模式。 

## 一般模式  
以vi/vim打开一个文件就直接进入一般模式了，这是默认的模式。在这个模式，可以用上下左右按键来移动光标，可以删除字符或删除整行，也可以复制、粘贴文件数据。  

## 编辑模式  
按下“i,l,o,O,a,A,r,R”等任何一个字母之后才会进入编辑模式。按下`Esc`按键即可回到一般模式。  

## 命令行模式  
在一般模式下，输入“:、/、?”3个中的任何一个按钮，就可以将光标移动到最下面那一行，进入命令行模式。在此模式中，可以进行查找数据、读取、保存、大量替换字符、离开vim、显示行号等操作。按下`Esc`按键也可回到一般模式。  

------


# 按键说明
## 一般模式下
在**一般模式**下可用的按键说明，包括光标移动、复制粘贴、查找替换等。
<font color=#0ff9ff size=4 face="黑体"></font>  
<font color=#0ff9ff size=4 face="黑体">h,j,k,l </font>&emsp;分别代表光标向左，下，上，右移动一个字符；  
<font color=red>eg:</font>&emsp;20l代表向右移动20个字符。

<font color=#0ff9ff size=4 face="黑体">数字0或home键</font>&emsp;移动到当前行最前面字符处 

<font color=#0ff9ff size=4 face="黑体">'$'或End键</font>&emsp;移动到当前行最后面字符处

<font color=#0ff9ff size=4 face="黑体"> 'H'</font>&emsp;光标移动到当前屏幕最上方行的首字符
 
 <font color=#0ff9ff size=4 face="黑体">'M'</font>&emsp;光标移动到当前屏幕中间行的首字符
 
 <font color=#0ff9ff size=4 face="黑体"> 'L'</font>&emsp;光标移动到当前屏幕最下方行的首字符
 
 <font color=#0ff9ff size=4 face="黑体"> 'G'</font>&emsp;光标移动到该文件的最后一行
 
 <font color=#0ff9ff size=4 face="黑体">gg</font>&emsp;移动到文件的第一行

<font color=#0ff9ff size=4 face="黑体"> x</font>&emsp;向后删除一个字符&emsp;*[相当于Delete]*  
&emsp;<font color=red>eg:</font>&emsp; 10x 代表向后删除10个字符
 
 <font color=#0ff9ff size=4 face="黑体"> X </font>&emsp;向前删除一个字符&emsp;*[相当于Backspace]*
 
 <font color=#0ff9ff size=4 face="黑体">dd</font>&emsp;删除当前行  
 <font color=red>eg:</font> &emsp;10dd&emsp;表示删除光标所在的向下10行  
&emsp;&emsp; d1G&emsp;删除光标所在到第一行的所有数据  
&emsp;&emsp; dG&emsp;删除从光标所在到最后一行的所有数据  
&emsp;&emsp; d`$`&emsp;删除从光标所在处到该行的最后一个字符  
 &emsp;&emsp;d0&emsp;删除从光标所在处到该行的第一个字符

<font color=#0ff9ff size=4 face="黑体">yy </font>&emsp;复制当前行  
 <font color=red>eg:</font> &emsp;3yy&emsp;复制光标所在的向下3行  
 &emsp;&emsp;y1G&emsp;复制光标所在到第一行的所有数据  
&emsp;&emsp;yG&emsp;复制从光标所在到最后一行的所有数据  
&emsp;&emsp; y`$`&emsp;复制从光标所在处到该行的最后一个字符  
 &emsp;&emsp;y0&emsp;复制从光标所在处到该行的第一个字符


<font color=#0ff9ff size=4 face="黑体">p,P</font>&emsp;粘贴

<font color=#0ff9ff size=4 face="黑体">u</font>&emsp;复原上一个操作，相当于撤销
 
 <font color=#0ff9ff size=4 face="黑体"> [Ctrl] + r</font>&emsp;重做上一个操作
 
------
 
## 命令行模式下
一般模式切换到命令行模式的可用的按钮说明，包括保存、离开等命令。  
<font color=#0ff9ff size=4 face="黑体">:w</font>&emsp;将编辑的数据写入硬件文件中，相当于一般用的保存

<font color=#0ff9ff size=4 face="黑体">:w!</font>&emsp;若文件属性为“只读”时，强制写入该文件

<font color=#0ff9ff size=4 face="黑体">:q</font>&emsp;离开vim

<font color=#0ff9ff size=4 face="黑体">:q!</font>&emsp;若曾修改过文件，又不想存储，使用“!”为强制离开不保存文件

<font color=#0ff9ff size=4 face="黑体">:wq</font>&emsp;保存离开

<font color=#0ff9ff size=4 face="黑体">:w[filename]</font>&emsp;将编辑的数据保存成另一个文件

<font color=#0ff9ff size=4 face="黑体">:set nu</font>&emsp;显示行号

<font color=#0ff9ff size=4 face="黑体">:set nonu</font>&emsp;取消行号
