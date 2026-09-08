---
title: "GitLab简介"
date: 2019-05-09T09:28:42+08:00
draft: false
tags: ["git","gitlab"]
categories: ["学习记录"]
keywords: ["git","gitlab"]  
author: "vicebery"
---
-----
## GitLab是什么
GitLab是一个基于Git的项目管理软件。

GitHub是一个网站平台，提供网页版和客户端版接口，提供给用户空间存储git仓储，保存用户的一些数据文档或者代码等数据

Git是一个开源的分布式版本控制系统，用于处理项目中的版本迭代问题，GitLab和GitHub都是基于Git系统实现的。

## 与GitHub的区别
GitLab是用来进行项目管理的软件，而Github同样可以实现版本控制，为什么不用更受欢迎的GitHub呢？或者说GitLab的适用场景与GitHub有什么区别呢？

二者在操作上基本相同，功能与底层实现上也差不多，但，如果你用GitHub，即便使用私有库，你的代码（存储在GitHub的服务器中）仍然掌握在别人手中（运营GitHub公司，目前是微软），对于一些对私密性要求较高的企业，这是无法忍受的。而GitLab则不同，GitLab是可以部署到自己的服务器上，数据库等一切信息都掌握在自己手上，适合团队内部协作开发，简单来说可把GitLab看作个人版的GitHub。

另外，GitLab的权限管理优于GitHub，GitLab的仓库有三种

- Private: 私人仓库，项目只有自己能看到，其他人都不能看到，包括系统管理员。
- Internal: 项目只有登录账户可看。
- Public: 项目即使是游客都能看到。

而GitHub的仓库只有公有库和私有库两种，GitHub协作者的操作权限都是一样的，而GitLab提供更细粒度的划分，仓库所有者可以给不同的开发者设置不同的权限(4种不同的角色)，共有5种角色。

- Guest
- Reporter
- Developer
- Maintainer
- Owner

不同角色权限可在[官方文档上查到](https://docs.gitlab.com/ee/user/permissions.html#fn:1)


## 在服务器上搭建GitLab
在centos上安装的[教程](https://www.cnblogs.com/wenwei-blog/p/5861450.html)，暂不作深入探讨。

