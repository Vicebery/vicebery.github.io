---
title: "FTP服务器搭建"
date: 2018-08-16T21:57:39+08:00
draft: false
tags: ["FTP","centOS","vsftpd"]
categories: ["学习记录"]
---
-----
## 前言
系统为cent OS，使用vsftpd搭建sftp。sftp为ftp的一个升级版，较之更为安全。在华为弹性云服务器上测试成功。

**测试时的设置**：  
用户根目录/home/ftp，其下有两个文件夹/pub、/upload，为普通用户可见目录。  
管理员为ftpuser,普通用户为ftpuser0、ftpuser1……其中密码都与用户名一样。
## 目标
一部分用户(管理员)可以新建文件夹、上传文件、删除文件夹、删除文件，一部分用户(普通用户)只能查看和下载  

root为/home/ftp文件夹所有者，其权限值为755，ftp文件夹下所有目录为ftpuser所有，权限值为755，故ftpuser为管理员，可以上传文件、新建文件夹、删除文件夹或文件

ftpuser0与ftpuser同属于一个组ftpGroup，ftpuser0权限为5，ftpuser0不能上传文件或创建文件夹，只能下载文件，且不能看见或进入其他任何非自己主目录的目录。其他与ftpuser在同一个用户组的用户都和ftpuser0具有一样的特性。

## centOS下搭建FTP服务
Linux下ftp服务可以通过搭建vsftpd服务来实现，我们以在centOS下为例。

### 安装vsftpd
```shell
yum -y install vsftpd
```
### 设置用户组
创建FTP用户组
```shell
groupadd ftpGroup
```
创建新用户ftpuser，将其加入到FTP用户组
```shell
useradd -G ftpGroup ftpuser
```
设置用户密码
```shell
# 输入两次密码，出现的提示信息不用管
passwd ftpuser
```
安全设置，限制用户只能通过ftp访问
```shell
usermod -s /sbin/nologin ftpuser
```
设置过程中可以用以下命令进行检查：
```shell
#查看当前目录下所有文件夹以及文件的权限、所属用户、所属用户组、大小
ls -lh
```

### 目录权限设置

修改文件目录用户，ftp根目录以上的目录都必须为root所有，权限值设为755
```shell
chown root /home/ftp
chmod 755 /home/ftp
```
更改用户的根目录，用户的根目录之上的所有目录都必须为root所有
```shell
usermod -d /home/ftp ftpuser
```
此已经设置为ftp根目录，设为ftp管理员所有，管理员负责上传文件、新建文件夹、删除文件或文件夹等操作，非管理用户登录后只能看见/home/ftp下的/pub、/upload等文件夹或文件
```shell
chown -R ftpuser:ftpGroup /home/ftp/pub
chown -R ftpuser:ftpGroup /home/ftp/upload
```
修改文件夹权限,用户权限为7，用户组权限为5，其他为5
```shell
chmod -R 755 /home/ftp/pub
chmod -R 755 /home/ftp/upload
```
添加新用户：
```shell
useradd -G ftpGroup -s /sbin/nologin ftpuser1
passwd ftpuser1
#注意：无论是管理用户还是非管理用户，其上一层  
#一直到系统根目录都必须为root用户所有，否
#则无法正常连接
usermod -d /home/ftp ftpuser1
service vsftpd restart
```
其他用法：
```shell
#修改用户组默认根目录,-R使文件夹下的所有子目录都生效
chgrp -R ftpGroup /home/ftp/
```
### 编辑/etc/ssh/sshd_config
编辑sshd_config
```shell
vi /etc/ssh/sshd_config
```
输入/Subsystem搜索到下列内容，注释掉原有的
```shell
# Subsystem sftp /usr/libexec/openssh/sftp-server
```
改为internal-sftp
```shell
Subsystem  sftp  internal-sftp
```
匹配用户组，如果要匹配多个组，多个组之间用逗号分割
```shell
Match Group ftpGroup
```
指定登陆用户到自己的用户目录
```shell
ChrootDirectory %h
```
指定 sftp 命令
```shell
ForceCommand internal-sftp
```
这两行，如果不希望该用户能使用端口转发的话就加上，否则删掉
```shell
X11Forwarding no
AllowTcpForwarding no
```
### 配置文件
```shell
#vsftpd.conf
chroot_local_user=YES
chroot_list_enable=YES
chroot_list_file=/etc/vsftpd/chroot_list
```
如果希望个别用户可以访问用户根目录以外的目录，可以将用户名加入到chroot_list，一个用户名占一行：
```shell
vim /etc/vsftpd/chroot_list
```

### 服务启动
每次修改了配置文件后都要重启服务：
```shell
service vsftpd restart
```

### 测试访问

终端访问：
```shell
sftp ftpuser@114.116.83.240
输入密码
```

