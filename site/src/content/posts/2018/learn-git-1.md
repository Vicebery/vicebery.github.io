---
title: "初识git"
date: 2018-10-24T22:07:23+08:00
draft: false
tags: ["git"]
categories: ["学习记录"]
keywords: ["git"]  
description: "初识git"  
author: "vicebery"
---
-----
本文介绍在Linux下使用git的常用命令。

## 安装git
```shell
sudo apt-get install git
```
## 使用前的配置
Git提供一个叫做`git config`的工具，专门来配置或读取相应的工作环境变量。这些变量可以存放在以下三个不同的地方：
- [x] `/etc/gitconfig` 文件：系统中对所有用户都普遍适用的配置。若使用 `git config` 时用 `--system` 选项，读写的就是这个文件。
- [x] `~/.gitconfig` 文件：用户目录下的配置文件只适用于该用户。若使用 `git config` 时用 `--global` 选项，读写的就是这个文件。
- [x] 当前项目的 Git 目录中的配置文件（也就是工作目录中的 `.git/config` 文件）：这里的配置仅仅针对当前项目有效。每一个级别的配置都会覆盖上层的相同配置，所以 `.git/config` 里的配置会覆盖 `/etc/gitconfig` 中的同名变量。

### 用户信息
配置个人的用户名称和电子邮件地址，每次Git提交时都会引用这两条信息，以说明是谁提交了更新。

```shell
$ git config --global user.name "your name"
$ git config --global user.email yourEmailName@gmail.com
```
配置文件位置选项：
- [x] `--global` 使用全局配置文件
- [x] `--system` 使用系统级配置文件
- [x] `--local` 使用仓库级配置文件

### 网络代理
`git`有时会出现网络错误，需要配置网络代理。

如果你已经开启了SS代理，那么可以进行如下配置就可以让终端下git也走SS代理。
```shell
# 设置代理
$ git config --global http.proxy 'socks5://127.0.0.1:1080'
$ git config --global https.proxy 'socks5://127.0.0.1:1080'
# 删除代理设置
$ git config --global --unset http.proxy
$ git config --global --unset https.proxy
```

如果本地还没开启SS代理，那么进行如下设置：
``` shell
# 如果需要用户名密码的话：
git config --global http.proxy http://user:password@socks5://127.0.0.1:8080 
```
### 查看配置信息
检查已有的配置信息，可用`git config --list`命令：
```shell
$ git config --list
http.proxy=socks5://127.0.0.1:1080
https.proxy=socks5://127.0.0.1:1080
user.name=vicebery
user.email=vicebery@163.com
```

## git基础
### 取得项目的 Git 仓库
有两种取得 Git 项目仓库的方法。第一种是在现存的目录下，通过导入所有文件来创建新的 Git 仓库。第二种是从已有的 Git 仓库克隆出一个新的镜像仓库来。

#### 在工作目录中初始化新仓库  
对本地的某个项目使用Git管理，只需到此项目所在的目录，执行：
```shell
$ git init
```
初始化后，在当前目录下会出现一个.git的目录（默认隐藏），
所有 Git 需要的数据和资源都存放在这个目录中。

#### 从现有仓库克隆
如果想对某个开源项目出一份力，可以先把该项目的 Git 仓库复制一份出来，这就需要用到 `git clone` 命令。

Git 收取的是项目历史的所有数据（每一个文件的每一个版本），服务器上有的数据克隆之后本地也都有了。

克隆仓库的命令格式为 `git clone [url]`

### 记录每次更新到仓库
工作目录下面的所有文件都不外乎这两种状态：已跟踪或未跟踪。

已跟踪的文件一段时间后可能有三种状态：unmodified、modified、staged，未跟踪的文件状态为：untracked


#### 检查当前文件状态
用`git status`命令来查看哪些文件当前的状态。

在一个本地仓库目录下，执行该命令：
```shell
$ git status
位于分支 master

尚无提交

未跟踪的文件:
  （使用 "git add <文件>..." 以包含要提交的内容）

	hadoop-cluster-docker/

提交为空，但是存在尚未跟踪的文件（使用 "git add" 建立跟踪）
```
#### 跟踪新文件
当项目添加了一个新文件时，用`git add`来开始跟踪它。
```shell
$ git add newFileName
```
#### 暂存已修改文件
文件修改后，运行`git status`会显示出 `Changes not staged for commit`项，暂存此次修改也是用`git add`命令。

#### 移除文件
要从 Git 中移除某个文件，就必须要从已跟踪文件清单中移除，如果只是简单地从工作目录中手工删除文件，运行 `git status` 时就会在 `Changes not staged for commit`部分（也就是未暂存清单）看到。用`git rm`命令来移除文件。

#### 忽略某些文件
一般我们总会有些文件无需纳入 Git 的管理，也不希望它们总出现在未跟踪文件列表。我们可以创建一个名为 .gitignore 的文件，列出要忽略的文件模式。

文件 .gitignore 的格式规范如下：  
- [x] 所有空行或者以注释符号 ＃ 开头的行都会被 Git 忽略。
- [x] 可以使用标准的 glob 模式匹配。
- [x] 匹配模式最后跟反斜杠（/）说明要忽略的是目录。
- [x] 要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反。

我们再看一个 .gitignore 文件的例子：
```shell
# 此为注释 – 将被 Git 忽略
# 忽略所有 .a 结尾的文件
*.a
# 但 lib.a 除外
!lib.a
# 仅仅忽略项目根目录下的 TODO 文件，不包括 subdir/TODO
/TODO
# 忽略 build/ 目录下的所有文件
build/
# 会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
doc/*.txt
# 忽略 doc/ 目录下所有扩展名为 txt 的文件
doc/**/*.txt
```
#### 查看已暂存和未暂存的更新
如果要查看文件具体修改了什么地方，可以用 git diff 命令。

此命令比较的是工作目录中当前文件和暂存区域快照之间的差异，也就是修改之后还没有暂存起来的变化内容。

### 提交更新
确认暂存区域已准备好可以提交了，运行提交命令`git commit`：
```shell
$ git commit
```


