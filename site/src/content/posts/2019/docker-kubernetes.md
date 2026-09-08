---
title: "云计算基础知识整理"
date: 2019-01-15T22:22:38+08:00
draft: false
tags: ["Docker","Kubernetes","k8s"]
categories: ["学习记录"]
keywords: ["Docker","Kubernetes","k8s"]  
description: "Docker、Kubernetes相关知识整理"  
author: "vicebery"
---
-----
## 云计算原理和PaaS原理
**云计算的基本原理是**，通过使计算分布在大量的分布式计算机上，而非本地计算机或远程服务器中，企业数据中心的运行将更与互联网相似。这使得企业能够将资源切换到需要的应用上，根据需求访问计算机和存储系统。

云计算是一种资源的服务模式，该模式可以实现随时随地，便捷按需地从可配置计算资源共享池中获取所需的资源，资源能够快速供应并释放，大大减少了资源管理工作开销，你甚至可以再也不用理会那些令人头痛的传统服务供应商了。

经典云计算架构包括三层服务：
- IaaS，基础设施即服务，为基础设施运维人员服务，提供计算、存储、网络及其他基础资源，云平台使用者可以在上面部署和运行包括操作系统和应用程序在内的任意软件，无需再为基础设施的管理而分心。
- **PaaS**，平台即服务，为应用开发人员服务，提供支撑应用运行所需的软件运行时环境、相关工具与服务，如数据库服务、日志服务、监控服务等，让应用开发者可以专注于核心业务的开发。
- SaaS，软件即服务，为一般用户服务，提供了一套完整可用的软件系统，让一般用户无需关注技术细节，只需通过浏览器、应用客户端等方式就能使用部署在云上的应用服务。

## Docker基本原理
### 概念
Docker是以Docker容器为资源分割和调度的基本单位，封装整个软件运行时环境，为开发者和系统管理员设计的，用于构建、发布和运行分布式应用的平台。它是一个跨平台、可移植并且简单易用的容器解决方案。

Docker属于Linux容器的一种封装，提供简单易用的容器使用接口。
### 带来的优势
- [x] 持续部署与测试
- [x] 跨平台支持
- [x] 环境标准化和版本控制
- [x] 高资源利用率与隔离
- [x] 容器跨平台性与镜像
- [x] 易于理解且易用
- [x] 应用镜像仓库

### Docker与虚拟机
- 更低的资源损耗
- 更快的启动速度
- 更好的应用耦合
- 更强的弹性伸缩


1. 不需要硬件虚拟化，效率高
2. 使用主机kernal，不需要重新加载os启动快

（1）docker比虚拟机更少的抽象层。docker不需要实现硬件资源虚拟化，运行在docker容器上的程序直接使用的都是物理机的硬件资源。CPU、内存利用率上docker将会在效率上有优势。在IO设备虚拟化上，docker的镜像管理有多种方案  
（2）docker利用的是宿主机的内核，不需要重新加载OS内核。引导、加载内核费时费资源，当新建一个虚拟机时，虚拟机软件需要加载GuestOS，这个新建过程是分钟级别的。而docker由于直接利用宿主机的操作系统，则省略了这个过程，因此新建一个docker容器只需要几秒钟。docker对比虚拟机在资源消耗上也占有比较大的优势。


| 特性 | 虚拟机 | 容器 |
| ---- | ------ | ----- |
| 操作系统支持 | 广泛 | Linux为主 |
| 隔离策略 | Hypervisor | Linux内核自带隔离技术 |
| 隔离度 | 完全隔离 | 操作系统隔离  |
| 启动时间 | 分钟级 | 毫秒级 |
| 移植性 | 笨重，与虚拟化技术耦合度高 | 轻便、灵活，适用于Linux |
| 弹性伸缩 | 依赖手工 | 自动化调度 |

### Docker的三个基本元素
Docker Container负责应用程序的运行，包括操作系统、用户添加的文件以及元数据

Docker Images 是一个只读模板，用来运行Docker容器

DockerFile是文件指令集，用来说明如何自动创建Docker镜像

Docker的三个基本元素，解决了PaaS平台最根本的两个问题，一是封装，二是标准

### Docker架构
Docker使用C/S客户机-服务器体系结构，Docker客户端与Docker daemon（守护进程）通信，Docker daemon负责构建、运行和分发Docker容器。Docker客户端和守护进程使用REST API通过UNIX套接字或网络接口进行通信。

### 主要模块
#### Docker client
Docker客户端，遵循Docker API，向Docker daemon发起请求的客户端，种类丰富

#### Docker daemon
守护进程，最核心后台进程，负责响应来自Docker client的请求，然后翻译成系统调用完成容器管理操作。后台启动API Server，负责接收请求，分发调度给相关函数执行。

- execdriver，对Linux操作系统的namespace、cgroups、apparmor、SELinux等的二次封装，类似LXC，默认实现是Docker官方的libcontainer
- volumedrive是volume数据卷存储操作的最终执行者，负责volume增删操作，屏蔽不同实现的差异，为上层提供统一接口。默认实现为local，其他通过外部插件实现
- graphdriver是所有容器镜像相关操作的最终执行者，维护与镜像层对应的目录，以及镜像层间的关系和相关元数据

#### graph
graph组件负责维护已下载的镜像信息及它们之间的关系，所以大部分Docker镜像相关的操作都会由graph组件来完成。

#### GraphDB
Docker daemon通过GraphDB记录它所维护的所有容器以及它们之间的link关系（边）

#### driver
容器管理驱动execdriver、网络管理驱动networkdriver、文件存储驱动graphdriver

### namespace资源隔离
namespace的6种隔离：  

| namespace | parameter | isolation |
| -------- | -------- | -------- |
| UTS | CLONE_NEWUTS | host&domain |
| IPC | CLONE_NEWIPC | Message queue&shared memory |
| PID | CLONE_NEWPID | Process id |
| Network | CLONE_NEWNET | Network |
| Mount | CLONE_NEWNS | FS |
| User | CLONE_NEWUSER | USER |

namespace的目标是实现轻量级虚拟化服务

**API操作方式**：clone（）、setns（）、unshare（）及/proc的部分文件，通过参数指定要操作的namespace类型

**调用方式：**  
int clone（）；创建新的独立namespace的进程  
int setns（int fd，int nstype）；将进程加入到已经存在的namespace  
int unshare（int flags）；在原有进程基础上进行隔离，Docker未采用

#### UTS namespace  
提供了主机名和域名的隔离，这样每个Docker容器就可以拥有独立的主机名和域名了，在网络上可以被视作一个独立的节点，而非宿主机上的一个进程。 Docker中，每个镜像基本都以自身所提供的服务名称来命名镜像的hostname，且不会对宿主机产生任何影响，其原理就是利用了UTS namespace

#### IPC namespace 
进程间通信IPC涉及的IPC资源包括常见的信号量、消息队列和共享内存。在同一个IPC namespace下的进程彼此可见。

Docker主要适用IPC namespace实现容器与宿主机、容器与容器之间的IPC隔离

#### PID namespace
init进程负责收养“孤儿”进程并最终回收资源

内核为init进程赋予特权--信号屏蔽，同一个PID namespace发给init进程的信号会被屏蔽，避免init被误杀

父节点的SIGKILL或SIGSTOP信号，子节点init会强制执行，实现父节点终止子节点进程

#### mount namespace
通过隔离文件系统挂载点实现对文件系统的隔离，标识位CLONE_NEWNS。

挂载对象在各挂载事件间的传播：  
- 共享方法，双向传播
- 从属关系，单向传播

可能的挂载状态：  
- [x] 共享挂载，传播事件的挂载对象
- [x] 从属挂载，接受传播事件的挂载对象
- [x] 私有挂载，既不传播也不接受传播事件的挂载对象
- [x] 不可绑定挂载

#### network namespace
实现网络资源隔离，包括网络设备、IPv4/IPv6协议栈、IP路由表、防火墙、/proc/net目录、/sys/class/net目录、套接字等

一个网络设备最多存在一个network namespace中，通过veth pair创建通道

#### user namespace
主要隔离安全相关的标识符和属性，包括用户ID、用户组ID、root目录、key及特殊权限

user namespace创建后，第一个进程被赋予全部权限，以完成必要的初始化工作

### cgroups资源限制
#### cgroups定义
cgroups是Linux内核提供的一种机制，这种机制可以根据需求把一系列系统任务及其子任务整合（或分隔）到按资源划分等级的不同组内，从而为系统资源管理提供一个统一的框架。

通俗来说，cgroups可以限制、记录任务组所使用的物理资源（包括CPU、memory、IO等），为容器实现虚拟化提供了基本保证，是构建Docker等一系列虚拟化管理工具的基石。

#### 主要作用：  
- 资源限制： 限制任务使用的资源总额
- 优先级分配：通过CPU时间片与磁盘
IO大小，控制任务执行优先级
- 资源统计：统计资源使用量
- 任务控制：对任务执行挂起、恢复等操作

cgroups不仅可以限制被namespace隔离起来的资源，还可以为资源设置权重、计算使用量、操控任务（进程或线程）启停等。

#### cgroups术语表

- task：任务，表示系统的一个进程或线程
- cgroup：控制组，以cgroup为单位，按某种资源控制标准划分而成的任务组，包括一个或多个子系统
- subsystem：子系统，是一个资源调度控制器，比如CPU子系统限制CPU时间分配，内存子系统限制cgroup内存使用量
- hierarchy：层级，cgroup以树状结构排列，每个层级绑定对应子系统进行资源控制。

#### cgroups组织结构与基本原则

- 规则1：同一个层级可以附加一个或多个子系统
- 规则2：一个系统可以附加到多个层级，当且仅当目标层级只有唯一一个子系统时。
- 规则3：新建一个层级时，默认加入这个新建层级的初始化cgroup。任务只能存在于同一个层级的一个cgroup，但可以存在不同层级的多个cgroup
- 规则4：fork/clone自身时创建的子任务默认与原任务在同一个cgroup，但子任务允许被移动到不同的cgroup中。

#### cgroup子系统
cgroups的资源控制系统，每种子系统控制一种资源，Docker包含9个子系统：
- blkio：块设备输入/输出限制
- cpu：调度cpu的使用
- cpuacct：自动生成cgroup中任务对CPU资源使用情况的报告
- cpuset：可以为cgroup中的任务分配独立的CPU和内存
- devices：可以开启或关闭cgroup中任务对设备的访问
- freezer：可以挂起或恢复cgroup中的任务
- memory：可以设定cgroup中任务对内存使用量的限定，并自动生成这些任务对内存资源使用情况的报告
- perf_event：使cgroup中的任务进行统一的性能测试
- net_cls：Docker未直接使用，允许从Linux流量控制程序中识别具体cgroup中生成的数据包

#### cgroup工作原理
- cgroup本质是给任务挂上钩子hook，当任务运行时涉及某种资源时，会触发钩子所带的子系统进行检测
- 任务超过资源上限之后，新申请资源如内存，会被拒绝甚至将任务挂起
- cgroup通过中间结构task_struct与任务关联



### Docker核心原理
Docker容器本质上是宿主机上的进程。  
Docker通过namespace实现了资源隔离，通过cgroups实现了资源限制，通过写时复制机制（copy-on-write）实现了高效的文件操作。

### Docker镜像
主要特点：

- layer分层
- copy-on-write写时复制，容器启动时，在镜像层上挂载一个可读写层，文件系统变化，将其写入到可读写层
- 内容寻址content-addressable storage，根据文件内容来索引镜像与镜像层，提高了安全性
- 联合挂载Union mount，Union filesystem

### Docker数据管理
使用数据卷和数据卷容器在Docker内部以及容器之间管理数据。

实现多个镜像共享同一组数据，可以把数据存储到docker卷并挂载到相应容器

挂载一个主机目录作为数据卷

### Docker网络
docker网络库：libnetwork 使用CNM标准（container network model）。CNM定义了构建容器虚拟网络的模型，同时提供了可以用于多种网络驱动的标准化接口和组件。

sandbox：一个sandbox包含网络栈的信息。sandbox可以对容器的接口，路由和DNS设置等进行管理，一个sandbox可以有多个endpoint和network

endpoint：一个网络可以加入一个sandbox和一个network。

bridge：Docker默认的容器网络驱动。

### Docker常用命令
- docker info：打印docker相关信息
- docker build：构建一个镜像从Dockerfile
- docker tag： 标记本地镜像，将其归入某一仓库
- docker pull/push：拉取镜像/上传镜像
- docker run：
- docker save/load：将指定镜像保存成tar归档文件/从tar归档文件读取镜像
- docker commit：从容器创建一个新的镜像
- docker images：列出所有镜像
- docker image ls -f dangling=true：列出所有的虚悬镜像
- docker ps：列出所有的容器
- docker rmi/rm：删除镜像/容器
- docker inspect：获取容器/镜像的元数据
- docker logs：获取容器的日志
- docker exec：在运行的容器中执行命令
- docker cp：用于容器与主机之间的数据拷贝

### Dockerfile
- Dockerfile FROM
- Dockerfile LABEL
- Dockerfile ENV
- Dockerfile RUN
- Dockerfile COPY and ADD

## Kubernetes
Kubernetes是Google开源的容器集群管理系统，其提供应用部署、维护、扩展机制等功能，利用Kubernetes能方便地管理跨及其运行容器化的应用。

Kubernetes，基于容器技术的分布式架构领先方案

### Kubernetes的节点
Kubernetes由两种节点组成：master节点和node节点（minion），前者是管理节点，后者是容器运行的工作节点。

#### Master节点
集群控制节点，负责集群管理与控制，通常运行在独立物理节点或虚拟机

运行各类关键进程  
- API Server： 提供REST接口的关键服务进程
- Controller Manager：所有资源的自动化控制中心
- Scheduler：负责Pod资源调度
- Etcd Server：所有资源对象的数据全部保存在etcd中

#### Node节点
Kubernetes集群中除Master外的节点，又叫Minion，同样可以是物理主机或者虚拟机。

- 作为集群中的工作负载节点，承担Master分配的工作负载
- Node可以动态增删，新增node会自动到master节点注册

Node运行的进程：  
- kubelet：pod启停及与master节点协作
- kube-proxy：实现Kubernetes Service通信与负载均衡机制
- Docker Engine： 负责本机容器的创建和管理工作

### Pod
在Kubernetes中，能够被创建、调度和管理的最小部署单元是pod，而非单个容器。Pod是一组紧耦合的容器组合。

一个Pod内部的容器享有共同的生命周期：共同产生、调度和消亡。共享存储系统，共享命名空间：同一个IP地址和localhost，共享IPC。


- 为Service提供服务的容器进程被封装到Pod中，Pod中运行一个或者多个容器
- Kubernetes中采用Label来建立Serv与Pod之间的关系
- Pod运行在节点Node上，Node可以是物理机或者虚拟机
- 每个Pod中运行一个Pause容器和多个业务容器，这些业务容器共享Pause容器的网络栈和存储卷，数据交换效率更高。

#### 为啥要引入Pod？  
- Pause容器作为根容器，代表整个容器组的状态，避免个别容器导致Pod失效的情况
- 业务容器共享Pause容器的IP和Volume，解决业务容器之间的文件共享问题
- Kubernetes中的所有资源对象都可以采用vaml或者json格式的文件来定义或描述

#### Label
如何有效地分类和组织这些Pod？  
采用labels，每个Pod都有一个标签--一组键值对，用于对Pod进行选择和分类

键值对形式，附加各类资源对象，Node、Port、Service、RC
等  

#### Pod资源限制
资源限制方式：  
- Requests：最小申请量，分配时必须保证
- Limits：最大允许使用量，试图超过时，可能会被k8s kill并重启


### Service
- 唯一标识
- 负载均衡

Service用作代理Pod的IP地址，同时，为Pod做负载均衡

service主要有一个IP地址和一个label selector组成。

- 是Kubernetes中最核心的资源对象之一
- Pod、RC等其实都是Service

#### 如何访问服务
- 前端对服务的访问，由后端的Pod集群来提供
- 每个Pod都提供独立的EndPoint（Pod IP + Container Port）

访问请求如何映射到具体的Pod？  
- 开启负载均衡器kube-proxy，客户端通过负载均衡器调度到相应的pod
- 每个Service分配一个全局唯一的虚拟IP地址（Cluster IP）
- 用Service name和cluster IP作为DNS域名，就可以解决访问问题

外部系统访问Service？  
NodePort 

**Kube-proxy**是一个简单的网络代理和负载均衡器，它的作用主要是负责Service的实现，具体来说，就是实现了内部从Pod到Service和外部的从NodePort向Service的访问。

#### service的自发现机制
Kubernetes中有一个很重要的服务自发现特性。一旦一个service被创建，该service的portal信息都会被注入到已经在运行的pod中供它们使用。

Kubernetes主要支持两种服务发现机制：**容器环境变量和DNS**。

### volume
volume是Pod中多个容器共享的存储目录，与docker中的volume类似。
- 定义在Pod上，可以被一个Pod的多个容器挂载到具体的目录下
- 与Pod生命周期相同，但与容器不同，容器终止或重启时，数据不会丢失
- 支持多种类型的volume，如glusterfs，ceph等

由于容器的文件系统与容器的生命周期一致，当容器退出后其文件系统也随之被销毁，因此需要额外的持久化存储介质，为了实现持久化存储，需要声明一个磁盘卷（volume）作为Pod的一部分并将其挂载到容器中。

#### Kubernetes的volume类型
EmptyDir，pod分配到node时创建，无需指定宿主机目录文件，主要作用：
- 临时空间
- checkpoint临时保存目录
- 多容器共享目录

hostPath，挂载宿主机上的文件或目录
- 需要永久保存的文件，如日志文件
- 直接访问Docker引擎内部的文件系统

gcePersisentDisk  
awsElasticBlockStore  
NFS  

### HPA
Horizontal Pod Autoscaler，Pod横向自动扩容，是一种Kubernetes资源对象，实现原理----通过追踪分析RC控制的所有目标Pod的负载变化情况，来确定是否需要针对性的调整目标Pod的副本数。

### Scheduler
Schedule是根据特定的调度算法把Pod调度到指定的minion上，schedule调度器的输入时待调度的Pod以及可用的工作节点列表，输出则是应用调度算法从列表中选择的一个最优的用于绑定待调度Pod的节点。

#### 定向调度
NodeSelector。通过一系列负责调度算法，选定目标节点，可以通过定向调度迁移Pod

#### 亲和性调度
NodeAffinity，通过一系列逻辑运算，如Exists，in，Gt，lt等，更加灵活选取node

#### 特定场景调度--Deamon Set


#### 批处理调度
通过Job资源支持批处理任务

### kubelet
kubelet组件是Kubernetes集群工作节点上最重要的组件进程，它管理和维护在这台主机上运行着的所有容器。本质上，它的工作可以归结为使得pod的运行状态status与它的期望值spec一致。

负责Pod对应的容器创建、启停等任务，同时与master节点密切协作，实现集群管理的基本功能。

kubelet的主要场景：  
- 节点管理：监控和汇报当前节点健康状态
- 容器管理：管理容器的生命周期，容器的增删改查以及其他行为
- 健康检查：利用容器探针进行应用业务层面的健康检查和故障恢复
- 资源监控：集成cAdviser搜集主机和容器的资源使用信息

### CRI--Container Runtime Interface
CRI是k8s设计的容器运行时接口，只要符合这个接口的容器运行时都可以和Kubernetes进行集成

Kubernetes节点的底层有一个叫做“容器运行时”的软件进行支撑，它负责比如启停容器这样的事情。

CRI---一个能让Kubelet无需编译就可以支持多种容器运行时的插件接口

### 网络模型
#### CNM----Container Network Model
CNM网络模型，是docker公司提出的容器网络模型，主要有network sandbox、endpoint、network三个组件进行实现，network sandbox容器内部的网络栈，包括网络接口、路由表、DNS等配置的管理endpoint用于将容器内的sandbox与外部网络相连的网络接口。


#### CNI----Container Network Interface
容器网络接口，是一种操作容器网络规范，包含方法规范，参数规范等。CNI只关心容器的网络连接，在容器创建时分配网络资源，并在删除容器时删除分配的资源。因为这个焦点，CNI有广泛的支持，规格易于实现。CNI接口只需要实现两个方法，一个创建容器时调用，一个删除容器时调用。

#### Flannel
Flannel（overlay network 覆盖网络）的设计目的就是为集群中的所有节点重新规划IP地址的使用规则，从而使得不同节点上的容器能够获得“同属一个内网”且“不重复的”IP地址，并让属于不同节点上的容器能够直接通过内网IP通信

#### Calico
- 纯三层协议，为OpenStack和容器提供多主机通信，不适用overlay
- 使用虚拟路由代替虚拟交换机，通过BGP协议实现传输

### Kubernetes的设计原则
- 声明式 状态驱动，用户通过声明式的配置文件（如YAML文件）向Kubernetes告白自己希望达到的希望状态
- 行动React，Kubernetes的控制组件负责具体执行这些指令，使得用户声明的系统状态得以实现，在此过程中不需要任何人工的参与。
- 观测Observe，k8s会观测到新的用户声明，并自动分析出需要执行的操作以达到用户声明的系统状态。

### 常见的存储模式
enptyDir  
hostPath  
nfs  
flocker  
glusterfs  
rbd  
cephfs  
gitRepo  


### 常见的监控工具
- cAdvisor：分析正在运行的容器的资源使用情况和性能特点
- heapster：计算容器集群的资源使用分析和监控
- influxdb：指标，事件和实时分析的可扩展数据存储
- grafana：为Graphite，InfluxDB、Prometheus等提供漂亮的监视和度量分析和仪表板的工具

docker监控工具：  
- cAdvisor  
- datadog
- Prometheus

### 全链路监控原理
TraneID：识别用户一次请求，所有全链路上的节点共用一个TraceID  
生成机制：调用链的第一个节点生成TraceID，每次调用判断此次调用的请求中是否含有TraceID，未含有TraceID即为调用链路的第一个节点，如果含有TraceID，则肯定不为第一个节点，继续使用上个节点传递过来的TraceID

SpanID：正在处理用户请求的节点  
生成机制：SpanID使用UUID随机数生成机制即可，保证唯一性，每次请求都有唯一的spanID

ParentSpanID：正在处理用户请求节点的上一个节点  
生成机制：使用上一个节点传递过来SpanID替代

三者的传递机制：  
- Restful接口、webservice等服务调用，实际底层走的协议是HTTP协议，所以只需要在HTTP Request请求中添加TraceID、SpanID、ParentSpanID
- Dubbo等RPC调用框架，需要在扩展域添加TraceID、SpanID、ParentSpanID
- MQ等消息中间件，需要在消息中间件支持的扩展域添加TraceID、SpanID、ParentSpanID

### Prometheus特点
Prometheus是一种开源监控报警系统和时序列数据库。它能够按照给定的时间间隔收集所配置目标的指标、执行规则表达式、展现结果，如果某些条件判断结果为真的话，将会触发告警。

**特点**：  
- 单机缺点，单机下存储量有限，根据你的监控量局限你的存储时间
- 内存占用率大，Prometheus集成了leveldb，一个能高效插入数据的数据库，在ssd盘下io占用比较高。同时可能会有大量数据堆积内存。

## Devops
DevOps(Development和Operations的组合词)，强调的是高效组织团队之间如何通过自动化的工具协作和沟通来完成软件的生命周期管理，从而更快的、更频繁的交付更加稳定的软件。

## 微服务
- 一种架构风格，架构模式
- 高内聚低耦合、单一职责、基于限界上下文的一种SOA落地方式
- 服务能够独立构建，独立部署，独立扩展
- 基于Devops，面向运维的架构
- 需要团队组织，文化的调整以及完善的自动化工具
- 实施中体现为，受业务驱动，不断迭代

