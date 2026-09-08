---
title: "初识shell"
date: 2018-08-13T16:22:27+08:00
draft: false
tags: ["Linux","shell","bash"]
categories: ["学习记录"]
---
-----
&emsp;&emsp;shell，英文意为“壳”，在计算机领域，意为操作系统的最外面一层，用于人机交互。shell管理用户与操作系统之间的交互。shell提供一个用户操作系统的一个接口。广义的shell包括图形界面的软件。 

本文主要简略介绍一下命令行界面的shell。

Linux中有许多shell，可以通过/etc/shells这个文件来查看自己系统里有多少可用的shell。笔者系统里*ubuntu 18.04*里有如下shell:
> * /bin/sh  &emsp;&emsp;*(已经被/bin/bash所替代)*
> * /bin/bash &emsp;&emsp;*(许多Linux平台内定的shell)*
> * /bin/rbash &emsp;&emsp;*(受限的bash)*
> * /bin/dash &emsp;&emsp;*(当前系统默认的shell)*

&emsp;&emsp;在GNU/Linux操作系统中的/bin/sh本是bash的符号链接，但鉴于bash太过复杂，于是把bash从NetBSD移植到Linux并更名为dash。于是，在现在的Debian和ubuntu中，/bin/sh默认指向dash，dash可以看做是一个简化版的bash，它主要是为了执行脚本而出现的，而不是为了与内核交互，虽然功能相比bash要少很多，但它速度更快。

bash的功能甚为强大，以下主要介绍以下bash这种shell。

## shell的变量功能
### 变量的显示与设置
echo命令能直接显示出变量，方法为“echo `$`{变量名}”，例如，显示系统环境变量PATH:
```bash
vicebery@vicebery-pc:~$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```
<br>
变量设置直接“=”，例如，将fabric的工作目录设置为fabricwork，这样每次可以很快进入到其目录下:
```bash
vicebery@vicebery-pc:~$ echo $GOPATH
/home/vicebery/go
vicebery@vicebery-pc:~$ fabricwork="$GOPATH/src/github.com/hyperledger/fabric"
vicebery@vicebery-pc:~$ echo $fabricwork
/home/vicebery/go/src/github.com/hyperledger/fabric
vicebery@vicebery-pc:~$ cd $fabricwork
vicebery@vicebery-pc:~/go/src/github.com/hyperledger/fabric$ 
```
未设置之前，每次进入该目录要输入一大堆东西，设置后输入可以很方便就进入到该目录下。

取消变量的方法为使用“unset 变量名称”，例如，取消fabricwork的设置后，输出为空：
```bash
vicebery@vicebery-pc:~$ unset fabricwork
vicebery@vicebery-pc:~$ echo $fabricwork

vicebery@vicebery-pc:~$ 
```

### 环境变量的功能
环境变量可以帮我们达到很多功能，包括主文件夹的变换、提示符的显示、执行文件查找的路径等，可以通过env和export这两个命令来查看自己系统里的环境变量。
```bash
vicebery@vicebery-pc:~$ env
LOGNAME=vicebery
PWD=/home/vicebery
HOME=/home/vicebery
TERM=xterm-256color
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
LC_IDENTIFICATION=zh_CN.UTF-8
GTK_IM_MODULE=fcitx
LC_TIME=zh_CN.UTF-8
_=/usr/bin/env
```
上面仅列出部分，其中：  
`HOME`代表用户的主文件夹
`PATH`是执行文件命令查找路径  
`SHELL`是目前这个环境下使用的Shell是哪一个程序  
`_`上例中的最后一行是上一次使用的命令的最后一个参数（或命令本身），本例中即为`env`。

**用set查看所有变量**  
所有变量是指包括环境变量和自定义变量以及一些与bash操作接口有关的变量。里面涉及到的变量相当多，这里不详细描述。

## bash的环境配置文件
### login与non-login shell
从语义上就可看出，二者之间的区别在于有没有登录。  

**login shell**:  取得bash时需要完整的登录流程的，就称为login shell.  
**non-login shell**:  取得bash接口的方法不需要重复登录的举动。

一般来说，**login shell**只会读取两个配置文件：
1. `/etc/profile`:  这个系统整体的设置，不要轻易修改  
2. `~/.bash_profile`或`~/.bash_login`或`~/.profile`:  属于用户个人设置，如果要修改自己的数据，就写入这里。

**/etc/profile**  
每个用户登录取得bash时一定会读取的配置文件。可以帮助所有用户设置整体环境。

**~/.bash_profile**   *(login shell才会读)*  
bash在读完了整体环境设置的/etc/profile并借此调用其他配置文件后，接下来则是会读取用户的个人配置文件。在login shell的bash环境中，所读取的个人偏好配置文件其实主要有三个，按照读取优先级依次是：
1. ~/.bash_profile
2. ~/.bash_login
3. ~/.profile

实际上bash的login shell设置只会读取上面三个文件的其中一个，而读取的顺序则是依照上面的优先级顺序。

**source**:  读入环境配置文件的命令  
前面说过/etc/profile与~/.bash_profile都是在取得login shell的时候才会读取的配置文件，那修改后如何让其不用注销再登录就生效呢？用source命令可以实现修改配置文件后立即生效。

假设你已经修改了`/etc/profile`这个配置文件，想让其立即生效，输入以下命令即可：
```bash
source /etc/profile
```

**~/.bashrc**  *(non-login shell 会读)*  
在非登录情况下取得bash操作接口的环境配置文件是`~/.bashrc`。
