---
title: "fabric环境搭建以及实例运行"
date: 2018-08-03T21:49:07+08:00
draft: false
tags: ["ubuntu","fabric"]
categories: ["学习记录"]
---
## 前言
以下操作是在`ubuntu 18.04`上进行，网络使用SS代理，如不使用网络代理，操作过程中可能会出现各种问题。

## 先行步骤
具体请查看[官方文档介绍](http://hyperledger-fabric.readthedocs.io/en/release-1.0/prereqs.html)，这里主要介绍两点：
### 安装go以及环境变量配置
建议直接命令安装 :  
`sudo apt-get install golang`

安装好后设置环境变量，在主目录下新建一个文件夹“go”，作为你的工作空间。

打开终端，编辑记录环境变量的文件：  
`sudo vim /etc/profile`  
在文件最后添加：  
`export GOPATH=$HOME/go`  
`export PATH=$PATH:$GOPATH/bin`

在系统下用命令安装不需要添加`GOROOT`，因为默认安装位置是`/usr/lib`，此路径已经被写入环境变量了。

官方文档写的是编辑~/.bashrc这个文件，关于这个问题，网上也有很多版本，这篇[博客](https://www.cnblogs.com/love-snow/articles/7755660.html)有相关介绍。

安装好后，检验一下：  
`sudo go env`  
若显示go的相关环境，则证明安装成功。

### docker以及docker-compose的安装

命令直接安装一般不会成功，这里参考[清华大学镜像源安装](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/)。

按照以上网址的教程，依然出现问题：
在导入信任docker的GPG公钥时，由于国内网络问题，docker官网不能正常访问，出现错误：
`curl: (7) Failed to receive SOCKS4 connect request ack.`  
`gpg: 找不到有效的 OpenPGP 数据。`  

于是在终端下设置临时代理：  
`export https_proxy=socks5://127.0.0.1:1080`  

显示`ok`，即导入成功。

## fabric部署

### 创建工作目录
在你的`go`的工作空间中创建文件夹  
`mkdir -p ~/go/src/github.com/hyperledger/`
### 下载fabric源码
进入到刚刚创建的`hyperledger`文件夹，`git clone`源码 :   
`cd ~/go/src/github.com/hyperledger`  
`git clone https://github.com/hyperledger/fabric.git`  

如果`git clone`很慢，可以设置`git`的网络代理：  
`git config --global http.proxy 'socks5://127.0.0.1:1080'`  
`git config --global https.proxy 'socks5://127.0.0.1:1080'`
### 下载镜像文件
上一步会在`hyperledger`文件夹下创建一个新文件夹`fabric`，找到`fabric`文件夹里的`scripts`文件夹里的`bootstrap.sh`脚本，这个脚本就是下载相关镜像的，运行这个脚本：  
`./bootstrap.sh`  

如果由于网络问题下载不成功，建议先在终端设置代理：  
`export http_proxy="socks5://127.0.0.1:1080"`  
`export https_proxy="socks5://127.0.0.1:1080"`

由于镜像文件有点多，可能需要花费一些时间。下载完成后会罗列出下载的docker镜像，有好几个竟然显示几个G，很疑惑这些文件在哪儿？去脚本文件查阅也没找出来

在`scripts`文件夹下有个`fabric-samples`文件夹，在上一步完成后会出现一个`bin`文件夹，将这个文件夹复制到`fabric/examples`下

### 运行实例
接下来运行实例：`e2e_cli`，在该文件夹下打开终端：  
`./network_setup.sh up`  

会输出一大堆东西，最后看到字符打印出“`END-E2E`”。

关闭实例，按`Ctrl+c`重回终端输入：  
`./network_setup.sh down`