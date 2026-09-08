---
title: "Linux命令边学边记"
date: 2020-06-04T11:50:14+08:00
draft: false
tags: ["linux","shell"]
categories: ["学习记录"]
keywords: ["linux"]  
description: "简单的Linux命令记录"  
author: "vicebery"
---
-----
记录一些日常使用的Linux命令

## 查看文件
- `head`: 只看头几行
- `tail`: 只看末尾几行
- `less`: 一页一页显示，并可以向前翻页
- `more`: 一页一页显示
- `nl` :  带行号显示文本
- `cat`: 从第一行开始显示
- `vim`: 查看并编辑文件

---
一般查看日志会用到
```shell
tail -n 100 -f logfileName.log
```
从日志末尾查看，`-n`表示查看的行数，`-f`表示监视文件增长，在这里即表示监控日志的实时变化，显示末尾100行。

---
## 查看信息
- `top` 命令可以查看当前任务以及cpu、内存的使用情况，不断刷新
- `ps` 查看当前进程，不能实时刷新
- `env` 查看当前环境变量

三种方法查看占用某端口的进程
```shell
lsof -i:1080
netstat -anp|grep 1080
ps -an | grep 1080
# 杀死进程{PID}
kill -9 {PID}
```
---
## 文件处理
### cp  
cp命令用于文件/目录拷贝

现有需求如下：`/data`目录下有a,b,c,d四个目录，现在要把`data`目录下除过c目录之外的所有目录复制到`/tmp`目录中

解决方法：
```shell
cp -R `find /data -maxdepth 1 -path /data/c -prune -o -print | sed 1d ` /tmp
# 上述方法需要确保 /tmp 已经存在

cd /data
rsync -av --exclude c/ . /tmp
# 这种方法速度更快，且不需保证/tmp已经存在，若不存在会自动创建
```

## 查找信息
`locate`: 搜寻档案系统内是否有指定的档案
```shell
# 查找和pwd相关的所有文件
locate pwd

# 搜索etc目录下所有以sh开头的文件
locate /etc/sh
```
---
`find`:  在指定目录下查找文件
```shell
# 将目前目录及其子目录下所有延伸档名是 md 的文件列出来。
find . -name "*.md"
```
[更多关于find命令的信息](https://www.runoob.com/linux/linux-comm-find.html)

----
`grep`: 用于查找文件里符合条件的字符串

[more info about grep](https://www.runoob.com/linux/linux-comm-grep.html)

----
## sed

sed命令主要用来处理文本

语法：  
```shell
sed [-hnV][-e<script>][-f<script文件>][文本文件]
```
动作说明：  
- a ：新增， a 的后面可以接字串，而这些字串会在新的一行出现(目前的下一行)～
- c ：取代， c 的后面可以接字串，这些字串可以取代 n1,n2 之间的行！
- d ：删除，因为是删除啊，所以 d 后面通常不接任何咚咚；
- i ：插入， i 的后面可以接字串，而这些字串会在新的一行出现(目前的上一行)；
- p ：打印，亦即将某个选择的数据印出。通常 p 会与参数 sed -n 一起运行～
- s ：取代，可以直接进行取代的工作哩！通常这个 s 的动作可以搭配正规表示法！例如 1,20s/old/new/g 就是啦！

示例
```shell
nl /proc/cpuinfo | sed 2d
# 列出cpuinfo行号和信息，并删除第二行

nl /proc/cpuinfo | sed 2,5d
# 列出cpuinfo行号和信息，并删除二至五行
```

[更多关于sed命令的信息](https://www.runoob.com/linux/linux-comm-sed.html)
## awk
`awk`命令的用法非常多，这里只结合实际场景简要介绍几种用法。

根据匹配搜索的结果，批量删除镜像
```shell
docker rmi $(docker images | grep "none" | awk '{print $3}')
```
删除所有名字中带 “none” 关键字的镜像，`awk '{print $3}'`指定第三项信息（IMAGE ID）

[更多关于awk命令的信息](http://www.ruanyifeng.com/blog/2018/11/awk.html)

