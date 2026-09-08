---
title: "了解Kubernetes中的资源类型"
date: 2020-06-15T18:36:30+08:00
draft: false
tags: ["Kubernetes"]
categories: ["学习记录"]
keywords: ["Kubernetes"]  
description: "了解Kubernetes中的资源类型"  
author: "vicebery"
---
-----
## Object in Kubernetes
在 Kubernetes 系统中，Kubernetes 对象 是持久化的条目。Kubernetes 使用这些条目去表示整个集群的状态。特别地，它们描述了如下信息：
- 什么容器化应用在运行（以及在哪个 Node 上）
- 可以被应用使用的资源
- 关于应用如何表现的策略，比如重启策略、升级策略，以及容错策略

简单地可分为以下几类：

| 类别 | 名称 |
|  ----  | ----  |
| 资源对象 | Pod、ReplicaSet、ReplicationController、Deployment、StatefulSet、DaemonSet、Job、CronJob、HorizontalPodAutoscaling、Node、Namespace、Service、Ingress、Label、CustomResourceDefinition |
| 存储对象 | Volume、PersistentVolume、Secret、ConfigMap |
| 策略对象 | SecurityContext、ResourceQuota、LimitRange |
| 身份对象 | ServiceAccount、Role、ClusterRole |

## Pod
Pod 是 Kubernetes 集群中能够被创建和管理的最小部署单元，一个Pod里面可以运行多个容器。每个Pod会被分配一个唯一的IP地址，里面的所有容器共享这个网络空间（IP地址以及端口），Pod内部通信使用`localhost`，外部通信，则需使用Pod的IP和端口。

Pod的生成基于Namespace和Cgroup，Namespace用于进程之间的隔离，Cgroup用于控制进程资源的使用；Namespace由hostname、PID、filesystem、network、IPC组成。

`Kubernetes`初始化一个Pod时会先启动一个叫`Pause`的容器，然后再启动用户自定义的业务容器。`Pause`容器的作用： 扮演
`PID 1`的角色，处理僵尸进程；在Pod里为其他容器共享Linux namespace的基础。

Pod的资源使用，申请CPU和内存：
```
resources:
  requests:
    memory: 1Gi
    cpu: 50m
  limits:
    memory: 2Gi
    cpu: 100m
```
在YAML里定义CPU和内存的使用量和限制，如果容器达到了CPU的限定值，就会开始限制，容器性能会下降，但不会终止和退出。如果容器使用内存资源达到了上限，就会OOM，造成内存溢出，容器就会终止和退出。


[Pod实现原理、网络通信](https://www.escapelife.site/posts/1b2fd738.html#!)
 
 [创建Pod的过程剖析](https://fatsheep9146.github.io/2018/07/22/kubelet%E5%88%9B%E5%BB%BAPod%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/)
 
 [kubernetes 中 Qos](https://cloud.tencent.com/developer/article/1583670)
 
很多资源对象是在Pod的基础上衍生而来，通过设定各种部署、调度策略来管理pod，以此满足更复杂、更常见的应用场景，下面对这些更常用的资源对象进行介绍。
### ReplicaSet
ReplicaSet 主要的作用是维持一组 Pod 副本的运行，它的主要作用就是保证一定数量的 Pod 能够在集群中正常运行，它会持续监听这些 Pod 的运行状态，在 Pod 发生故障重启数量减少时重新运行新的 Pod 副本。
 
 ### Deployment
Deployment 提供了一种对 Pod 和 ReplicaSet 的管理方式，每一个 Deployment 都对应集群中的一次部署，是非常常见的 Kubernetes 对象。用来替代以前的 ReplicationController 来方便的管理应用。

典型的应用场景：  
- 定义Deployment 来创建 Pod 和 ReplicaSet
- 滚动升级和回滚应用
- 扩容和缩容
- 暂停和继续 Deployment

### StatelfulSet
 Statefulset区别于Deployment，Deployment用于部署无状态服务，StatefulSet用来部署有状态服务。
 
 部署的应用满足以下一个或多个部署需求，则建议使用StatefulSet：
- 稳定的、唯一的网络标识。
- 稳定的、持久的存储。
- 有序的、优雅的部署和伸缩。
- 有序的、优雅的删除和停止。
- 有序的、自动的滚动更新。
 
StatefulSet对应Pod的存储最好通过StorageClass来动态创建：每个Pod都会根据StatefulSet中定义的VolumeClaimTemplate来创建一个对应的PVC，然后PVC通过StorageClass自动创建对应的PV，并挂载给Pod。所以这种方式，需要你事先创建好对应的StorageClass。当然，你也可以通过预先由管理员手动创建好对应的PV，只要能保证自动创建的PVC能和这些PV匹配上。

[PV的动态创建和静态创建](https://www.cnblogs.com/yanh0606/p/11269142.html)

删除或者收缩 StatefulSet 并不会删除它关联的存储卷。这样做是为了保证数据安全，它通常比自动清除 StatefulSet 所有相关的资源更有价值。
 
volumeClaimTemplates 将通过 PersistentVolumes 驱动提供的 PersistentVolumes 来提供稳定的存储。
 
 Kubernetes 为每个 VolumeClaimTemplate 创建一个 PersistentVolume。当 Pod 或者 StatefulSet 被删除时，与 PersistentVolumeClaims 相关联的 PersistentVolume 并不会被删除，PersistentVolumeClaims 也不会被删除
 
### DaemonSet
DaemonSet 确保全部（或者一些）Node 上运行一个 Pod 的副本。当有 Node 加入集群时，也会为他们新增一个 Pod 。当有 Node 从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。常用来部署一些集群的日志、监控或者其他系统管理应用。

### Job 和 CronJob
`Job` 和 `CronJob` 两个资源分别提供了一次性任务和定时任务。

`Job`负责批量处理短暂的一次性任务 (`short lived one-off tasks`)，即仅执行一次的任务，它保证批处理任务的一个或多个Pod成功结束。

`CronJob`即定时任务，就类似于`Linux`系统的`crontab`，在指定的时间周期运行指定的任务。
    
## HPA
Pod 水平自动伸缩（`Horizontal Pod Autoscaler`），可以基于CPU利用率自动伸缩 `replication controller`、`deployment`和 `replicaset` 中的 pod 数量，（除了 CPU 利用率）也可以 基于其他应程序提供的度量指标`custom metrics`。 pod 自动缩放不适用于无法缩放的对象，比如 `DaemonSets`。HPA 通过监控分析一些控制器控制的所有 Pod 的负载变化情况来确定是否需要调整 Pod 的副本数量。

通过 `kubectl autoscale` 命令来创建一个 HPA 资源对象，`HPA Controller`默认30s轮询一次（可通过 `kube-controller-manager` 的`--horizontal-pod-autoscaler-sync-period` 参数进行设置），查询指定的资源中的 Pod 资源使用率，并且与创建时设定的值和指标做对比，从而实现自动伸缩的功能。
 
## Service
每一个 Kubernetes 的 Service 都是一组 Pod 的逻辑集合和访问方式的抽象，我也可以把 Service 加上的一组 Pod 称作是一个微服务。

[Service的实现原理](https://draveness.me/kubernetes-service/)
## Volume
卷(Volume)中的数据的生命周期，与 `volume` 背后是由哪种存储方式提供强相关，这与[官方文档](https://kubernetes.io/zh/docs/concepts/storage/volumes/)中介绍`【Kubernetes 卷具有明确的生命周期——与包裹它的 Pod 相同】`有所差别，原因是新的版本提供了更丰富更实用的方式来持久化数据。
 
`Kubernetes` 可以支持许多类型的卷，Pod 也能同时使用任意数量的卷。

Volume 的常见类型：
- ConfigMap
- emptyDir
- hostPath
- local
- nfs
- persistentVolumeClaim
- secret

下面简单介绍下其中的几种：
- configmap：常用于为业务提供启动配置文件，这种小文件读取的需求；特点是只读，并且生命周期独立于 pod，即 pod 消失 configmap 仍旧存在
- emptyDir：常用于同一个 pod 中的多个 container 进行少量文件的数据共享；特点是可读写，但是读写性能有限（取决于 kubelet 业务数据盘背后采用什么存储），并且没有 quota 限制，生命周期和 pod 完全一致，pod 被销毁，emptyDir 也会被删除
- hostPath: 常用于 pod 希望访问主机上的某一个路径的场景，特点是可读写，生命周期独立于 pod
- persistentVolumeClaim：最新的一种让 pod 申请 volume 存储的形式，pod 可以通过创建一个 persistentVolumeClaim 对象来指明自己对这块 volume 存储的需求，比如大小，存储类型（比如 nfs，ceph rbd），生命周期完全独立于 pod。

`persistentVolumeClaim`是很常用的一种方式，当`Volume` 的类型为`persistentVolumeClaim` 时，`persistentVolumeClaim`所申请的 `PersistentVolume` 的生命周期与Pod 不同，即使Pod被删除，`persistentVolumeClaim`和`PersistentVolume`也不会被删除，这也体现了数据的**持久化**。

