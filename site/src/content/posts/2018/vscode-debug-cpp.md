---
title: "vscode配置调试cpp程序"
date: 2018-09-24T16:36:08+08:00
draft: false
tags: ["vscode"]
categories: ["学习记录"]
keywords: ["vscode"]  
description: "关于如何用vscode调试cpp程序"  
author: "vicebery"
---

-----
# 前言
笔者的系统是ubuntu 18.04，为了在Leetcode上更好地刷题，于是想搭建一个IDE提高工作效率，在ubuntu上命令行调试不人性化，于是想找一个有图形界面的调试工具，最开始想到的是codeblocks，但是其界面不美观，而且对其他语言的支持也不太友好，于是就想到vs code。

# 下载安装
[官网下载链接](https://code.visualstudio.com/)  

安装过程省略……

安装好后添加扩展工具  

![vscode-expend](/img/vscode-extend.jpg) 

# 相关配置
我们需要链接到系统的内置调试工具GDB，其实上一步中添加的拓展工具已经帮我们做好了这件事，但其仍然有不够完善的地方，还需要简单配置一下才能实现调试功能。  

## 工作空间
首先我们需要设定一个工作空间，用于存放我们的CPP文件(*路径中最好不要有中文*)，

在你打开任意一个CPP文件后，尝试编译运行它时，vscode会产生四个json文件，相关配置都在这四个json文件中实现，如下图：  
![vscode-json](/img/vscode-2.jpg)  

笔者创建了一个文件夹名为CPP，作为工作空间，在其下默认生成了一个名为.vscode的文件夹（在Windows平台下你可能看不到它，因为它默认是隐藏文件），在这个文件夹（/CPP/.vscode/，CPP文件夹前面的路径在此处省略）下面有四个json文件，分别是c_cpp_properties.json、launch.json、settings.json、tasks.json。

你必须把你要调试的文件放置在你的工作空间根目录（笔者为/CPP/）下，有上图你也可看到，笔者的cpp文件的放置位置。

## json文件配置信息
事实上我们只需要关注其中是三个文件。  

### 修改launch.json
```
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/a.out",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": true,
            "MIMode": "gdb",
            "preLaunchTask": "Compile",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
            
        }
    ]
}
```
我们注意到‘program’参数，它指向要调试的文件，原因是每次.cpp文件编译后都会默认生成一个a.out文件。  

### 修改tasks.json文件
```
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Compile",
            "type": "shell",
            "command": "gcc",
            "args": [
                "-g","${file}","-o","${workspaceRoot}/a.out"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```
像‘command’的参数为gcc，我们知道在用gdb调试时正是用到这条命令，‘args’参数规定入口信息，所调试的文件正是"`$`{workspaceRoot}/a.out"，"`$`{file}"表示当前文件，即你的当前主窗口显示的文件，这也是为什么我们每次调试时需要打开那个需调试的文件，并编译运行它，使其生成a.out文件（所以当调试不同的cpp文件时，需及时更新a.out文件），如此才能使配置文件正确输入文件信息。  

这个文件很容易理解，它主要将gdb中的一些调试指令写入到一个操作集合，简化我们在调试时的工作，将原本命令行实现的东西集成到可视化界面上。

### 修改c_cpp_properties.json文件
```json
{
    "configurations": [
        {
            "name": "Linux",
            "intelliSenseMode": "clang-x64",
            "compilerPath": "/usr/bin/gcc",
            "includePath": [
                "/usr/include/x86_64-linux-gnu/c++/7.3.0",
                "/usr/include/c++/7.3.0",
                "/usr/local/include",
                "usr/include/x86_64-linux-gnu",
                "/usr/include",
                "${workspaceFolder}"
            ],
            "defines": [],
            "browse": {
                "path": [
                    "/usr/include/x86_64-linux-gnu/c++/7.3.0",
                    "/usr/include/c++/7.3.0",
                    "/usr/local/include",
                    "usr/include/x86_64-linux-gnu",
                    "/usr/include",
                    "${workspaceFolder}"
                ],
                "limitSymbolsToIncludedHeaders": true,
                "databaseFilename": ""
            }
        }
    ],
    "version": 4
}
```
这个文件主要定位我们系统环境中的命令位置，不同的系统位置信息不同。

# 实例运行调试
笔者创建了一个简单的cpp文件来演示调试过程。
```cpp
#include<stdio.h>
#include<math.h>

int main()
{
	int a=0;
	for(int i=0;i<4;i++) 
	{
		a=a+i;
	}
	printf("%d\n",a);
	return 0;
}
```
先Run Code，然后依次点击调试->启动调试，调试界面如下：  
![debug](/img/vscode-debug.jpg)

左边“变量栏”显示所有变量的实时变化，“监视”栏可以添加要监视表达式，当然还可以设置各种断点。具体过程不详叙，需各位自行实验。

